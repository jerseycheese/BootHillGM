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
    private var gameCore: GameCore?
    private var character: GameCharacter?
    private var currentStep: CreationStep = .name
    private let maxSkills = 5
    
    enum CreationStep {
        case name, age, occupation, attributes, skills, background, complete
    }
    
    init(aiService: AIService) {
        self.aiService = aiService
    }
    
    /// Starts the conversation with the AI for character creation.
    func startConversation(gameCore: GameCore) {
        self.gameCore = gameCore
        addAIMessage("Welcome to character creation! Let's start by choosing your character's name. What would you like your character to be called?")
        waitingForUserInput = true
    }
    
    /// Sends the user's message and processes it.
    func sendMessage() {
        guard !userInput.isEmpty else { return }
        let currentInput = userInput
        addUserMessage(currentInput)
        processUserInput(currentInput)
        userInput = ""
        waitingForUserInput = false
    }
    
    /// Adds a user message to the chat.
    private func addUserMessage(_ message: String) {
        messages.append(BootHillGMApp.Message(content: message, isAI: false))
    }
    
    /// Adds an AI message to the chat.
    private func addAIMessage(_ message: String) {
        messages.append(BootHillGMApp.Message(content: message, isAI: true))
    }
    
    private func processUserInput(_ input: String) {
        isProcessing = true
        
        Task {
            do {
                let context = messages.map { "\($0.isAI ? "AI" : "User"): \($0.content)" }.joined(separator: "\n")
                let aiResponse = try await aiService.generateCharacterCreationResponse(context: context, userInput: input)
                
                await MainActor.run {
                    handleAIResponse(aiResponse, userInput: input)
                    isProcessing = false
                    waitingForUserInput = true
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
    
    private func handleAIResponse(_ response: String, userInput: String) {
        let cleanedResponse = cleanMessage(response)
        
        switch currentStep {
        case .name:
            createCharacter(name: userInput.trimmingCharacters(in: .whitespacesAndNewlines))
        case .age:
            if let age = extractAge(from: cleanedResponse) {
                character?.age = age
                currentStep = .occupation
                addAIMessage("Great! Your character is \(age) years old. What is their occupation?")
            } else {
                addAIMessage("I'm sorry, I couldn't understand the age. Please provide a clear number for your character's age.")
            }
        case .occupation:
            if let occupation = extractOccupation(from: userInput) {
                character?.occupation = occupation
                currentStep = .attributes
                addAIMessage("Excellent! Your character is a \(occupation). Now let's determine their attributes. We'll go through each attribute, and you can assign a value from 1 to 10, with 10 being the highest. Let's start with Strength. What's their Strength value (1-10)?")
            } else {
                addAIMessage("I'm sorry, I couldn't understand the occupation. Can you please provide a clear occupation for your character?")
            }
        case .attributes:
            if let attribute = extractAttribute(from: userInput) {
                character?.attributes[attribute.key] = attribute.value
                if character?.attributes.count == Attribute.allCases.count {
                    currentStep = .skills
                    addAIMessage("Great! We've set all the attributes. Now let's choose some skills. What skill would you like to add? Available skills are: \(Skill.allCases.map { $0.rawValue }.joined(separator: ", "))")
                } else {
                    let nextAttribute = Attribute.allCases[character?.attributes.count ?? 0]
                    addAIMessage("What's their \(nextAttribute.rawValue) value (1-10)?")
                }
            } else {
                addAIMessage("I'm sorry, I couldn't understand the attribute value. Please provide a number between 1 and 10 for the current attribute.")
            }
        case .skills:
            if userInput.lowercased() == "no" {
                moveToBackgroundStep()
            } else if let skill = extractSkill(from: cleanedResponse) {
                character?.skills[skill] = 1 // Start with a basic proficiency
                if (character?.skills.count ?? 0) >= maxSkills {
                    moveToBackgroundStep()
                } else {
                    addAIMessage("Skill added. Would you like to add another skill? (Yes/No)")
                }
            } else {
                addAIMessage("I'm sorry, I couldn't understand the skill. Available skills are: \(Skill.allCases.map { $0.rawValue }.joined(separator: ", ")). Or say 'No' to finish adding skills.")
            }
        case .background:
            character?.background = userInput
            currentStep = .complete
            summarizeCharacter()
        case .complete:
            addAIMessage("Character creation is already complete. You can now start your adventure!")
        }
    }
    
    private func moveToBackgroundStep() {
        currentStep = .background
        addAIMessage("Great! We've finished adding skills. Now, let's add some background. In a few sentences, describe your character's background and personality.")
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
                    self.addAIMessage("Great! Your character's name is \(newCharacter.name). How old is \(newCharacter.name)?")
                case .failure(let error):
                    print("Error creating character: \(error.localizedDescription)")
                    self.addAIMessage("I'm sorry, there was an error creating your character. Let's try again. What would you like your character's name to be?")
                    self.currentStep = .name
                }
                self.waitingForUserInput = true
            }
        }
    }
    
    private func summarizeCharacter() {
        guard let character = character else {
            addAIMessage("I'm sorry, there was an error summarizing your character. Please try creating your character again.")
            return
        }
        
        let summary = """
        Thank you for creating your character! Here's a summary of \(character.name):
        Name: \(character.name)
        Age: \(character.age ?? 0)
        Occupation: \(character.occupation ?? "Unknown")
        Attributes: \(character.attributes.map { "\($0.key.rawValue): \($0.value)" }.joined(separator: ", "))
        Skills: \(character.skills.map { $0.key.rawValue }.joined(separator: ", "))
        Background: \(character.background ?? "Not provided")
        """
        
        addAIMessage(summary)
        addAIMessage("Character creation is complete. You can now start your adventure!")
    }
    
    private func cleanMessage(_ message: String) -> String {
        var cleaned = message.trimmingCharacters(in: .whitespacesAndNewlines)
        cleaned = cleaned.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
        cleaned = cleaned.replacingOccurrences(of: "[,!?]", with: "", options: .regularExpression)
        return cleaned
    }
    
    private func extractAge(from response: String) -> Int? {
        let words = response.components(separatedBy: .whitespacesAndNewlines)
        return words.compactMap { Int($0) }.first
    }
    
    private func extractOccupation(from response: String) -> String? {
        return response.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    private func extractAttribute(from response: String) -> (key: Attribute, value: Int)? {
        guard let value = Int(response), (1...10).contains(value) else {
            print("Failed to extract valid attribute value from: \(response)")
            return nil
        }
        
        let currentAttributeIndex = character?.attributes.count ?? 0
        guard currentAttributeIndex < Attribute.allCases.count else {
            print("All attributes have already been set")
            return nil
        }
        
        let attribute = Attribute.allCases[currentAttributeIndex]
        print("Extracted attribute: \(attribute.rawValue) with value: \(value)")
        return (attribute, value)
    }
    
    private func extractSkill(from response: String) -> Skill? {
        return Skill.allCases.first { response.lowercased().contains($0.rawValue.lowercased()) }
    }
}
