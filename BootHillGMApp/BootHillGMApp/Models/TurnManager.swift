import Foundation

/// Represents a single turn in the game
struct Turn {
    let turnNumber: Int
    let activeCharacterId: String
    var actions: [String] = []  // Placeholder for action tracking
    let timestamp: Date
    
    init(turnNumber: Int, activeCharacterId: String) {
        self.turnNumber = turnNumber
        self.activeCharacterId = activeCharacterId
        self.timestamp = Date()
    }
}

/// Manages the turn-based system for the game
class TurnManager: ObservableObject {
    @Published private(set) var currentTurn: Turn?
    private(set) var turnHistory: [Turn] = []
    private var characterIds: [String] = []  // Placeholder for character order
    
    init(characterIds: [String]) {
        self.characterIds = characterIds
    }
    
    /// Starts a new turn
    func startNewTurn() {
        let turnNumber = (currentTurn?.turnNumber ?? 0) + 1
        let activeCharacterId = getNextCharacterId()
        let newTurn = Turn(turnNumber: turnNumber, activeCharacterId: activeCharacterId)
        currentTurn = newTurn
        turnHistory.append(newTurn)
    }
    
    /// Ends the current turn
    func endCurrentTurn() {
        guard currentTurn != nil else { return }
        // Additional logic for turn end can be added here
        startNewTurn()
    }
    
    /// Gets the ID of the next character in turn order
    private func getNextCharacterId() -> String {
        guard let currentTurn = currentTurn,
              let currentIndex = characterIds.firstIndex(of: currentTurn.activeCharacterId) else {
            return characterIds.first ?? ""
        }
        let nextIndex = (currentIndex + 1) % characterIds.count
        return characterIds[nextIndex]
    }
    
    /// Adds an action to the current turn
    func addAction(_ action: String) {
        currentTurn?.actions.append(action)
    }
}