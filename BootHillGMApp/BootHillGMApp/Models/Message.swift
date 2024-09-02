import Foundation

/// Represents a message in the chat interface.
/// Conforms to Identifiable for use in SwiftUI lists and Equatable for change detection.
public struct Message: Identifiable, Equatable {
    /// Unique identifier for the message.
    public let id = UUID()
    
    /// The content of the message.
    public let content: String
    
    /// Indicates whether the message is from the AI (true) or the user (false).
    public let isAI: Bool
    
    /// Initializes a new Message instance.
    /// - Parameters:
    ///   - content: The content of the message.
    ///   - isAI: Whether the message is from the AI (true) or the user (false).
    public init(content: String, isAI: Bool) {
        self.content = content
        self.isAI = isAI
    }
    
    /// Compares two Message instances for equality.
    public static func == (lhs: Message, rhs: Message) -> Bool {
        return lhs.id == rhs.id && lhs.content == rhs.content && lhs.isAI == rhs.isAI
    }
}