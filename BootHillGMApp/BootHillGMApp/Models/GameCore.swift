import Foundation

// TurnManager class moved into the same file
class TurnManager: ObservableObject {
    @Published private(set) var currentTurn: Turn?
    private(set) var turnHistory: [Turn] = []
    private var characterIds: [String] = []
    
    init(characterIds: [String]) {
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
    
    private func getNextCharacterId() -> String {
        guard let currentTurn = currentTurn,
              let currentIndex = characterIds.firstIndex(of: currentTurn.activeCharacterId) else {
            return characterIds.first ?? ""
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
    let activeCharacterId: String
    var actions: [String] = []
    let timestamp: Date
    
    init(turnNumber: Int, activeCharacterId: String) {
        self.turnNumber = turnNumber
        self.activeCharacterId = activeCharacterId
        self.timestamp = Date()
    }
}

class GameCore: ObservableObject {
    @Published var currentPlayer: Player?
    @Published var gameState: GameState = .notStarted
    @Published var players: [Player] = []
    @Published var currentLocation: Location?
    
    private(set) var turnManager: TurnManager?
    
    init() {}
    
    func startNewGame() throws {
        guard gameState == .notStarted else {
            throw GameError.gameAlreadyInProgress
        }
        gameState = .inProgress
        
        // Initialize TurnManager with player IDs
        let playerIds = players.map { $0.id }
        turnManager = TurnManager(characterIds: playerIds)
        turnManager?.startNewTurn()
        
        log("New game started")
    }
    
    func endGame() {
        gameState = .ended
        log("Game ended")
    }
    
    func advanceToNextTurn() throws {
        guard gameState == .inProgress else {
            throw GameError.gameNotInProgress
        }
        turnManager?.endCurrentTurn()
        log("Advanced to turn \(turnManager?.currentTurn?.turnNumber ?? 0)")
    }
    
    func addPlayer(_ player: Player) {
        players.append(player)
    }
    
    private func log(_ message: String) {
        print("GameCore: \(message)")
    }
}

enum GameState {
    case notStarted
    case inProgress
    case ended
}

enum GameError: Error {
    case gameAlreadyInProgress
    case gameNotInProgress
}

class Player: Identifiable {
    let id: String
    
    init(id: String) {
        self.id = id
    }
}

class Location {}
