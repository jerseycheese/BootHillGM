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

    /// Controls the visibility of the "Continue" button
    @Published var showContinueButton: Bool = false
    
    /// The current stage of character creation. This is used for both progression tracking and metadata.
    @Published private(set) var currentStep: CharacterCreationStage = .name

    /// Indicates whether the current stage of character creation is complete
    @Published private(set) var isCurrentStageComplete: Bool = false

    private let aiService: AIService
    /// The service responsible for handling dice rolls
    private let diceRollService: DiceRollService
    private var gameCore: GameCore?
    private var character: Character?
    
    // Flag to track if background has been provided by the user
    private var hasProvidedBackground = false
    // Flag to track if background response has been generated
    private var hasGeneratedBackgroundResponse = false
    
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
    
    /// Adds a user message to the conversation, including metadata about the current creation stage.
    private func addUserMessage(_ message: String) {
        messages.append(Message(content: message, isAI: false, metadata: MessageMetadata(stage: currentStep)))
    }
    
    /// Adds an AI message to the conversation, including metadata about the current creation stage and debug info.
    private func addAIMessage(_ message: String) {
        messages.append(Message(content: message, isAI: true, metadata: MessageMetadata(stage: currentStep, debugInfo: "AI response for \(currentStep)")))
    }
    
    /// Generates an AI response based on the current context and user input
    /// - Parameter userInput: The latest input from the user
    private func generateAIResponse(userInput: String) {
        isProcessing = true
        waitingForUserInput = false
        showContinueButton = false
        
        Task {
            do {
                let context = buildContext(userInput: userInput)
                let aiResponse = try await aiService.generateCharacterCreationResponse(context: context, userInput: userInput)
                
                await MainActor.run {
                    addAIMessage(aiResponse)
                    isProcessing = false
                    waitingForUserInput = true

                    if currentStep == .attributesRolling {
                        isCurrentStageComplete = true
                    }

                    if isCurrentStageComplete || currentStep == .complete {
                        showContinueButton = true
                    } else {
                        handleNextStepInCurrentStage()
                    }
                }
            } catch {
                print("Error generating AI response: \(error.localizedDescription)")
                await MainActor.run {
                    addAIMessage("I'm sorry, there was an error generating a response. Please try again.")
                    isProcessing = false
                    waitingForUserInput = true
                    showContinueButton = true // Show button even on error to allow progression
                }
            }
        }
    }

    /// Handles special cases after receiving an AI response
    private func handleSpecialCases() {
        switch currentStep {
        case .attributesExplanation:
            currentStep = .attributesRolling
            generateAttributesResponse()
        case .abilitiesExplanation:
            currentStep = .abilitiesRolling
            generateAbilitiesResponse()
        case .attributesRolling:
            currentStep = .abilitiesExplanation
            generateAIResponse(userInput: "move to abilities explanation")
        case .abilitiesRolling:
            currentStep = .background
            generateAIResponse(userInput: "move to background")
        case .background:
            // Handle the two-step process for background
            if !hasProvidedBackground {
                // First step: Ask for background
                generateAIResponse(userInput: "Ask for character background")
            } else if !hasGeneratedBackgroundResponse {
                // Second step: Generate response to provided background
                generateBackgroundResponse()
            }
        default:
            break
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
                context += "Attributes: \(character.attributes.map { "\(capitalizeCharacterTrait($0.key.rawValue)): \($0.value)" }.joined(separator: ", "))\n"
            }
            if !character.abilities.isEmpty {
                context += "Abilities: \(character.abilities.map { "\(capitalizeCharacterTrait($0.key.rawValue)): \($0.value.percentile)% (Rating: \($0.value.rating))" }.joined(separator: ", "))\n"
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
            context += "The attributes have been rolled. Provide a brief explanation of what each attribute means and how it might affect the character in the Boot Hill setting. Do not ask any questions or prompt the user for input. Do not move to the next step."
        case .abilitiesExplanation:
            context += "Explain that you are about to generate the character's abilities. Describe the process of determining percentile scores and ratings for each ability in Boot Hill. Do not generate any ability scores yet."
        case .abilitiesRolling:
            context += "The abilities have been generated. Provide a brief explanation of what each ability means and how it might affect the character in the Boot Hill setting. Do not ask any questions or prompt the user for input. Do not move to the next step."
        case .background:
            if !hasProvidedBackground {
                context += "Ask for a brief background of the character. Do not ask for any other information."
            } else {
                context += "Provide a brief response to the character's background. Highlight interesting aspects and how they might influence the character's adventures in the Wild West. Do not ask any questions or prompt for more information."
            }
        case .complete:
            context += "Summarize the character and conclude the creation process."
        @unknown default:
            context += "Unknown step. Please provide general information about character creation in Boot Hill."
        }
        
        return context
    }

    /// Handles the progression to the next stage of character creation
    func continueToNextStage() {
        showContinueButton = false
        isCurrentStageComplete = false
        switch currentStep {
        case .name:
            currentStep = .age
            generateAIResponse(userInput: "Ask for character's age")
        case .age:
            currentStep = .occupation
            generateAIResponse(userInput: "Ask for character's occupation")
        case .occupation:
            currentStep = .attributesExplanation
            generateAIResponse(userInput: "Explain attributes")
        case .attributesExplanation:
            currentStep = .attributesRolling
            generateAttributesResponse()
        case .attributesRolling:
            currentStep = .abilitiesExplanation
            generateAIResponse(userInput: "Explain abilities")
        case .abilitiesExplanation:
            currentStep = .abilitiesRolling
            generateAbilitiesResponse()
        case .abilitiesRolling:
            currentStep = .background
            generateAIResponse(userInput: "Ask for character background")
        case .background:
            if !hasProvidedBackground {
                // If background hasn't been provided, ask for it
                generateAIResponse(userInput: "Ask for character background")
            } else {
                // If background has been provided and responded to, move to complete
                currentStep = .complete
                summarizeCharacter()
            }
        case .complete:
            // Handle completion of character creation
            break
        @unknown default:
            break
        }
    }
    
    /// Processes the user's input based on the current creation step
    /// - Parameter input: The user's input
    private func processUserInput(_ input: String) {
        switch currentStep {
        case .name:
            createCharacter(name: input.trimmingCharacters(in: .whitespacesAndNewlines))
            // Don't show continue button after name input
            showContinueButton = false
        case .age:
            if let age = extractAge(from: input) {
                character?.age = age
                currentStep = .occupation
                // Don't show continue button after age input
                showContinueButton = false
                generateAIResponse(userInput: "age set to \(age)")
            } else {
                generateAIResponse(userInput: "Invalid age")
            }
        case .occupation:
            if let occupation = extractOccupation(from: input) {
                character?.occupation = occupation
                currentStep = .attributesExplanation
                showContinueButton = true
                generateAIResponse(userInput: "occupation set to \(occupation)")
            } else {
                generateAIResponse(userInput: "Invalid occupation")
            }
        case .attributesExplanation:
            currentStep = .attributesRolling
            showContinueButton = true
            generateAIResponse(userInput: "Ready to roll attributes")
        case .attributesRolling:
            // After rolling attributes, move to abilities explanation
            currentStep = .abilitiesExplanation
            showContinueButton = true
            generateAIResponse(userInput: "Attributes rolled, ready for abilities explanation")
        case .abilitiesExplanation:
            currentStep = .abilitiesRolling
            showContinueButton = true
            generateAIResponse(userInput: "Ready to roll abilities")
        case .abilitiesRolling:
            // After rolling abilities, move to background
            currentStep = .background
            showContinueButton = false
            generateAIResponse(userInput: "Abilities rolled, ready for background")
        case .background:
            // Handle the first step of the background process
            if !hasProvidedBackground {
                character?.background = input
                hasProvidedBackground = true
                generateBackgroundResponse()
            }
        case .complete:
            generateAIResponse(userInput: "Character creation complete")
        @unknown default:
            print("Unknown character creation step")
            generateAIResponse(userInput: "Continue character creation")
        }
    }
    
    /// Creates a new character with the given name
    /// - Parameter name: The character's name
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

    /// Handles the next step within the current stage of character creation
    private func handleNextStepInCurrentStage() {
        switch currentStep {
        case .attributesRolling:
            if !isCurrentStageComplete {
                generateAttributesResponse()
            }
        case .abilitiesRolling:
            if !isCurrentStageComplete {
                generateAbilitiesResponse()
            }
        default:
            // For stages that complete in one AI response
            isCurrentStageComplete = true
            showContinueButton = true
        }
    }

    /// Generates attribute scores and combines them with the AI response
    private func generateAttributesResponse() {
        // Use the DiceRollService to generate attribute scores for all attributes
        let attributeScores = diceRollService.generateAttributeScores()
        character?.attributes = attributeScores
        
        // Display attributes clearly, each on a new line
        let attributeDescription = Attribute.allCases.map { attribute in
            "\(capitalizeCharacterTrait(attribute.rawValue)): \(attributeScores[attribute] ?? 0)"
        }.joined(separator: "\n")
        
        let attributeMessage = "Here are your character's attributes:\n\n\(attributeDescription)"
        
        // Add the attribute message first
        addAIMessage(attributeMessage)
        
        // Then generate AI response to explain the attributes
        generateAIResponse(userInput: "Explain attributes: \(attributeDescription)")
        
        // Mark the stage as complete after the AI response
        isCurrentStageComplete = true
    }

    /// Generates ability scores and combines them with the AI response
    private func generateAbilitiesResponse() {
        // Generate ability scores for all abilities using the DiceRollService
        let abilityScores = diceRollService.generateAbilityScores()
        character?.abilities = abilityScores
        
        // Create a description of the abilities with proper capitalization
        let abilityDescription = BootHillAbility.allCases.map { ability in
            let score = abilityScores[ability] ?? AbilityScore(percentile: 0, rating: 0)
            return "\(capitalizeCharacterTrait(ability.rawValue)): \(score.percentile)% (Rating: \(score.rating))"
        }.joined(separator: "\n")
        
        let abilityMessage = "Here are your character's abilities:\n\n\(abilityDescription)"
        
        // Generate AI response to explain the abilities without asking questions
        Task {
            do {
                let context = buildContext(userInput: "Explain abilities: \(abilityDescription)")
                let aiExplanation = try await aiService.generateCharacterCreationResponse(context: context, userInput: "Explain abilities: \(abilityDescription)")
                
                await MainActor.run {
                    // Combine the ability scores and AI explanation into a single message
                    let combinedMessage = "\(abilityMessage)\n\n\(aiExplanation)"
                    addAIMessage(combinedMessage)
                    
                    // Mark the stage as complete and show the continue button
                    isCurrentStageComplete = true
                    showContinueButton = true
                }
            } catch {
                print("Error generating AI response for abilities: \(error.localizedDescription)")
                await MainActor.run {
                    isCurrentStageComplete = true
                    showContinueButton = true
                }
            }
        }
    }
    
    /// Generates an AI response to the character's background
    private func generateBackgroundResponse() {
        guard let background = character?.background else {
            print("Error: Character background is missing")
            addAIMessage("I'm sorry, there was an error processing your character's background. Please try again.")
            return
        }
        
        Task {
            do {
                let context = buildContext(userInput: "Respond to background: \(background)")
                let aiResponse = try await aiService.generateCharacterCreationResponse(context: context, userInput: "Respond to background: \(background)")
                
                await MainActor.run {
                    addAIMessage(aiResponse)
                    hasGeneratedBackgroundResponse = true
                    isCurrentStageComplete = true
                    showContinueButton = true
                }
            } catch {
                print("Error generating AI response for background: \(error.localizedDescription)")
                await MainActor.run {
                    addAIMessage("I'm sorry, there was an error responding to your character's background. Please try again.")
                    hasProvidedBackground = false // Reset this flag to allow the user to try again
                    showContinueButton = true 
                }
            }
        }
    }
    
    /// Summarizes the created character with all attributes and abilities
    private func summarizeCharacter() {
        guard let character = character else {
            addAIMessage("I'm sorry, there was an error summarizing your character. Please try creating your character again.")
            return
        }
        
        // Summarize all attributes
        let attributesSummary = Attribute.allCases.map { attribute in
            "\(capitalizeCharacterTrait(attribute.rawValue)): \(character.attributes[attribute] ?? 0)"
        }.joined(separator: "\n")
        
        // Summarize all abilities
        let abilitiesSummary = BootHillAbility.allCases.map { ability in
            let score = character.abilities[ability] ?? AbilityScore(percentile: 0, rating: 0)
            return "\(capitalizeCharacterTrait(ability.rawValue)): \(score.percentile)% (Rating: \(score.rating))"
        }.joined(separator: "\n")
        
        let summary = """
        Character Creation Complete! Here's a summary of your character:

        Name: \(character.name)
        Age: \(character.age ?? 0)
        Occupation: \(character.occupation ?? "Unknown")
        
        Attributes:
        \(attributesSummary)
        
        Abilities:
        \(abilitiesSummary)
        
        Background: \(character.background ?? "Not provided")

        Your character is now ready for adventure in the Wild West! Good luck, partner!
        """
        
        addAIMessage(summary)
        isCurrentStageComplete = true
        showContinueButton = true
    }

    /// Extracts the age from the user's response
    /// - Parameter response: The user's input
    /// - Returns: The extracted age as an Int, or nil if not found
    private func extractAge(from response: String) -> Int? {
        let words = response.components(separatedBy: .whitespacesAndNewlines)
        return words.compactMap { Int($0) }.first
    }
    
    /// Extracts the occupation from the user's response
    /// - Parameter response: The user's input
    /// - Returns: The extracted occupation as a String, or nil if not found
    private func extractOccupation(from response: String) -> String? {
        return response.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// Capitalizes the first letter of each word in the character trait name
    /// This function is used for both attributes and abilities to ensure consistent capitalization
    /// - Parameter name: The character trait name to capitalize
    /// - Returns: The capitalized character trait name
    private func capitalizeCharacterTrait(_ name: String) -> String {
        return name.split(separator: " ").map { $0.prefix(1).uppercased() + $0.dropFirst().lowercased() }.joined(separator: " ")
    }
}
