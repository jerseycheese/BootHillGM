# Development Session Workflow Guide

## Phase 1: Task Selection with Claude Desktop

### Setup
1. Open Claude Desktop and load MCP context
2. Reference `/docs/mcp-brain/task-tracking/current_priorities.md`
3. Open Obsidian to review recent session logs

### Task Selection Process
1. Ask Claude to analyze:
   ```
   "Based on current_priorities.md and recent session logs, what should be our focus for this session? Consider:
   - Dependencies between tasks
   - Current project phase
   - Technical complexity
   - Impact on other systems"
   ```

2. Discuss with Claude:
   - Task complexity and scope
   - Required changes
   - Potential challenges
   - Success criteria

3. Document Selection:
   - Create new session log using template
   - Note task selection rationale
   - Define specific objectives
   - List success criteria

## Phase 2: Implementation (IDE + Claude API)

### Setup
1. Create new branch for the task
2. Open relevant files in IDE
3. Ensure Claude API integration is ready

### Implementation Steps
1. Initial Planning Chat:
   ```
   "I'm implementing [task]. Here's my current approach:
   [describe approach]
   Files involved:
   [list files]
   
   Can you review this plan and suggest any improvements?"
   ```

2. Iterative Development:
   - Write code incrementally
   - Use Claude API for:
     - Code review
     - Problem solving
     - Pattern suggestions
     - Edge case identification

3. Regular Check-ins:
   ```
   "Here's what I've implemented so far:
   [code snippet]
   
   Does this align with our planned approach? Any issues to address?"
   ```

## Phase 3: Verification (IDE + Claude API)

### Testing Process
1. Unit Test Review:
   ```
   "Here are the tests I've written:
   [test code]
   
   Are there any cases I'm missing?"
   ```

2. Integration Check:
   ```
   "I've integrated the new [component/feature]. Here's how it interacts with:
   [list affected systems]
   
   Can you spot any potential issues?"
   ```

3. Success Criteria Validation:
   - Review original success criteria
   - Verify each point with Claude
   - Document any remaining gaps

## Phase 4: Cleanup (IDE + Claude API)

### Code Cleanup
1. Request Code Review:
   ```
   "Can you review these changes for:
   - Code style consistency
   - Potential optimizations
   - Documentation clarity
   - Type safety"
   ```

2. Documentation Review:
   ```
   "Here's the documentation I've added:
   [documentation]
   
   Is anything unclear or missing?"
   ```

3. Final Verification:
   ```
   "Here's a summary of all changes:
   [change summary]
   
   Any final concerns before commit?"
   ```

## Phase 5: Documentation Update

### Return to Claude Desktop + Obsidian
1. Update Session Log:
   - Document final implementation
   - Note key decisions
   - Record challenges and solutions
   - Update status in task tracking

2. Knowledge Base Updates:
   ```
   "Based on this implementation, what updates do we need in:
   - Component knowledge maps
   - Implementation guides
   - Technical documentation?"
   ```

3. Create/Update Related Documents:
   - Update component relationships if needed
   - Add new implementation patterns
   - Link related documents

### Final Review
1. Check Documentation Coverage:
   - Implementation details
   - Decision rationale
   - Known limitations
   - Future considerations

2. Update Task Tracking:
   - Mark task as complete
   - Update dependencies
   - Note any new tasks identified
   - Adjust priorities if needed

## Tips for Effective Sessions

### Communication Patterns
1. With Claude Desktop:
   - Start with clear context
   - Ask for specific recommendations
   - Request step-by-step analysis
   - Verify understanding

2. With Claude API in IDE:
   - Share code context
   - Ask focused questions
   - Request specific improvements
   - Verify changes incrementally

### Documentation Best Practices
1. During Implementation:
   - Note key decisions
   - Document why, not just what
   - Track unexpected challenges
   - Record solution patterns

2. After Completion:
   - Update all affected docs
   - Cross-reference changes
   - Note impact on other systems
   - Document new patterns

### Session Management
1. Time Management:
   - Set clear session goals
   - Track progress
   - Note blocked items
   - Plan next steps

2. Context Management:
   - Keep task context focused
   - Document context switches
   - Maintain clear objectives
   - Track related changes

## Example Session

Here's a concrete example of how this workflow might look in practice:

### Task Selection
```
Human: "Based on current_priorities.md and recent session logs, what should we focus on today?"

Claude: "Looking at the priorities, implementing the Boot Hill rulebook reference tables is a high-priority task with no dependencies. This would enable accurate combat mechanics and dice rolling. Here's why this is optimal:
- No blocking dependencies
- Required for combat system completion
- Clear scope and requirements
- High impact on game accuracy"