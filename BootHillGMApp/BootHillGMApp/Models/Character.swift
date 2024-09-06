import Foundation

// Add these type definitions at the top of the Character.swift file
enum Attribute: String, CaseIterable {
    case strength, agility, intelligence
    // Add other attributes as needed
}

enum BootHillAbility: String, CaseIterable {
    case shooting, riding, brawling, gambling
    // Add other abilities as needed
}

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
