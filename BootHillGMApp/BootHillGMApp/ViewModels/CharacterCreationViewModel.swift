import Foundation
import Combine

class CharacterCreationViewModel: ObservableObject {
    /// The collection of messages in the chat.
    @Published var messages: [BootHillGMApp.Message] = []
    
    /// The current user input in the text field.
    @Published var userInput: String = ""
    
    /// Indicates whether the AI is currently processing a response.
    @Published var isProcessing = false
    
    /// Indicates whether the view is waiting for user input.
    @Published var waitingForUserInput = false
    
    private let aiService: AIService
    /// The service responsible for handling dice rolls
    private let diceRollService: DiceRollService
    private var gameCore: GameCore?
    private var character: Character?
    private var currentStep: CreationStep = .name
    
    enum CreationStep: String {
        case name, age, occupation, attributesExplanation, attributesRolling, abilitiesExplanation, abilitiesRolling, background, complete
    }
    
    /// Initializes the CharacterCreationViewModel with required services
    /// - Parameters:
    ///   - aiService: The service for AI-assisted character creation
    ///   - diceRollService: The service for handling dice rolls
    init(aiService: AIService, diceRollService: DiceRollService) {
        self.aiService = aiService
        self.diceRollService = diceRollService
    }
    
    /// Starts the conversation with the AI for character creation.
    func startConversation(gameCore: GameCore) {
        self.gameCore = gameCore
        currentStep = .name
        generateAIResponse(userInput: "start character creation")
    }
    
    /// Sends the user's message and processes it.
    func sendMessage() {
        guard !userInput.isEmpty else { return }
        let currentInput = userInput
        addUserMessage(currentInput)
        processUserInput(currentInput)
        userInput = ""
    }
    
    /// Adds a user message to the chat.
    private func addUserMessage(_ message: String) {
        messages.append(BootHillGMApp.Message(content: message, isAI: false))
    }
    
    /// Adds an AI message to the chat.
    private func addAIMessage(_ message: String) {
        messages.append(BootHillGMApp.Message(content: message, isAI: true))
    }
    
    private func generateAIResponse(userInput: String) {
        guard !isProcessing else { return }
        isProcessing = true
        waitingForUserInput = false
        
        Task {
            do {
                let context = buildContext(userInput: userInput)
                let aiResponse = try await aiService.generateCharacterCreationResponse(context: context, userInput: userInput)
                
                await MainActor.run {
                    addAIMessage(aiResponse)
                    isProcessing = false
                    waitingForUserInput = true
                    
                    // Handle special cases after AI response
                    if self.currentStep == .attributesExplanation {
                        self.currentStep = .attributesRolling
                        self.generateAndDisplayAttributes()
                    } else if self.currentStep == .attributesRolling {
                        self.currentStep = .abilitiesExplanation
                        self.generateAIResponse(userInput: "move to abilities explanation")
                    } else if self.currentStep == .abilitiesExplanation {
                        self.currentStep = .abilitiesRolling
                        self.generateAndDisplayAbilities()
                    } else if self.currentStep == .abilitiesRolling {
                        self.currentStep = .background
                        self.generateAIResponse(userInput: "move to background")
                    }
                }
            } catch {
                print("Error generating AI response: \(error.localizedDescription)")
                await MainActor.run {
                    addAIMessage("I'm sorry, there was an error processing your input. Please try again.")
                    isProcessing = false
                    waitingForUserInput = true
                }
            }
        }
    }
    
    /// Builds the context for the AI service, providing instructions based on the current step
    /// - Parameter userInput: The latest input from the user
    /// - Returns: A string containing the context and instructions for the AI
    private func buildContext(userInput: String) -> String {
        var context = "Current step: \(currentStep.rawValue)\n"
        context += "Character creation progress:\n"
        if let character = character {
            context += "Name: \(character.name)\n"
            if let age = character.age {
                context += "Age: \(age)\n"
            }
            if let occupation = character.occupation {
                context += "Occupation: \(occupation)\n"
            }
            if !character.attributes.isEmpty {
                context += "Attributes: \(character.attributes.map { "\($0.key): \($0.value)" }.joined(separator: ", "))\n"
            }
            if !character.abilities.isEmpty {
                context += "Abilities: \(character.abilities.map { "\($0.key.rawValue): \($0.value.percentile)% (Rating: \($0.value.rating))" }.joined(separator: ", "))\n"
            }
            if let background = character.background {
                context += "Background: \(background)\n"
            }
        }
        context += "\nUser input: \(userInput)\n"
        
        // Global instructions to prevent unwanted AI behavior
        context += "\nInstructions: Focus only on the current step. Do not reference or ask about information from previous steps. Do not ask about or mention any steps that haven't happened yet. Do not ask any questions or prompt the user for input. "
        
        // Step-specific instructions
        switch currentStep {
        case .name:
            context += "Ask for the character's name. Do not ask for any other information."
        case .age:
            context += "Ask for the character's age. Do not ask for any other information."
        case .occupation:
            context += "Ask for the character's occupation. Do not ask for any other information."
        case .attributesExplanation:
            context += "Explain that you are about to roll virtual dice for the attributes. Describe the dice rolling process (3d6 for each attribute) and its significance in Boot Hill. Do not roll the dice or provide any attribute values yet."
        case .attributesRolling:
            // Specific instructions to prevent AI from asking questions about attributes
            context += "The attributes have been rolled. Provide a brief explanation of what each attribute means and how it might affect the character in the Boot Hill setting. Do not ask any questions or prompt the user for input. Do not move to the next step."
        case .abilitiesExplanation:
            context += "Explain that you are about to generate the character's abilities. Describe the process of determining percentile scores and ratings for each ability in Boot Hill. Do not generate any ability scores yet."
        case .abilitiesRolling:
            context += "The abilities have been generated. Provide a brief explanation of what each ability means and how it might affect the character in the Boot Hill setting. Do not ask any questions or prompt the user for input. Do not move to the next step."
        case .background:
            context += "Ask for a brief background of the character. Do not ask for any other information."
        case .complete:
            context += "Summarize the character and conclude the creation process."
        }
        
        return context
    }
    
    private func processUserInput(_ input: String) {
        switch currentStep {
        case .name:
            createCharacter(name: input.trimmingCharacters(in: .whitespacesAndNewlines))
        case .age:
            if let age = extractAge(from: input) {
                character?.age = age
                currentStep = .occupation
                generateAIResponse(userInput: "age set to \(age)")
            } else {
                generateAIResponse(userInput: "Invalid age")
            }
        case .occupation:
            if let occupation = extractOccupation(from: input) {
                character?.occupation = occupation
                currentStep = .attributesExplanation
                generateAIResponse(userInput: "occupation set to \(occupation)")
            } else {
                generateAIResponse(userInput: "Invalid occupation")
            }
        case .attributesExplanation, .attributesRolling, .abilitiesExplanation, .abilitiesRolling:
            // These steps are handled automatically after AI response
            break
        case .background:
            character?.background = input
            currentStep = .complete
            summarizeCharacter()
        case .complete:
            // Character creation is already complete, no action needed
            generateAIResponse(userInput: "Character creation complete")
        }
    }
    
    private func createCharacter(name: String) {
        guard let gameCore = gameCore else {
            print("Error: GameCore not initialized")
            addAIMessage("I'm sorry, there was an error creating your character. Please try again.")
            return
        }
        
        gameCore.createCharacter(name: name) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let newCharacter):
                    self.character = newCharacter
                    self.currentStep = .age
                    self.generateAIResponse(userInput: "Character created with name: \(name)")
                case .failure(let error):
                    print("Error creating character: \(error.localizedDescription)")
                    self.addAIMessage("I'm sorry, there was an error creating your character. Let's try again. What would you like your character's name to be?")
                    // Keep the current step as .name
                    self.generateAIResponse(userInput: "Error creating character")
                }
            }
        }
    }
    
    /// Generates attribute scores using dice rolls and displays them to the user
    private func generateAndDisplayAttributes() {
        // Use the DiceRollService to generate attribute scores
        let attributeScores = diceRollService.generateAttributeScores()
        character?.attributes = attributeScores
        
        // Display attributes clearly, each on a new line
        let attributeDescription = attributeScores.map { "\($0.key): \($0.value)" }.joined(separator: "\n")
        addAIMessage("Here are your character's attributes:\n\n\(attributeDescription)")
        
        // Generate AI response to explain the attributes without asking questions
        generateAIResponse(userInput: "Explain attributes: \(attributeDescription)")
    }
    
    private func generateAndDisplayAbilities() {
        let abilityScores = diceRollService.generateAbilityScores()
        character?.abilities = abilityScores
        
        let abilityDescription = abilityScores.map { "\($0.key.rawValue): \($0.value.percentile)% (Rating: \($0.value.rating))" }.joined(separator: "\n")
        addAIMessage("Here are your character's abilities:\n\n\(abilityDescription)")
        
        generateAIResponse(userInput: "Explain abilities: \(abilityDescription)")
    }
    
    private func summarizeCharacter() {
        guard let character = character else {
            addAIMessage("I'm sorry, there was an error summarizing your character. Please try creating your character again.")
            return
        }
        
        let summary = """
        Name: \(character.name)
        Age: \(character.age ?? 0)
        Occupation: \(character.occupation ?? "Unknown")
        Attributes: \(character.attributes.map { "\($0.key): \($0.value)" }.joined(separator: ", "))
        Abilities: \(character.abilities.map { "\($0.key.rawValue): \($0.value.percentile)% (Rating: \($0.value.rating))" }.joined(separator: ", "))
        Background: \(character.background ?? "Not provided")
        """
        
        generateAIResponse(userInput: "Character summary: \(summary)")
    }
    
    private func extractAge(from response: String) -> Int? {
        let words = response.components(separatedBy: .whitespacesAndNewlines)
        return words.compactMap { Int($0) }.first
    }
    
    private func extractOccupation(from response: String) -> String? {
        return response.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
