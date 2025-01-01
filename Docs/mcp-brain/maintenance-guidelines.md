# MCP + Obsidian Maintenance Guidelines
## Session Management

### AI Collaboration
#### Claude Workflow
1. Planning (Desktop)
   - Review requirements/context
   - Generate implementation prompt
   - Create verification checklist

2. Implementation (API)
   - Execute from prompt
   - Generate code/tests
   - Provide verification steps

3. Cleanup (API)
   - Review implementation
   - Update documentation
   - Generate commit message

### Starting a New Session
1. Create a new session log using the template in `session-logs/_template.md`
2. Name format: `YYYY-MM-DD-focus-area.md`
3. Link to relevant existing documentation
4. Set clear objectives for the session

### During Sessions
1. Document key decisions as they're made
2. Update task tracking in real-time
3. Create links between new insights and existing knowledge
4. Tag important concepts for future reference

### Ending Sessions
1. Summarize key takeaways
2. Update task priorities
3. Set goals for next session
4. Commit changes to version control

## Knowledge Management

### Component Analysis
1. Keep component relationship maps updated
2. Document new dependencies
3. Track component evolution
4. Maintain implementation notes

### Task Tracking
1. Update `current_priorities.md` regularly
2. Move completed tasks to archive
3. Adjust priorities based on progress
4. Link tasks to relevant documentation

### Knowledge Maps
1. Update when new connections are discovered
2. Maintain hierarchy of concepts
3. Link to specific implementation details
4. Keep diagrams current

## Documentation Standards

### File Naming
- Use lowercase with hyphens
- Include dates for temporal documents
- Use descriptive names
- Maintain consistent prefixes

### Content Structure
- Use clear headings
- Include status indicators
- Link related documents
- Tag key concepts

### Cross-Referencing
- Use relative links
- Maintain bidirectional links
- Update references when moving files
- Check link validity regularly

## MCP Integration

### Context Management
1. Keep MCP config updated with new directories
2. Maintain clean separation of concerns
3. Update context when adding new features
4. Document AI interaction patterns

### Version Control
1. Commit documentation updates
2. Use meaningful commit messages
3. Maintain .gitignore for MCP files
4. Regular backups of knowledge base

## Best Practices

### Organization
- Keep related files together
- Use consistent directory structure
- Maintain index files
- Regular cleanup of obsolete content

### Workflow
1. Start with session template
2. Update knowledge maps
3. Track tasks
4. Document decisions
5. Commit changes

### AI Collaboration
- Clear session objectives
- Document AI insights
- Maintain context
- Track decision rationale

### Quality Control
- Regular validation of links
- Content reviews
- Structure maintenance
- Knowledge base cleanup

## Emergency Procedures

### Recovery Steps
1. Check last known good state
2. Restore from version control
3. Rebuild knowledge maps
4. Update cross-references

### Troubleshooting
- Check file permissions
- Verify MCP config
- Validate file structure
- Review recent changes