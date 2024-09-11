import Foundation

class GameCore: ObservableObject {
    @Published var gameState: GameState = .notStarted
    @Published var currentLocation: Location?
    
    private(set) var turnManager: TurnManager?
    private(set) var characterManager: CharacterManager
    
    init(aiService: AIService) {
        self.characterManager = CharacterManager(aiService: aiService)
    }

    
    func startNewGame() throws {
        guard gameState == .notStarted else {
            throw GameError.gameAlreadyInProgress
        }
        gameState = .inProgress
        
        // Initialize TurnManager with character IDs
        let characterIds = characterManager.characters.map { $0.id }
        turnManager = TurnManager(characterIds: characterIds)
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
    
    func createCharacter(name: String, completion: @escaping (Result<Character, Error>) -> Void) {
        characterManager.createCharacter(name: name) { result in
            switch result {
            case .success(let character):
                self.log("Character created: \(character.name)")
            case .failure(let error):
                self.log("Failed to create character: \(error.localizedDescription)")
            }
            completion(result)
        }
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

class Location {}
