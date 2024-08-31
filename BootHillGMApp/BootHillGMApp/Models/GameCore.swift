import Foundation

class GameCore {
    var currentPlayer: Player?
    var gameState: GameState = .notStarted
    var turnNumber: Int = 0
    var players: [Player] = []
    var currentLocation: Location?
    
    init() {}
    
    func startNewGame() throws {
        guard gameState == .notStarted else {
            throw GameError.gameAlreadyInProgress
        }
        gameState = .inProgress
        turnNumber = 1
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
        turnNumber += 1
        log("Advanced to turn \(turnNumber)")
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
class Player {}
class Location {}
