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
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            if viewModel.isProcessing {
                ProgressView()
                    .padding()
            } else if viewModel.waitingForUserInput {
                if viewModel.showContinueButton {
                    // Show Continue button when it's not the user's turn to respond
                    Button("Continue") {
                        viewModel.continueToNextStage()
                    }
                    .buttonStyle(.borderedProminent)
                    .padding()
                    .accessibility(label: Text("Continue to next stage"))
                }
                
                if viewModel.showTextInput {
                    // Show text input when it's the user's turn to respond
                    HStack {
                        // TextField with focus state and onSubmit action
                        TextField("Your response", text: $viewModel.userInput)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .focused($isInputFocused)
                            .onSubmit {
                                viewModel.sendMessage()
                            }
                        
                        Button("Send") {
                            viewModel.sendMessage()
                        }
                        .disabled(viewModel.userInput.isEmpty)
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Create Character")
        .onAppear {
            viewModel.startConversation(gameCore: gameCore)
        }
        // Automatically focus on the text input when it's the user's turn
        .onChange(of: viewModel.showTextInput) { newValue in
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
