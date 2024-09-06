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
    
    /// Generates a percentile score (1-100) for an ability
    /// - Returns: A random number between 1 and 100
    func generatePercentileScore() -> Int {
        return rollDice(count: 1, sides: 100)
    }
    
    /// Converts a percentile score to a rating
    /// - Parameter percentile: The percentile score to convert
    /// - Returns: The corresponding rating (0 to 5)
    func convertPercentileToRating(_ percentile: Int) -> Int {
        switch percentile {
        case 1...20: return 0
        case 21...40: return 1
        case 41...60: return 2
        case 61...80: return 3
        case 81...95: return 4
        case 96...100: return 5
        default: return 0
        }
    }
    
    /// Generates a complete set of ability scores for character creation
    /// - Returns: A dictionary with BootHillAbility enum cases as keys and AbilityScore structs as values
    func generateAbilityScores() -> [BootHillAbility: AbilityScore] {
        var scores: [BootHillAbility: AbilityScore] = [:]
        
        // Generate a percentile score and rating for each ability
        for ability in BootHillAbility.allCases {
            let percentile = generatePercentileScore()
            let rating = convertPercentileToRating(percentile)
            scores[ability] = AbilityScore(percentile: percentile, rating: rating)
        }
        
        return scores
    }
}
