import Foundation

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

// Placeholders for future implementation
class Player: Identifiable {
    let id: String
    
    init(id: String) {
        self.id = id
    }
}

class Location {}
