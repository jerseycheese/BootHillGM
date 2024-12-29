# AI-Driven Development Workflow

## Phase 1: Task Selection & Prompt Planning (Claude Desktop)

### Initial Consultation
1. Ask Claude Desktop to analyze priorities:
   ```
   "Based on current_priorities.md and recent session logs, what should be our next task? 
   Please consider dependencies, complexity, and impact."
   ```

2. Once task is selected, ask Claude Desktop to:
   - Analyze required changes
   - Identify affected files/components
   - List potential challenges
   - Define success criteria

### Prompt Engineering
Ask Claude Desktop to craft an implementation prompt:
```
"Please create a detailed prompt I can use with Claude API in my IDE to implement [selected task].
The prompt should:
- Provide necessary context about our project
- Explain the specific task requirements
- List affected files and components
- Include any relevant architectural patterns we use
- Specify our code conventions"
```

### Session Documentation
Create session log with:
- Selected task and rationale
- The crafted implementation prompt
- Success criteria
- Expected challenges

## Phase 2: Implementation (Claude API in IDE)

### Initial Generation
1. Use the prompt crafted by Claude Desktop in your IDE
2. Review the generated code
3. If adjustments needed, ask Claude Desktop to modify the prompt

### Iterative Refinement
When changes needed, ask Claude Desktop:
```
"The API generated this code:
[paste code]

It needs adjustment because [reason].
Please give me a focused prompt to get the specific changes needed."
```

## Phase 3: Verification (Claude API)

### Review Prompt Generation
Ask Claude Desktop:
```
"Please create a prompt for the API to review our implementation of [task].
Include checks for:
- Adherence to our patterns
- Edge cases
- Integration points
- Type safety
- Error handling"
```

### Testing Prompt Generation
Ask Claude Desktop:
```
"Please create a prompt for the API to generate tests for the new implementation.
Consider:
- Unit tests
- Integration tests
- Edge cases
- Error scenarios"
```

## Phase 4: Cleanup

### Documentation Prompt
Ask Claude Desktop:
```
"Please create a prompt for the API to generate/update documentation for:
[list affected files/components]

The documentation should follow our existing patterns and include:
- Implementation details
- Design decisions
- Usage examples"
```

### Final Review Prompt
Ask Claude Desktop to create a comprehensive review prompt for:
- Code style consistency
- Documentation completeness
- Test coverage
- Integration points

## Phase 5: Knowledge Base Update (Claude Desktop)

### Documentation Updates
Ask Claude Desktop to:
1. Update session log with implementation details
2. Identify needed updates to:
   - Component knowledge maps
   - Implementation guides
   - Technical documentation

### Project Status Update
Ask Claude Desktop to:
1. Update task tracking
2. Identify new tasks or dependencies
3. Adjust priorities if needed
4. Suggest next tasks

## Example Workflow

### Task Selection
```
Human: "What should be our next task based on current_priorities.md?"

Claude Desktop: "Let's implement the Boot Hill rulebook reference tables. 
Here's a prompt for the API to generate the implementation:

'Please implement the Boot Hill rulebook reference tables system.
Key requirements:
- Type-safe table definitions
- Dice rolling utilities
- Table lookup functionality
...'"
```

### Implementation
```
Human: [Uses provided prompt in IDE]

[Reviews generated code]