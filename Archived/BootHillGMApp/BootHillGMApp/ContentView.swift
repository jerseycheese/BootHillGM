import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = AITestViewModel()
    let aiService = AIService()
    let diceRollService = DiceRollService()
    
    var body: some View {
        NavigationView() {
            VStack {
                Text("BootHillGM")
                    .font(.largeTitle)
                    .padding()
                
                NavigationLink(destination: CharacterCreationView(aiService: aiService, diceRollService: diceRollService)) {
                    Text("Create Character")
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding()
                
                Button("Generate Western Town Description") {
                    viewModel.generateTownDescription()
                }
                .padding()
                .disabled(viewModel.isLoading)
                
                if viewModel.isLoading {
                    ProgressView()
                } else if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                } else {
                    Text(viewModel.townDescription)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .navigationBarHidden(true)
        }
    }
}

// Preview provider for SwiftUI canvas
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
