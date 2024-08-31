import Foundation

class TurnManager: ObservableObject {
    @Published private(set) var currentTurn: Turn?
    private(set) var turnHistory: [Turn] = []
    private var characterIds: [UUID] = []
    
    init(characterIds: [UUID]) {
        self.characterIds = characterIds
    }
    
    func startNewTurn() {
        let turnNumber = (currentTurn?.turnNumber ?? 0) + 1
        let activeCharacterId = getNextCharacterId()
        let newTurn = Turn(turnNumber: turnNumber, activeCharacterId: activeCharacterId)
        currentTurn = newTurn
        turnHistory.append(newTurn)
    }
    
    func endCurrentTurn() {
        guard currentTurn != nil else { return }
        startNewTurn()
    }
    
    private func getNextCharacterId() -> UUID {
        guard let currentTurn = currentTurn,
              let currentIndex = characterIds.firstIndex(of: currentTurn.activeCharacterId) else {
            return characterIds.first ?? UUID()
        }
        let nextIndex = (currentIndex + 1) % characterIds.count
        return characterIds[nextIndex]
    }
    
    func addAction(_ action: String) {
        currentTurn?.actions.append(action)
    }
}

struct Turn {
    let turnNumber: Int
    let activeCharacterId: UUID
    var actions: [String] = []
    let timestamp: Date
    
    init(turnNumber: Int, activeCharacterId: UUID) {
        self.turnNumber = turnNumber
        self.activeCharacterId = activeCharacterId
        self.timestamp = Date()
    }
}