import SwiftUI

struct CharacterSheetView: View {
    @ObservedObject var viewModel: CharacterSheetViewModel
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(viewModel.character.name)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                CharacterInfoSection(character: viewModel.character)
                
                AttributesSection(attributes: viewModel.character.attributes)
                
                AbilitiesSection(abilities: viewModel.character.abilities)
                
                if let background = viewModel.character.background {
                    BackgroundSection(background: background)
                }
            }
            .padding()
        }
    }
}

struct CharacterInfoSection: View {
    let character: Character
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Character Info")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Age: \(character.age ?? 0)")
            Text("Occupation: \(character.occupation ?? "Unknown")")
            Text("Hit Points: \(character.hitPoints)/\(character.maximumHitPoints)")
            Text("Money: $\(character.money)")
        }
    }
}

struct AttributesSection: View {
    let attributes: [Attribute: Int]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Attributes")
                .font(.title2)
                .fontWeight(.semibold)
            
            ForEach(Attribute.allCases, id: \.self) { attribute in
                HStack {
                    Text(attribute.rawValue)
                    Spacer()
                    Text("\(attributes[attribute] ?? 0)")
                }
            }
        }
    }
}

struct AbilitiesSection: View {
    let abilities: [BootHillAbility: AbilityScore]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Abilities")
                .font(.title2)
                .fontWeight(.semibold)
            
            ForEach(BootHillAbility.allCases, id: \.self) { ability in
                if let score = abilities[ability] {
                    HStack {
                        Text(ability.rawValue)
                        Spacer()
                        Text("\(score.percentile)% (Rating: \(score.rating))")
                    }
                }
            }
        }
    }
}

struct BackgroundSection: View {
    let background: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Background")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(background)
        }
    }
}

struct CharacterSheetView_Previews: PreviewProvider {
    static var previews: some View {
        CharacterSheetView(viewModel: CharacterSheetViewModel(character: Character(name: "John Doe")))
    }
}
