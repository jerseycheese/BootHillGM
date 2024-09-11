import SwiftUI

struct ChatScrollView: View {
    @Binding var messages: [Message]
    
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 10) {
                    ForEach(messages) { message in
                        VStack(alignment: message.isAI ? .leading : .trailing, spacing: 4) {
                            Text(message.content)
                                .padding()
                                .background(message.isAI ? Color.blue.opacity(0.2) : Color.gray.opacity(0.2))
                                .cornerRadius(10)
                            
                            Text(metadataText(for: message))
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: message.isAI ? .leading : .trailing)
                    }
                }
                .padding()
            }
            .onChange(of: messages) { _ in
                scrollToBottom(proxy: proxy)
            }
        }
    }
    
    private func scrollToBottom(proxy: ScrollViewProxy) {
        if let lastMessage = messages.last {
            withAnimation {
                proxy.scrollTo(lastMessage.id, anchor: .bottom)
            }
        }
    }
    
    /// Generates the metadata text for a given message.
    private func metadataText(for message: Message) -> String {
        var text = "Stage: \(message.metadata.stage.rawValue)"
        if let debugInfo = message.metadata.debugInfo {
            text += " | \(debugInfo)"
        }
        return text
    }
}

/// A view that represents a single message bubble in the chat.
struct MessageBubble: View {
    let message: BootHillGMApp.Message
    
    var body: some View {
        HStack {
            if message.isAI {
                Spacer()
            }
            Text(message.content)
                .padding()
                .background(message.isAI ? Color.blue.opacity(0.2) : Color.gray.opacity(0.2))
                .cornerRadius(10)
            if !message.isAI {
                Spacer()
            }
        }
    }
}

// Update the preview provider to include metadata
struct ChatScrollView_Previews: PreviewProvider {
    static var previews: some View {
        ChatScrollView(messages: .constant([
            Message(content: "Hello, I'm the AI GM!", isAI: true, metadata: MessageMetadata(stage: .name)),
            Message(content: "Hi there! Let's create a character.", isAI: false, metadata: MessageMetadata(stage: .name)),
            Message(content: "Great! Let's start with your character's name.", isAI: true, metadata: MessageMetadata(stage: .name, debugInfo: "Prompting for name"))
        ]))
    }
}