import Foundation

class CharacterManager: ObservableObject {
    // Store and manage a collection of Character instances
    @Published private(set) var characters: [Character] = []
    private let aiService: AIService
    
    init(aiService: AIService) {
        self.aiService = aiService
    }
    
    // Create a new character using the consolidated Character struct
    func createCharacter(name: String, completion: @escaping (Result<Character, Error>) -> Void) {
        // TODO: Implement AI-driven character creation process
        let newCharacter = Character(name: name)
        characters.append(newCharacter)
        completion(.success(newCharacter))
    }
    
    // Helper methods for managing characters
    func getCharacter(withId id: UUID) -> Character? {
        return characters.first { $0.id == id }
    }
    
    func updateCharacter(_ character: Character) {
        if let index = characters.firstIndex(where: { $0.id == character.id }) {
            characters[index] = character
        }
    }
    
    func deleteCharacter(withId id: UUID) {
        characters.removeAll { $0.id == id }
    }
}