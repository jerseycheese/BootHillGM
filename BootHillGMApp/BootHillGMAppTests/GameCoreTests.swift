import XCTest
@testable import BootHillGMApp

class GameCoreTests: XCTestCase {
    var gameCore: GameCore!
    
    override func setUp() {
        super.setUp()
        gameCore = GameCore()
    }
    
    func testStartNewGame() throws {
        XCTAssertEqual(gameCore.gameState, .notStarted)
        try gameCore.startNewGame()
        XCTAssertEqual(gameCore.gameState, .inProgress)
        XCTAssertEqual(gameCore.turnNumber, 1)
    }
    
    func testStartNewGameWhenAlreadyInProgress() {
        try? gameCore.startNewGame()
        XCTAssertThrowsError(try gameCore.startNewGame()) { error in
            XCTAssertEqual(error as? GameError, .gameAlreadyInProgress)
        }
    }
    
    func testEndGame() {
        try? gameCore.startNewGame()
        gameCore.endGame()
        XCTAssertEqual(gameCore.gameState, .ended)
    }
    
    func testAdvanceToNextTurn() throws {
        try gameCore.startNewGame()
        try gameCore.advanceToNextTurn()
        XCTAssertEqual(gameCore.turnNumber, 2)
    }
    
    func testAdvanceToNextTurnWhenGameNotInProgress() {
        XCTAssertThrowsError(try gameCore.advanceToNextTurn()) { error in
            XCTAssertEqual(error as? GameError, .gameNotInProgress)
        }
    }
}
