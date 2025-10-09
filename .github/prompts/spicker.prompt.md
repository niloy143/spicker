# Spicker Extension - Copilot Workflow Instructions

## 🔄 Workflow Protocol

**CRITICAL**: Before performing ANY task or responding to ANY user request, you MUST:

1. **First**, read and analyze the current `.github/copilot-instructions.md` file
2. **Then**, use those instructions as your primary guide for understanding the project
3. **Always** reference the copilot-instructions.md for:
   - Project architecture and patterns
   - Coding conventions and standards
   - Build processes and workflows
   - Component structures and data flows
   - Common pitfalls and best practices

## 📝 Task Execution Flow

### For ALL User Requests:
```
1. 📖 Read .github/copilot-instructions.md (MANDATORY FIRST STEP)
2. 🔍 Analyze user request in context of existing instructions
3. 💡 Plan task using instruction guidance
4. ⚡ Execute task following established patterns
5. 🔄 Update instructions if new patterns emerge
6. ✅ Validate against project standards
```

### When User Provides New Information:
- **Analyze** if this represents a new pattern, convention, or architectural decision
- **Document** new knowledge in `.github/copilot-instructions.md`
- **Update** relevant sections with specific examples from codebase
- **Ensure** instructions remain concise (~20-50 lines) and actionable

## 🔧 Instruction Maintenance Rules

### When to Update `.github/copilot-instructions.md`:
- ✅ **New architectural patterns** discovered in code
- ✅ **Modified workflows** or build processes
- ✅ **New component patterns** or data flows
- ✅ **Updated dependencies** affecting development
- ✅ **Security or performance patterns** identified
- ✅ **User feedback** indicating unclear documentation

### Update Protocol:
1. **Identify** the specific section needing updates
2. **Add/modify** with concrete examples from current codebase
3. **Preserve** valuable existing content
4. **Maintain** markdown structure and formatting
5. **Test** that updated instructions are clear and actionable

### What NOT to Update:
- ❌ Generic programming advice ("write tests", "handle errors")
- ❌ Temporary implementation details
- ❌ User-specific preferences
- ❌ Aspirational practices not yet implemented

## 🎯 Quality Standards

### Instructions Must Be:
- **Discoverable**: Based on actual codebase patterns
- **Actionable**: Provide specific examples and commands
- **Concise**: 20-50 lines maximum
- **Current**: Reflect latest project state
- **Structured**: Clear sections with markdown formatting

### Always Include:
- Specific file paths and component names
- Code examples from actual implementation
- Command-line instructions for builds/tests
- Common pitfalls with solutions
- Integration points and data flows

## 🚨 Emergency Override

**ONLY** if `.github/copilot-instructions.md` is missing or corrupted:
1. Reconstruct based on codebase analysis
2. Follow the established format from similar projects
3. Flag for user review and validation

## 📋 Validation Checklist

Before completing any task, ensure:
- [ ] Copilot-instructions.md was read first
- [ ] Task aligns with documented patterns
- [ ] Any new patterns were documented
- [ ] Instructions remain synchronized with codebase
- [ ] Response follows established conventions

---

## 🎯 Mission Statement

**Keep Spicker's copilot-instructions.md as the single source of truth for project knowledge, continuously updated to reflect the evolving codebase and development practices.**
