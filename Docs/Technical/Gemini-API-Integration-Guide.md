# Gemini API Integration Guide

## 1. Overview
This guide covers the integration of the Gemini 1.5 Pro API into the BootHillGM app, including usage limits, pricing, token management, function calling, context caching, system instructions, and long context capabilities.

## 2. API Usage Limits and Pricing

### Rate Limits
- 360 RPM (requests per minute)
- 4 million TPM (tokens per minute)

### Pricing (Pay-as-you-go)
- Input Price:
  - $3.50 per 1M tokens for <= 128K tokens
  - $7.00 per 1M tokens for > 128K tokens
- Context Caching:
  - $0.875 per 1M tokens for <= 128K tokens
  - $1.75 per 1M tokens for > 128K tokens
  - $4.50 / 1 million tokens per hour (storage)
- Output Price:
  - $10.50 per 1M tokens for <= 128K tokens
  - $21.00 per 1M tokens for > 128K tokens
- Tuning: Free of charge (Input / Output token costs stay the same for tuned models)

### Implementation Notes
- With the current rate limits, we do not implement client-side rate limiting. However, monitor API usage to ensure we stay within reasonable limits and optimize costs.
- Consider implementing usage tracking and alerts to monitor API consumption and associated costs.
- Be aware of potential increased token usage due to handling multiple genres and flexible character creation.
- For the MVP, prioritize API usage for core features such as basic genre adaptation, character creation, simple inventory management, and basic quest handling.

## 3. Token Management

### 3.1 Token Counting
- Use `count_tokens()` for input token count
- Use `usage_metadata` on response for detailed token counts

### 3.2 Multimodal Token Counting
- Images: Fixed 258 tokens, regardless of size
- Video: 263 tokens per second
- Audio: 32 tokens per second

### 3.3 System Instructions and Tools
- Increase total token count
- Function calling tools also contribute to token count

### 3.4 Best Practices
- Design prompts and responses with token limits in mind
- Monitor token usage for images, video, and audio content
- Implement a system to track and analyze token usage over time
- For Gemini models, 1 token ≈ 4 characters, 100 tokens ≈ 60-80 English words
- Consider the impact of genre-specific information on token usage

### 3.5 Implications for BootHillGM
- Monitor token usage for cost optimization
- Consider token limits when designing prompts and responses
- Be aware of additional tokens from system instructions and tools
- Implement efficient methods to include genre-specific information without excessive token usage

## 4. Function Calling

### 4.1 Overview
Function calling allows defining custom functions for structured data output, enhancing interaction with real-time information and external services. This is particularly useful for implementing genre-agnostic game mechanics and flexible character creation.

### 4.2 Key Concepts
- Function declarations describe API interfaces
- Models analyze declarations and queries to recommend function usage
- Returns OpenAPI compatible schema for function calls

### 4.3 Supported Models
- gemini-1.0-pro, gemini-1.0-pro-001
- gemini-1.5-flash-latest, gemini-1.5-pro-latest

### 4.4 Implementation Steps
1. Define an API function in your application code
2. Create function declarations with detailed descriptions
3. Declare functions during model initialization
4. Generate a function call using chat prompting
5. Process the function call response and execute the actual function
6. Send the function result back to the model for further processing

### 4.5 Best Practices
- Use clear, descriptive names for functions without spaces or special characters
- Provide detailed function descriptions with examples
- Use strongly typed parameters to reduce model hallucinations
- Offer concrete examples and constraints in parameter descriptions
- Design functions to be adaptable to various genres and game settings

### 4.6 Function Calling Modes
- AUTO: Default behavior, model decides on function call or natural language response
- ANY: Model always predicts a function call
- NONE: Model won't predict a function call

### 4.7 MVP Focus
- For the initial release, concentrate on implementing functions essential to core MVP features.
- Prioritize functions related to character creation, basic inventory management, and simple quest handling.
- Design functions to be extensible for future enhancements while keeping initial implementation focused on MVP requirements.

### 4.8 Implications for BootHillGM
- Enables creation of genre-agnostic game mechanics
- Facilitates flexible character creation across various settings
- Allows for dynamic adaptation of game rules based on chosen genre
- Enhances AI GM's ability to manage diverse game states and rules
- Supports more versatile and interactive storytelling across different genres

## 5. Context Caching
Context caching allows passing content to the model once, caching the input tokens, and referring to the cached tokens for subsequent requests. This is particularly useful for managing genre-specific information and game rules.

### 5.1 When to Use
- Chatbots with extensive system instructions
- Repetitive analysis of lengthy video files
- Recurring queries against large document sets
- Frequent code repository analysis or bug fixing
- Storing genre-specific rules and tropes for quick reference

### 5.2 Cost Considerations
- Cache token count: Billed at a reduced rate when included in subsequent prompts
- Storage duration: Billed based on the TTL of cached token count
- Other factors: Charges for non-cached input tokens and output tokens still apply

### 5.3 Managing Caches
- List caches: `caching.CachedContent.list()`
- Update cache TTL: `cache.update(ttl=datetime.timedelta(hours=2))`
- Delete cache: `cache.delete()`

### 5.4 Limitations and Considerations
- Minimum input token count: 32,768
- Maximum input token count: Model-dependent
- Cached content is treated as a prefix to the prompt
- Standard rate limits and token limits apply
- Cached tokens have a configurable time to live (TTL), defaulting to 1 hour if not set

### 5.5 Best Practices
- Use for scenarios with large, repetitive contexts (e.g., genre-specific rules)
- Monitor cache usage and costs
- Set appropriate TTLs based on your use case
- Consider the trade-off between caching costs and potential savings
- Regularly update cached content to reflect any changes in game rules or genre information

## 6. System Instructions
System instructions allow steering the behavior of the AI model based on specific needs and use cases, which is crucial for implementing a genre-agnostic approach.

### 6.1 Key Points
- System instructions are set when initializing the model and persist across all interactions
- They can be used to define personas, output formats, styles, goals, and provide additional context
- System instructions are part of the overall prompts and subject to standard data use policies
- While helpful, they don't fully prevent jailbreaks or leaks, so caution is advised with sensitive information

### 6.2 Use Cases
- Defining a persona or role (e.g., for a genre-agnostic Game Master)
- Specifying output format (e.g., Markdown, YAML)
- Setting output style and tone (e.g., verbosity, formality, target reading level)
- Defining goals or rules for tasks
- Providing additional context for prompts, including genre-specific information

### 6.3 Best Practices
- Be clear and specific in system instructions
- Consider the interaction between system instructions and user prompts
- Test different instruction sets to find the most effective for your use case
- Remember that system instructions persist across multiple turns in a conversation
- Include guidelines for handling different genres and adapting game mechanics

### 6.4 Limitations
- System instructions can guide the model but don't guarantee perfect adherence
- Sensitive information should be handled with caution

## 7. Long Context Capabilities

### 7.1 Context Window
- Gemini 1.5 Flash: 1-million-token context window
- Gemini 1.5 Pro: 2-million-token context window

### 7.2 Capabilities
- Process extensive amounts of text, equivalent to:
  - 50,000 lines of code
  - 8 average length English novels
  - Transcripts of over 200 average length podcast episodes
- Enhanced in-context learning within a single prompt
- Multimodal capabilities:
  - Video processing with high recall (>99.8% for Gemini 1.5 Flash)
  - Audio processing (up to 9.5 hours for Flash, 19 hours for Pro)

### 7.3 Use Cases
- Text: Summarization, Q&A, agentic workflows
- Video: Q&A, captioning, content moderation, real-time processing
- Audio: Real-time transcription and translation, podcast/video Q&A, meeting summarization
- Storing and processing extensive genre-specific information and game rules

### 7.4 Optimizations
- Context caching is the primary optimization technique
- Can significantly reduce costs for repetitive queries on the same data

### 7.5 Limitations
- Performance may vary when searching for multiple specific pieces of information
- Trade-off between retrieval accuracy and cost

### 7.6 Best Practices
- Default to including all relevant information in the context window
- Use context caching for cost optimization
- Consider the trade-off between performance and cost for multiple information retrieval
- Efficiently organize genre-specific information to maximize the use of the long context window

### 7.7 FAQs
- Model performance generally maintains with more tokens
- Context caching can help reduce costs
- Longer queries may have higher latency
- Gemini 1.5 Pro is generally more performant on long context use cases

## 8. Error Handling and Optimization
- Implement error handling for API responses in `GeminiAdvancedProvider`
- Consider implementing usage tracking and alerts to monitor API consumption and costs
- Regularly review and optimize API usage patterns to ensure efficient use of the service
- Monitor conversation history length and implement a system to summarize or truncate when necessary
- Evaluate the need for caching frequently requested information to reduce API calls and associated costs
- Consider implementing more advanced prompt engineering techniques to optimize token usage and reduce costs
- Implement efficient methods for storing and retrieving genre-specific information
- Develop a system for dynamically adjusting prompts based on the chosen genre to maintain consistent quality across different settings
- Implement efficient methods for including inventory and quest data in API requests without exceeding token limits
- Develop strategies for handling API responses that need to update both inventory and quest states

This guide provides comprehensive information on integrating and optimizing the use of the Gemini 1.5 Pro API in the BootHillGM app, with a focus on implementing genre-agnostic features and flexible character creation. Refer to this document for best practices, implementation details, and optimization strategies.
