import Foundation

struct Character: Identifiable {
    let id: UUID
    var name: String
    var age: Int
    var occupation: String
    var skills: [String: Int]
    var attributes: [String: Int]
    var conversationHistory: [String]
    
    init(name: String = "", age: Int = 0, occupation: String = "") {
        self.id = UUID()
        self.name = name
        self.age = age
        self.occupation = occupation
        self.skills = [:]
        self.attributes = [:]
        self.conversationHistory = []
    }
    
    mutating func addSkill(_ skill: String, level: Int) {
        skills[skill] = level
    }
    
    mutating func setAttribute(_ attribute: String, value: Int) {
        attributes[attribute] = value
    }
    
    mutating func addToConversationHistory(_ message: String) {
        conversationHistory.append(message)
    }
}
