---
name: speckit-constitution
description: Create or update project governing principles and development guidelines.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:lean
user-invocable: true
disable-model-invocation: false
---

# Speckit Constitution Skill

## User Input

```text
$ARGUMENTS
```

## Outline

1. Create or update the project constitution and store it in `.specify/memory/constitution.md`.
   - Project name, guiding principles, non-negotiable rules
   - Derive from user input and existing repo context (README, docs)
