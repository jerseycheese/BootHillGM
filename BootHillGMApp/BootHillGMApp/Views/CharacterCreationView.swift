import SwiftUI

struct CharacterCreationView: View {
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
            viewModel.startConversation()
        }
    }
}

class CharacterCreationViewModel: ObservableObject {
    @Published var character = Character()
    @Published var conversationHistory: [String] = []
    @Published var userInput: String = ""
    
    func startConversation() {
        addAIMessage("Welcome to character creation! Let's start by choosing your character's name. What would you like your character to be called?")
    }
    
    func sendMessage() {
        addUserMessage(userInput)
        processUserInput(userInput)
        userInput = ""
    }
    
    private func addUserMessage(_ message: String) {
        conversationHistory.append("You: \(message)")
        character.addToConversationHistory("You: \(message)")
    }
    
    private func addAIMessage(_ message: String) {
        conversationHistory.append("AI: \(message)")
        character.addToConversationHistory("AI: \(message)")
    }
    
    private func processUserInput(_ input: String) {
        // This is a placeholder for AI-driven conversation logic
        // In the future, this would interact with the AI service
        
        if character.name.isEmpty {
            character.name = input
            addAIMessage("Great! Your character's name is \(character.name). Now, how old is \(character.name)?")
        } else if character.age == 0 {
            if let age = Int(input) {
                character.age = age
                addAIMessage("\(character.name) is \(character.age) years old. What is \(character.name)'s occupation?")
            } else {
                addAIMessage("I'm sorry, I didn't understand that. Please enter a number for your character's age.")
            }
        } else if character.occupation.isEmpty {
            character.occupation = input
            addAIMessage("Excellent! \(character.name) is a \(character.age)-year-old \(character.occupation). Your character creation is complete for now.")
            // In the future, this would continue with skills, attributes, and other details
        }
    }
}

struct CharacterCreationView_Previews: PreviewProvider {
    static var previews: some View {
        CharacterCreationView()
    }
}
