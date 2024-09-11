import Foundation

// Define all attributes used in Boot Hill
enum Attribute: String, CaseIterable {
    case strength, dexterity, speed, intelligence, stamina, luck
}

// Define all abilities used in Boot Hill
enum BootHillAbility: String, CaseIterable {
    case shooting, fistFighting, knifeFighting, throwing, boxing, climbing, swimming, tracking, sneaking, riding, gambling, firstAid, animalHandling, survival
}

// Represent an ability score with percentile and rating
struct AbilityScore {
    let percentile: Int
    let rating: Int
}

struct Character: Identifiable {
    let id: UUID
    var name: String
    var age: Int?
    var occupation: String?
    var attributes: [Attribute: Int]
    var abilities: [BootHillAbility: AbilityScore]
    var hitPoints: Int
    var maximumHitPoints: Int
    var money: Int
    var equipment: [String]
    var background: String?
    var conversationHistory: [String]
    
    // Initialize a new character with default values
    init(id: UUID = UUID(), name: String) {
        self.id = id
        self.name = name
        self.age = nil
        self.occupation = nil
        self.attributes = [:]
        self.abilities = [:]
        self.hitPoints = 0
        self.maximumHitPoints = 0
        self.money = 0
        self.equipment = []
        self.background = nil
        self.conversationHistory = []
    }
    
    // Helper methods for updating character properties
    mutating func setAbility(_ ability: BootHillAbility, percentile: Int, rating: Int) {
        abilities[ability] = AbilityScore(percentile: percentile, rating: rating)
    }
    
    mutating func setAttribute(_ attribute: Attribute, value: Int) {
        attributes[attribute] = value
    }
    
    mutating func addToConversationHistory(_ message: String) {
        conversationHistory.append(message)
    }
}
