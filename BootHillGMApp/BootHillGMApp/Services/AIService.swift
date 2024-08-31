import Foundation
import GoogleGenerativeAI

enum AIServiceError: Error {
    case noResponseGenerated
    case apiError(String)
}

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
        do {
            let response = try await model.generateContent(prompt)
            guard let text = response.text else {
                throw AIServiceError.noResponseGenerated
            }
            return text
        } catch let error as AIServiceError {
            throw error
        } catch {
            throw AIServiceError.apiError(error.localizedDescription)
        }
    }
    
    func generateWesternTownDescription() async throws -> String {
        let prompt = """
        Describe a small Western town in the late 19th century. Include details about:
        1. The main street and its buildings
        2. The local saloon
        3. One unique feature of the town
        Keep the description concise, around 3-4 sentences.
        """
        return try await generateResponse(prompt: prompt)
    }
    
    func testConnection() async -> Bool {
        do {
            let response = try await generateWesternTownDescription()
            print("API Test Response: \(response)")
            return true
        } catch {
            print("API Connection Error: \(error.localizedDescription)")
            return false
        }
    }
}
