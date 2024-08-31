import Foundation

class CharacterManager: ObservableObject {
    @Published private(set) var characters: [GameCharacter] = []
    private let aiService: AIService
    
    init(aiService: AIService) {
        self.aiService = aiService
    }
    
    func createCharacter(name: String, completion: @escaping (Result<GameCharacter, Error>) -> Void) {
        // This is a placeholder for the AI-driven character creation process
        // In a real implementation, this would involve multiple steps and AI interactions
        let newCharacter = GameCharacter(name: name)
        characters.append(newCharacter)
        completion(.success(newCharacter))
    }
    
    func getCharacter(withId id: UUID) -> GameCharacter? {
        return characters.first { $0.id == id }
    }
    
    func updateCharacter(_ character: GameCharacter) {
        if let index = characters.firstIndex(where: { $0.id == character.id }) {
            characters[index] = character
        }
    }
    
    func deleteCharacter(withId id: UUID) {
        characters.removeAll { $0.id == id }
    }
}

struct GameCharacter: Identifiable {
    let id: UUID
    var name: String
    var age: Int?
    var occupation: String?
    var skills: [Skill: Int] = [:]
    var attributes: [Attribute: Int] = [:]
    var hitPoints: Int = 0
    var maximumHitPoints: Int = 0
    var money: Int = 0
    var equipment: [String] = []
    var background: String?
    
    init(id: UUID = UUID(), name: String) {
        self.id = id
        self.name = name
    }
}

enum Skill: String, CaseIterable {
    case gunhandling = "Gun Handling"
    case horsemanship = "Horsemanship"
    case tracking = "Tracking"
    case survival = "Survival"
    case brawling = "Brawling"
    case firstAid = "First Aid"
    case gambling = "Gambling"
    case stealth = "Stealth"
    // Add more skills as needed
}

enum Attribute: String, CaseIterable {
    case strength = "Strength"
    case dexterity = "Dexterity"
    case speed = "Speed"
    case stamina = "Stamina"
    case intelligence = "Intelligence"
    case luck = "Luck"
}