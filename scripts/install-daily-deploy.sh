#!/usr/bin/env bash
# install-daily-deploy.sh — deploy Armory to production every morning (macOS launchd). CP143 T48.
#
# Why: the nightly autolab refresh commits new rows to main, but nothing ever deployed them. Production
# sat on 2026-09-01 data for 24 days while main moved on. This runs the same proven path a person runs,
# scripts/deploy-prod.sh (clean worktree → vercel deploy → alias → every page checked), once a day after
# the refresh lands. It uses this Mac's own Vercel login; no token is copied anywhere.
#
# Usage:  bash scripts/install-daily-deploy.sh [HOUR]     # HOUR 0-23 local, default 7
# Undo:   launchctl unload ~/Library/LaunchAgents/com.energy.armory.deploy.plist && rm that file
# Log:    ~/Library/Logs/armory-deploy.log
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOUR="${1:-7}"
PLIST="$HOME/Library/LaunchAgents/com.energy.armory.deploy.plist"
LOG="$HOME/Library/Logs/armory-deploy.log"
mkdir -p "$(dirname "$PLIST")" "$(dirname "$LOG")"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.energy.armory.deploy</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>-lc</string>
    <string>export PATH=/usr/local/bin:/opt/homebrew/bin:\$PATH; cd "$ROOT" &amp;&amp; echo "=== \$(date) ===" &amp;&amp; git checkout -q main &amp;&amp; git pull --ff-only --quiet &amp;&amp; bash scripts/deploy-prod.sh</string>
  </array>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>$HOUR</integer><key>Minute</key><integer>0</integer></dict>
  <key>RunAtLoad</key><false/>
</dict></plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "✓ Armory deploys to production daily at ${HOUR}:00 local → $PLIST (log: $LOG)"
