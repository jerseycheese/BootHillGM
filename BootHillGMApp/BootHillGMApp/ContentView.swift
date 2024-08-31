import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = AITestViewModel()
    
    var body: some View {
        VStack {
            Text("BootHillGM AI Test")
                .font(.title)
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
    }
}

// Preview provider for SwiftUI canvas
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
