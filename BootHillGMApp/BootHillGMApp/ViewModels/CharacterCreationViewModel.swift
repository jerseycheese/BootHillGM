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

    /// Indicates whether the view should show the text input field
    @Published var showTextInput: Bool = true

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
        setInitialState()
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

    /// Sets the initial state for the character creation process
    private func setInitialState() {
        showTextInput = true
        showContinueButton = false
        waitingForUserInput = true
        isProcessing = false
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
        // Set initial UI state
        isProcessing = true
        waitingForUserInput = false
        showTextInput = false
        showContinueButton = false
        
        Task {
            do {
                let context = buildContext(userInput: userInput)
                let aiResponse = try await aiService.generateCharacterCreationResponse(context: context, userInput: userInput)
                
                await MainActor.run {
                    addAIMessage(aiResponse)
                    
                    // Reset processing state
                    isProcessing = false
                    waitingForUserInput = true

                    // Set UI elements based on current creation step
                    switch currentStep {
                    case .name, .age, .occupation:
                        // Show text input for user-provided information
                        showTextInput = true
                        showContinueButton = false
                    case .attributesExplanation, .abilitiesExplanation, .attributesRolling, .abilitiesRolling:
                        // Show continue button for AI-driven stages
                        showTextInput = false
                        showContinueButton = true
                    case .background:
                        if !hasProvidedBackground {
                            // Show text input for initial background input
                            showTextInput = true
                            showContinueButton = false
                        } else {
                            // Show continue button after background is provided
                            showTextInput = false
                            showContinueButton = true
                            hasGeneratedBackgroundResponse = true
                        }
                    case .complete:
                        // Show continue button at completion
                        showTextInput = false
                        showContinueButton = true
                    @unknown default:
                        // Default to showing text input for unknown stages
                        showTextInput = true
                        showContinueButton = false
                    }
                }
            } catch {
                print("Error generating AI response: \(error.localizedDescription)")
                await MainActor.run {
                    // Handle error state
                    addAIMessage("I'm sorry, there was an error generating a response. Please try again.")
                    isProcessing = false
                    waitingForUserInput = true
                    showTextInput = true
                    showContinueButton = false
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
                context += "Attributes: \(character.attributes.map { "\($0.key.rawValue): \($0.value)" }.joined(separator: ", "))\n"
            }
            if !character.abilities.isEmpty {
                context += "Abilities: \(character.abilities.map { "\($0.key.rawValue): \($0.value.percentile)% (Rating: \($0.value.rating))" }.joined(separator: ", "))\n"
            }
            if let background = character.background {
                context += "Background: \(background)\n"
            }
        }
        context += "\nUser input: \(userInput)\n"
        
        // Global instructions
        context += "\nCRITICAL INSTRUCTIONS: You are an AI assistant helping with character creation for a Western RPG. "
        context += "Your responses must strictly adhere to the following rules:\n"
        context += "1. Focus only on the current step.\n"
        context += "2. Do not reference or ask about information from previous steps.\n"
        context += "3. Do not mention any steps that haven't happened yet.\n"
        context += "4. NEVER ask questions or prompt for more information unless explicitly instructed to do so.\n"
        context += "5. Provide statements and information only, ending with a definitive statement.\n"
        context += "6. Use proper capitalization and punctuation in your responses.\n"
        context += "7. Maintain a natural flow between sentences without abrupt transitions.\n"
        
        // Step-specific instructions
        switch currentStep {
        case .name:
            context += "Ask for the character's name only. Example: 'What's your character's name?'"
        case .age:
            context += "Ask for the character's age only. Example: 'How old is your character?'"
        case .occupation:
            context += "Ask for the character's occupation only. Example: 'What's your character's occupation?'"
        case .attributesExplanation:
            context += "Explain the attribute rolling process in Boot Hill (3d6 for each attribute). Do NOT list specific abilities. Do NOT ask any questions or speculate. End with a statement about readiness to roll."
        case .attributesRolling:
            context += "Provide a brief analysis of the rolled attributes. Focus on the character's strengths based on these numbers. Do NOT ask any questions or speculate. End with a statement about the character's potential in the Wild West."
        case .abilitiesExplanation:
            context += "Explain the abilities rolling process in Boot Hill (percentile dice for each ability). Do NOT list specific abilities. Do NOT ask any questions or speculate. End with a statement about readiness to roll."
        case .abilitiesRolling:
            context += "Provide a brief analysis of the rolled attributes. Do NOT ask any questions or speculate. End with a statement about the character's potential in the Wild West."
        case .background:
            if !hasProvidedBackground {
                context += "Ask for a brief background of the character. Example: 'Tell me a bit about your character's background.'"
            } else {
                context += "Respond to the provided background by highlighting interesting aspects. Do NOT ask any questions, speculate, or prompt for more information. Provide a concise statement about how the background fits into the Western setting."
            }
        case .complete:
            context += "Summarize the character and conclude the creation process. Do NOT ask any questions. End with a definitive statement about the character being ready for adventure."
        @unknown default:
            context += "Provide general information about character creation in Boot Hill without asking any questions."
        }
        
        return context
    }

    /// Handles the progression to the next stage of character creation
    func continueToNextStage() {
        showContinueButton = false
        isCurrentStageComplete = false
        
        switch currentStep {
        case .name, .age, .occupation:
            // These steps are handled by processUserInput
            break
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
            hasProvidedBackground = false
            hasGeneratedBackgroundResponse = false
            generateAIResponse(userInput: "Ask for character background")
        case .background:
            if hasGeneratedBackgroundResponse {
                currentStep = .complete
                summarizeCharacter()
            } else {
                generateBackgroundResponse()
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
        case .age:
            if let age = extractAge(from: input) {
                character?.age = age
                currentStep = .occupation
                generateAIResponse(userInput: "age set to \(age)")
            } else {
                // Show error message and keep text input visible for invalid age
                addAIMessage("I'm sorry, I couldn't understand that age. Please enter a valid number for your character's age.")
                showTextInput = true
                showContinueButton = false
            }
        case .occupation:
            if let occupation = extractOccupation(from: input) {
                character?.occupation = occupation
                currentStep = .attributesExplanation
                generateAIResponse(userInput: "occupation set to \(occupation)")
            } else {
                // Show error message and keep text input visible for invalid occupation
                addAIMessage("I'm sorry, I couldn't understand that occupation. Please enter a valid occupation for your character.")
                showTextInput = true
                showContinueButton = false
            }
        case .attributesExplanation, .attributesRolling, .abilitiesExplanation, .abilitiesRolling:
            // These steps are handled by continueToNextStage()
            break
        case .background:
            // Handle the first step of the background process
            if !hasProvidedBackground {
                character?.background = input
                hasProvidedBackground = true
                generateBackgroundResponse()
            }
        case .complete:
            // Character creation is complete, no further input needed
            break
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
                    self.showTextInput = true
                    self.showContinueButton = false
                }
            }
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
        
        let attributeMessage = "Here's what you rolled for each attribute:\n\n\(attributeDescription)"
        
        Task {
            do {
                let context = buildContext(userInput: "Explain attributes: \(attributeDescription)")
                let aiExplanation = try await aiService.generateCharacterCreationResponse(context: context, userInput: "Explain attributes: \(attributeDescription)")
                
                await MainActor.run {
                    // Combine the attribute scores and AI explanation into a single message
                    let combinedMessage = "\(attributeMessage)\n\n\(aiExplanation)"
                    addAIMessage(combinedMessage)
                    
                    // Mark the stage as complete and show the continue button
                    isCurrentStageComplete = true
                    showContinueButton = true
                }
            } catch {
                print("Error generating AI response for attributes: \(error.localizedDescription)")
                await MainActor.run {
                    isCurrentStageComplete = true
                    showContinueButton = true
                }
            }
        }
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
        
        let abilityMessage = "Here's what you rolled for each of your abilities:\n\n\(abilityDescription)"
        
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
                    
                    // Update state and UI for completed background response
                    hasGeneratedBackgroundResponse = true
                    isCurrentStageComplete = true
                    showTextInput = false
                    showContinueButton = true
                }
            } catch {
                print("Error generating AI response for background: \(error.localizedDescription)")
                await MainActor.run {
                    // Handle error state
                    addAIMessage("I'm sorry, there was an error responding to your character's background. Please try again.")
                    hasProvidedBackground = false // Reset to allow retry
                    showTextInput = true
                    showContinueButton = false
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
        Your character is complete! Here's a summary:

        Name: \(character.name)
        Age: \(character.age ?? 0)
        Occupation: \(character.occupation ?? "Unknown")
        
        Attributes:
        \(attributesSummary)
        
        Abilities:
        \(abilitiesSummary)
        
        Background: \(character.background ?? "Not provided")

        Your character is now ready for adventure! Good luck, partner!
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
