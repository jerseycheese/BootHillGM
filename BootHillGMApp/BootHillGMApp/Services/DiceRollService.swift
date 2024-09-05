import Foundation

/// Service responsible for handling dice rolls in the game
class DiceRollService {
    
    /// Rolls a single die with the specified number of sides
    /// - Parameter sides: The number of sides on the die
    /// - Returns: A random number between 1 and the number of sides
    func rollDie(sides: Int) -> Int {
        return Int.random(in: 1...sides)
    }
    
    /// Rolls multiple dice and returns their sum
    /// - Parameters:
    ///   - count: The number of dice to roll
    ///   - sides: The number of sides on each die
    /// - Returns: The sum of all dice rolls
    func rollDice(count: Int, sides: Int) -> Int {
        return (1...count).map { _ in rollDie(sides: sides) }.reduce(0, +)
    }
    
    /// Generates an attribute score using the 3d6 method
    /// - Returns: A random number between 3 and 18
    func generateAttributeScore() -> Int {
        return rollDice(count: 3, sides: 6)
    }
    
    /// Generates a complete set of attribute scores for character creation
    /// - Returns: A dictionary with Attribute enum cases as keys and their scores as values
    func generateAttributeScores() -> [Attribute: Int] {
        var scores: [Attribute: Int] = [:]
        
        // Generate a score for each attribute using the 3d6 method
        for attribute in Attribute.allCases {
            scores[attribute] = generateAttributeScore()
        }
        
        return scores
    }
}
