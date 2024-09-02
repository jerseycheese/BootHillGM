import SwiftUI

/// A scrollable view that displays a chat interface with messages.
struct ChatScrollView: View {
    /// The collection of messages to display in the chat.
    @Binding var messages: [BootHillGMApp.Message]
    
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 10) {
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                }
                .padding()
            }
            .onChange(of: messages) { _ in
                scrollToBottom(proxy: proxy)
            }
        }
    }
    
    /// Scrolls the view to the bottom to show the latest message.
    private func scrollToBottom(proxy: ScrollViewProxy) {
        if let lastMessage = messages.last {
            withAnimation {
                proxy.scrollTo(lastMessage.id, anchor: .bottom)
            }
        }
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

#if DEBUG
/// A preview provider for the ChatScrollView.
struct ChatScrollView_Previews: PreviewProvider {
    static var previews: some View {
        ChatScrollView(messages: .constant([
            BootHillGMApp.Message(content: "Hello, I'm the AI GM!", isAI: true),
            BootHillGMApp.Message(content: "Hi there! Let's create a character.", isAI: false),
            BootHillGMApp.Message(content: "Great! Let's start with your character's name.", isAI: true)
        ]))
    }
}
#endif