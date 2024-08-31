import SwiftUI

struct CharacterCreationView: View {
    @EnvironmentObject var gameCore: GameCore
    @StateObject private var viewModel = CharacterCreationViewModel()
    
    var body: some View {
        VStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(viewModel.conversationHistory, id: \.self) { message in
                        Text(message)
                            .padding()
                            .background(message.hasPrefix("AI: ") ? Color.gray.opacity(0.2) : Color.blue.opacity(0.2))
                            .cornerRadius(10)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            HStack {
                TextField("Your response", text: $viewModel.userInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button("Send") {
                    viewModel.sendMessage()
                }
                .disabled(viewModel.userInput.isEmpty)
            }
            .padding()
        }
        .navigationTitle("Create Character")
        .onAppear {
            viewModel.startConversation(gameCore: gameCore)
        }
    }
}

class CharacterCreationViewModel: ObservableObject {
    @Published var conversationHistory: [String] = []
    @Published var userInput: String = ""
    
    private var gameCore: GameCore?
    private var character: GameCharacter?
    private var currentStep: CreationStep = .name
    
    enum CreationStep {
        case name, age, occupation, attributes, skills, background, complete
    }
    
    func startConversation(gameCore: GameCore) {
        self.gameCore = gameCore
        addAIMessage("Welcome to character creation! Let's start by choosing your character's name. What would you like your character to be called?")
    }
    
    func sendMessage() {
        addUserMessage(userInput)
        processUserInput(userInput)
        userInput = ""
    }
    
    private func addUserMessage(_ message: String) {
        conversationHistory.append("You: \(message)")
    }
    
    private func addAIMessage(_ message: String) {
        conversationHistory.append("AI: \(message)")
    }
    
    private func processUserInput(_ input: String) {
        guard let gameCore = gameCore else {
            print("Error: GameCore not initialized")
            return
        }
        
        switch currentStep {
        case .name:
            gameCore.createCharacter(name: input) { result in
                DispatchQueue.main.async {
                    switch result {
                    case .success(let newCharacter):
                        self.character = newCharacter
                        self.currentStep = .age
                        self.addAIMessage("Great! Your character's name is \(newCharacter.name). How old is \(newCharacter.name)?")
                    case .failure(let error):
                        self.addAIMessage("I'm sorry, there was an error creating your character: \(error.localizedDescription)")
                    }
                }
            }
        case .age:
            if let age = Int(input) {
                character?.age = age
                currentStep = .occupation
                addAIMessage("\(character?.name ?? "Your character") is \(age) years old. What is their occupation?")
            } else {
                addAIMessage("I'm sorry, I didn't understand that. Please enter a number for your character's age.")
            }
        case .occupation:
            character?.occupation = input
            currentStep = .attributes
            addAIMessage("Excellent! \(character?.name ?? "Your character") is a \(input). Now let's determine their attributes. We'll go through each attribute, and you can assign a value from 1 to 10, with 10 being the highest. Let's start with Strength. What's their Strength value (1-10)?")
        case .attributes:
            if let attributeValue = Int(input), (1...10).contains(attributeValue) {
                if character?.attributes.count ?? 0 < Attribute.allCases.count {
                    let currentAttribute = Attribute.allCases[character?.attributes.count ?? 0]
                    character?.attributes[currentAttribute] = attributeValue
                    
                    if character?.attributes.count ?? 0 < Attribute.allCases.count {
                        let nextAttribute = Attribute.allCases[character?.attributes.count ?? 0]
                        addAIMessage("Great! What's their \(nextAttribute.rawValue) value (1-10)?")
                    } else {
                        currentStep = .skills
                        addAIMessage("Attributes are set. Now let's choose some skills. What skill would you like to add? Available skills are: \(Skill.allCases.map { $0.rawValue }.joined(separator: ", "))")
                    }
                }
            } else {
                addAIMessage("Please enter a valid number between 1 and 10 for the attribute value.")
            }
        case .skills:
            if let skill = Skill(rawValue: input) {
                if character?.skills.count ?? 0 < 5 {
                    character?.skills[skill] = 1 // Start with a basic proficiency
                    addAIMessage("Added \(skill.rawValue) to your character's skills. Would you like to add another skill? (Yes/No)")
                } else {
                    currentStep = .background
                    addAIMessage("You've added 5 skills to your character. Now, let's add some background. In a few sentences, describe your character's background and personality.")
                }
            } else if input.lowercased() == "no" {
                currentStep = .background
                addAIMessage("Alright, let's move on to your character's background. In a few sentences, describe your character's background and personality.")
            } else if input.lowercased() != "yes" {
                addAIMessage("I didn't recognize that skill. Available skills are: \(Skill.allCases.map { $0.rawValue }.joined(separator: ", ")). Or say 'No' to finish adding skills.")
            }
        case .background:
            character?.background = input
            currentStep = .complete
            addAIMessage("Thank you for creating your character! Here's a summary of \(character?.name ?? "your character"):")
            if let character = character {
                addAIMessage("""
                    Name: \(character.name)
                    Age: \(character.age ?? 0)
                    Occupation: \(character.occupation ?? "Unknown")
                    Attributes: \(character.attributes.map { "\($0.key.rawValue): \($0.value)" }.joined(separator: ", "))
                    Skills: \(character.skills.map { $0.key.rawValue }.joined(separator: ", "))
                    Background: \(character.background ?? "Not provided")
                    """)
            }
        case .complete:
            addAIMessage("Character creation is complete. You can now start your adventure!")
        }
    }
}

struct CharacterCreationView_Previews: PreviewProvider {
    static var previews: some View {
        CharacterCreationView()
            .environmentObject(GameCore(aiService: AIService()))
    }
}
