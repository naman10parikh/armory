#!/usr/bin/env bash
# push-vercel-env.sh — copy the identity/chat secrets Armory needs into its Vercel project.
#
# The chairman runs this ONCE (from a Claude Code prompt: `! bash /Users/naman/armory/scripts/push-vercel-env.sh`).
# Claude never types secrets by design; this script reads them from the chairman's own .env files and
# pipes them straight into `vercel env add` — values are never echoed, only the variable NAMES.
#
# Sources (first hit wins):
#   GEMINI_API_KEY                        → sentinel/.env      (Armory chat → conversational mode)
#   AGENTMAIL_API_KEY                     → energy/.env        (Armory's own email)
#   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
#   TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER → energy/.env, energy/.env.restore (Armory's phone)
#   AGENTMAIL_WEBHOOK_SECRET              → energy/.env (the `whsec_…` shown once when you register
#                                           https://armory-murex.vercel.app/api/inbound/email as a webhook
#                                           in the AgentMail dashboard — WITHOUT it Armory computes replies
#                                           but never sends: the route refuses to be an open relay)
#   ARMORY_EMAIL                          → energy/.env (not a secret: the address /identity shows)
#   BEZALEL_TOKEN                         → energy/.env (per-agent token minted in the Bezalel dashboard)
# A name that is not on disk is skipped and listed — add it to energy/.env and re-run any time.
set -u
cd "$(dirname "$0")/../web" || exit 1

SRC=(/Users/naman/sentinel/.env /Users/naman/energy/.env /Users/naman/energy/.env.restore)
NAMES=(GEMINI_API_KEY AGENTMAIL_API_KEY AGENTMAIL_WEBHOOK_SECRET ARMORY_EMAIL TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_PHONE_NUMBER TWILIO_WHATSAPP_NUMBER BEZALEL_TOKEN)

lookup() { # print the value of $1 from the first source file that defines it (never echoed to terminal)
  local name="$1" f
  for f in "${SRC[@]}"; do
    [ -f "$f" ] || continue
    local v
    v=$(grep -E "^${name}=" "$f" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    if [ -n "$v" ]; then printf '%s' "$v"; return 0; fi
  done
  return 1
}

echo "Pushing env vars into the linked Vercel project ($(vercel project ls 2>/dev/null | grep -m1 -oE 'armory[^ ]*' || echo armory)) — production."
ok=0; missing=()
for n in "${NAMES[@]}"; do
  if v=$(lookup "$n"); then
    vercel env rm "$n" production --yes >/dev/null 2>&1 || true
    if printf '%s' "$v" | vercel env add "$n" production >/dev/null 2>&1; then
      echo "  ✓ $n"; ok=$((ok+1))
    else
      echo "  ✗ $n (vercel env add failed — are you logged in? try: vercel login)"
    fi
  else
    missing+=("$n")
  fi
done
[ ${#missing[@]} -gt 0 ] && echo "  – not found on disk, skipped: ${missing[*]}"
echo "Done: $ok pushed. Redeploy picks them up (Claude will trigger the next deploy)."
