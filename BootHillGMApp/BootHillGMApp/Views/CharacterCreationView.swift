import SwiftUI

struct CharacterCreationView: View {
    @EnvironmentObject var gameCore: GameCore
    @StateObject private var viewModel: CharacterCreationViewModel
    @FocusState private var isInputFocused: Bool
    
    init(aiService: AIService, diceRollService: DiceRollService) {
        _viewModel = StateObject(wrappedValue: CharacterCreationViewModel(aiService: aiService, diceRollService: diceRollService))
    }
    
    var body: some View {
        VStack {
            ChatScrollView(messages: $viewModel.messages)
                .frame(maxWidth: CGFloat.infinity, maxHeight: CGFloat.infinity)
            
            if viewModel.isProcessing {
                ProgressView()
                    .padding()
            } else if viewModel.waitingForUserInput {
                Text("Your turn to respond")
                    .foregroundColor(.secondary)
                    .padding()
            }
            
            HStack {
                // TextField with focus state and onSubmit action
                TextField("Your response", text: $viewModel.userInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(viewModel.isProcessing)
                    .focused($isInputFocused)
                    .onSubmit {
                        viewModel.sendMessage()
                    }
                
                Button("Send") {
                    viewModel.sendMessage()
                }
                .disabled(viewModel.userInput.isEmpty || viewModel.isProcessing)
            }
            .padding()
        }
        .navigationTitle("Create Character")
        .onAppear {
            viewModel.startConversation(gameCore: gameCore)
        }
        // Automatically focus on the text input when it's the user's turn
        .onChange(of: viewModel.waitingForUserInput) { newValue in
            if newValue {
                isInputFocused = true
            }
        }
    }
}

struct CharacterCreationView_Previews: PreviewProvider {
    static var previews: some View {
        CharacterCreationView(aiService: AIService(), diceRollService: DiceRollService())
            .environmentObject(GameCore(aiService: AIService()))
    }
}
