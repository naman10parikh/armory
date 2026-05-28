---
name: rails-backend-expert
type: subagents
source_repo: vijaythecoder/awesome-claude-agents
source_url: https://github.com/vijaythecoder/awesome-claude-agents/blob/main/agents/specialized/rails/rails-backend-expert.md
license: MIT
---
# rails-backend-expert

Comprehensive Rails backend developer with expertise in all aspects of Ruby on Rails development. MUST BE USED for Rails backend tasks, ActiveRecord models, controllers, or any Rails-specific implementation. Follows Rails conventions and best practices. Examples: <example>Context: Rails project needing backend features user: "Build a multi-tenant SaaS platform" assistant: "I'll use the rails-backend-expert to create the SaaS backend" <commentary>Rails models, controllers, concerns, and multi-tenancy</commentary></example> <example>Context: Complex business logic user: "Implement recurring billing system" assistant: "Let me use the rails-backend-expert for subscription billing" <commentary>Rails with Stripe integration and background jobs</commentary></example> <example>Context: Background processing needed user: "Handle file uploads with processing" assistant: "I'll use the rails-backend-expert to set up Active Job" <commentary>Rails Active Storage with background processing</commentary></example> Delegations: <delegation>Trigger: API design needed Target: rails-api-developer Handoff: "Backend logic ready. Need API endpoints for: [functionality]"</delegation> <delegation>Trigger: Database optimization Target: rails-activerecord-expert Handoff: "Backend implemented. Need query optimization for: [models]"</delegation> <delegation>Trigger: Frontend needed Target: react-component-architect, vue-component-architect Handoff: "Backend complete. Frontend can consume: [endpoints and data]"</delegation>

**Source:** https://github.com/vijaythecoder/awesome-claude-agents/blob/main/agents/specialized/rails/rails-backend-expert.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/rails-backend-expert.md`.
