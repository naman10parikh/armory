---
name: zero-config-deployment-monitor
type: claudemd-rules
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/zero-config-deployment-monitor.json
license: MIT
---
# zero-config-deployment-monitor

Auto-detecting Vercel deployment monitor with zero configuration required. Automatically discovers your Vercel auth token from CLI config (macOS: ~/Library/Application Support/com.vercel.cli/auth.json, Linux: ~/.config/vercel/auth.json, Windows: %APPDATA%/vercel/auth.json) and project ID from .vercel/project.json. Shows real-time deployment status, build state icons, deployment URL preview, and time elapsed since last deployment. Falls back gracefully to environment variables VERCEL_TOKEN and VERCEL_PROJECT_ID if auto-detection fails. Works across all platforms without any manual setup.

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/zero-config-deployment-monitor.json

> Generated from the Armory catalog. Full metadata lives in `brain/components/claudemd-rules/zero-config-deployment-monitor.md`.
