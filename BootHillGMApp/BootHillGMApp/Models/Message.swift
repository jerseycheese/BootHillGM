import Foundation

/// Represents a message in the chat interface.
public struct Message: Identifiable, Equatable {
    /// Unique identifier for the message.
    public let id = UUID()
    
    /// The content of the message.
    public let content: String
    
    /// Indicates whether the message is from the AI (true) or the user (false).
    public let isAI: Bool
    
    /// Metadata for the message, including the stage of character creation and debugging info.
    public let metadata: MessageMetadata
    
    /// Initializes a new Message instance.
    /// - Parameters:
    ///   - content: The content of the message.
    ///   - isAI: Whether the message is from the AI (true) or the user (false).
    ///   - metadata: Metadata for the message.
    public init(content: String, isAI: Bool, metadata: MessageMetadata) {
        self.content = content
        self.isAI = isAI
        self.metadata = metadata
    }
    
    /// Compares two Message instances for equality.
    public static func == (lhs: Message, rhs: Message) -> Bool {
        return lhs.id == rhs.id && lhs.content == rhs.content && lhs.isAI == rhs.isAI && lhs.metadata == rhs.metadata
    }
}

/// Represents metadata for a message in the character creation process.
public struct MessageMetadata: Equatable {
    /// The stage of the character creation process when this message was created.
    public let stage: CharacterCreationStage
    
    /// Additional debugging information, if any.
    public let debugInfo: String?
    
    public init(stage: CharacterCreationStage, debugInfo: String? = nil) {
        self.stage = stage
        self.debugInfo = debugInfo
    }
}

/// Represents the stages of character creation.
public enum CharacterCreationStage: String {
    case name
    case age
    case occupation
    case attributesExplanation
    case attributesRolling
    case abilitiesExplanation
    case abilitiesRolling
    case background
    case complete
}