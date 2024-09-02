import SwiftUI

struct CharacterCreationView: View {
    @EnvironmentObject var gameCore: GameCore
    @StateObject private var viewModel: CharacterCreationViewModel
    
    init(aiService: AIService) {
        _viewModel = StateObject(wrappedValue: CharacterCreationViewModel(aiService: aiService))
    }
    
    var body: some View {
        VStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(viewModel.conversationHistory) { message in
                        Text(message.content)
                            .padding()
                            .background(message.isUser ? Color.blue.opacity(0.2) : Color.gray.opacity(0.2))
                            .cornerRadius(10)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            if viewModel.isProcessing {
                ProgressView()
                    .padding()
            }
            
            HStack {
                TextField("Your response", text: $viewModel.userInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(viewModel.isProcessing)
                
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
