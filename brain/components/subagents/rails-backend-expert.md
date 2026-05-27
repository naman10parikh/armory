---
name: rails-backend-expert
type: subagents
description: >
  Comprehensive Rails backend developer with expertise in all aspects of Ruby on Rails development. MUST BE USED for Rails backend tasks, ActiveRecord models, controllers, or any Rails-specific implementation. Follows Rails conventions and best practices. Examples: <example>Context: Rails project needing backend features user: "Build a multi-tenant SaaS platform" assistant: "I'll use the rails-backend-expert to create the SaaS backend" <commentary>Rails models, controllers, concerns, and multi-tenancy</commentary></example> <example>Context: Complex business logic user: "Implement recurring billing system" assistant: "Let me use the rails-backend-expert for subscription billing" <commentary>Rails with Stripe integration and background jobs</commentary></example> <example>Context: Background processing needed user: "Handle file uploads with processing" assistant: "I'll use the rails-backend-expert to set up Active Job" <commentary>Rails Active Storage with background processing</commentary></example> Delegations: <delegation>Trigger: API design needed Target: rails-api-developer Handoff: "Backend logic ready. Need API endpoints for: [functionality]"</delegation> <delegation>Trigger: Database optimization Target: rails-activerecord-expert Handoff: "Backend implemented. Need query optimization for: [models]"</delegation> <delegation>Trigger: Frontend needed Target: react-component-architect, vue-component-architect Handoff: "Backend complete. Frontend can consume: [endpoints and data]"</delegation>
source_repo: vijaythecoder/awesome-claude-agents
source_url: https://github.com/vijaythecoder/awesome-claude-agents/blob/main/agents/specialized/rails/rails-backend-expert.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [vijay, rails, subagents]
---
## What it is
`vijaythecoder/awesome-claude-agents` sub-agent `rails-backend-expert` (tier: specialized, category: rails). Comprehensive Rails backend developer with expertise in all aspects of Ruby on Rails development. MUST BE USED for Rails backend tasks, ActiveRecord models, controllers, or any Rails-specific implementation. Follows Rails conventions and best practices. Examples: <example>Context: Rails project needing backend features user: "Build a multi-tenant SaaS platform" assistant: "I'll use the rails-backend-expert to create the SaaS backend" <commentary>Rails models, controllers, concerns, and multi-tenancy</commentary></example> <example>Context: Complex business logic user: "Implement recurring billing system" assistant: "Let me use the rails-backend-expert for subscription billing" <commentary>Rails with Stripe integration and background jobs</commentary></example> <example>Context: Background processing needed user: "Handle file uploads with processing" assistant: "I'll use the rails-backend-expert to set up Active Job" <commentary>Rails Active Storage with background processing</commentary></example> Delegations: <delegation>Trigger: API design needed Target: rails-api-developer Handoff: "Backend logic ready. Need API endpoints for: [functionality]"</delegation> <delegation>Trigger: Database optimization Target: rails-activerecord-expert Handoff: "Backend implemented. Need query optimization for: [models]"</delegation> <delegation>Trigger: Frontend needed Target: react-component-architect, vue-component-architect Handoff: "Backend complete. Frontend can consume: [endpoints and data]"</delegation>

## When to use it
Comprehensive Rails backend developer with expertise in all aspects of Ruby on Rails development. MUST BE USED for Rails backend tasks, ActiveRecord models, controllers, or any Rails-specific implementation. Follows Rails conventions and best practices. Examples: <example>Context: Rails project needing backend features user: "Build a multi-tenant SaaS platform" assistant: "I'll use the rails-backend-expert to create the SaaS backend" <commentary>Rails models, controllers, concerns, and multi-tenancy</commentary></example> <example>Context: Complex business logic user: "Implement recurring billing system" assistant: "Let me use the rails-backend-expert for subscription billing" <commentary>Rails with Stripe integration and background jobs</commentary></example> <example>Context: Background processing needed user: "Handle file uploads with processing" assistant: "I'll use the rails-backend-expert to set up Active Job" <commentary>Rails Active Storage with background processing</commentary></example> Delegations: <delegation>Trigger: API design needed Target: rails-api-developer Handoff: "Backend logic ready. Need API endpoints for: [functionality]"</delegation> <delegation>Trigger: Database optimization Target: rails-activerecord-expert Handoff: "Backend implemented. Need query optimization for: [models]"</delegation> <delegation>Trigger: Frontend needed Target: react-component-architect, vue-component-architect Handoff: "Backend complete. Frontend can consume: [endpoints and data]"</delegation>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/vijaythecoder/awesome-claude-agents/raw/main/agents/specialized/rails/rails-backend-expert.md -o .claude/agents/rails-backend-expert.md
```

## Notes
Extracted from [`vijaythecoder/awesome-claude-agents`](https://github.com/vijaythecoder/awesome-claude-agents/blob/main/agents/specialized/rails/rails-backend-expert.md). Pending verify -> promote.
