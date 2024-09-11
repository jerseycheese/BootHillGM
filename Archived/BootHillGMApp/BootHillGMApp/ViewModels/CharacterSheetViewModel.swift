import Foundation

class CharacterSheetViewModel: ObservableObject {
    @Published var character: Character
    
    init(character: Character) {
        self.character = character
    }
    
    func updateHitPoints(_ newValue: Int) {
        character.hitPoints = newValue
    }
    
    func updateMoney(_ newValue: Int) {
        character.money = newValue
    }
    
    func updateAbility(_ ability: BootHillAbility, percentile: Int, rating: Int) {
        character.setAbility(ability, percentile: percentile, rating: rating)
    }
    
    func updateAttribute(_ attribute: Attribute, value: Int) {
        character.setAttribute(attribute, value: value)
    }
}