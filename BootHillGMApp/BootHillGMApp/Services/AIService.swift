import Foundation
import GoogleGenerativeAI

class AIService {
    private let apiKey: String
    private lazy var model = GenerativeModel(name: "gemini-1.5-pro", apiKey: apiKey)
    
    init() {
        self.apiKey = AIService.getAPIKey()
    }
    
    private static func getAPIKey() -> String {
        guard let path = Bundle.main.path(forResource: "GenerativeAI-Info", ofType: "plist"),
              let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject],
              let apiKey = dict["API_KEY"] as? String else {
            fatalError("Failed to load API key from GenerativeAI-Info.plist")
        }
        return apiKey
    }
    
    func generateResponse(prompt: String) async throws -> String {
        let response = try await model.generateContent(prompt)
        return response.text ?? "No response generated."
    }
    
    func testConnection() async throws -> Bool {
        do {
            let response = try await generateResponse(prompt: "Hello, Gemini!")
            print("API Test Response: \(response)")
            return true
        } catch {
            print("API Connection Error: \(error.localizedDescription)")
            return false
        }
    }
}
