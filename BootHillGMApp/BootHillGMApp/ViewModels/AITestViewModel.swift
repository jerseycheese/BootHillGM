import Foundation
import Combine

class AITestViewModel: ObservableObject {
    private let aiService: AIService
    @Published var townDescription: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    init(aiService: AIService = AIService()) {
        self.aiService = aiService
    }
    
    func generateTownDescription() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let description = try await aiService.generateWesternTownDescription()
                DispatchQueue.main.async {
                    self.townDescription = description
                    self.isLoading = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
}