import SwiftUI

struct CharacterCreationView: View {
    @EnvironmentObject var gameCore: GameCore
    @StateObject private var viewModel: CharacterCreationViewModel
    
    init(aiService: AIService) {
        _viewModel = StateObject(wrappedValue: CharacterCreationViewModel(aiService: aiService))
    }
    
    var body: some View {
        VStack {
            ChatScrollView(messages: $viewModel.messages)
                .frame(maxWidth: CGFloat.infinity, maxHeight: CGFloat.infinity)
            
            if viewModel.isProcessing {
                ProgressView()
                    .padding()
            }
            
            HStack {
                // Modified TextField with onSubmit modifier
                TextField("Your response", text: $viewModel.userInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(viewModel.isProcessing)
                    .onSubmit {
                        // Call sendMessage when Return key is pressed
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
    }
}

struct CharacterCreationView_Previews: PreviewProvider {
    static var previews: some View {
        CharacterCreationView(aiService: AIService())
            .environmentObject(GameCore(aiService: AIService()))
    }
}
