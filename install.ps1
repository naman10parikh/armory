# install.ps1 — Wire Armory into any coding harness (Windows / PowerShell).
#
# Usage:
#   .\install.ps1                     Auto-detect harness from current directory
#   .\install.ps1 -Cli claude         Target a specific harness
#   .\install.ps1 -Help

param(
  [string]$Cli = "",
  [switch]$Help
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# ── colours ───────────────────────────────────────────────────────────────────
function OK   ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function INFO ($msg) { Write-Host "  --> $msg"  -ForegroundColor Cyan  }
function WARN ($msg) { Write-Host "  [!] $msg"  -ForegroundColor Yellow }
function DIE  ($msg) { Write-Host "  [X] $msg"  -ForegroundColor Red; exit 1 }

# ── help ──────────────────────────────────────────────────────────────────────
function Show-Help {
  Write-Host @"

Armory installer (Windows) — wire the 24,000+ component registry into any coding harness.

Usage:
  .\install.ps1                   Auto-detect harness from current directory
  .\install.ps1 -Cli <harness>    Target a specific harness
  .\install.ps1 -Help             Show this message

Supported harnesses: claude, codex, opencode, gemini, hermes

Per-harness install command (no script needed):
  Claude Code : claude plugin marketplace add naman10parikh/armory && claude plugin install armory@armory
  Codex       : codex plugin marketplace add naman10parikh/armory
  OpenCode    : (opencode.json auto-discovered — copy from armory repo into project)
  Gemini CLI  : (copy .gemini\settings.json from armory repo into project)
  Hermes      : hermes plugin add naman10parikh/armory

"@
}

if ($Help) { Show-Help; exit 0 }

# ── MCP JSON merge ─────────────────────────────────────────────────────────────
function Inject-McpEntry {
  param([string]$Target, [string]$Key)

  $entry = @{ command = "npx"; args = @("-y", "armory-mcp") }

  if (-not (Test-Path $Target)) {
    $cfg = @{ $Key = @{ armory = $entry } }
    $cfg | ConvertTo-Json -Depth 10 | Set-Content $Target -Encoding UTF8
    OK "Created $Target with armory MCP entry"
    return
  }

  $raw = Get-Content $Target -Raw -Encoding UTF8
  try {
    $cfg = $raw | ConvertFrom-Json -AsHashtable
  } catch {
    WARN "Could not parse $Target — add manually: `"armory`": { `"command`": `"npx`", `"args`": [`"-y`", `"armory-mcp`"] }"
    return
  }

  if ($cfg[$Key] -and $cfg[$Key]["armory"]) {
    WARN "armory entry already present in $Target — skipping"
    return
  }

  if (-not $cfg[$Key]) { $cfg[$Key] = @{} }
  $cfg[$Key]["armory"] = $entry
  $cfg | ConvertTo-Json -Depth 10 | Set-Content $Target -Encoding UTF8
  OK "Merged armory MCP entry into $Target"
}

# ── detect harness ─────────────────────────────────────────────────────────────
function Detect-Harness {
  if ((Test-Path ".claude") -or (Test-Path ".claude\settings.json")) { return "claude" }
  if ((Test-Path ".codex")  -or (Test-Path ".codex\config.toml"))    { return "codex"  }
  if ((Test-Path "opencode.json") -or (Test-Path ".opencode"))       { return "opencode" }
  if ((Test-Path ".gemini") -or (Test-Path ".gemini\settings.json")) { return "gemini" }
  if (Test-Path ".hermes")                                            { return "hermes" }
  return "unknown"
}

# ── per-harness install ────────────────────────────────────────────────────────
function Install-Claude {
  Write-Host "`nInstalling Armory for Claude Code" -ForegroundColor White
  INFO "Step 1: Wiring armory-mcp into .mcp.json"
  Inject-McpEntry ".mcp.json" "mcpServers"
  INFO "Step 2: Installing the Claude Code plugin"
  Write-Host "`nRun these commands now:" -ForegroundColor White
  Write-Host "  claude plugin marketplace add naman10parikh/armory"
  Write-Host "  claude plugin install armory@armory`n"
  OK "MCP wired. Run the two commands above to complete plugin install."
}

function Install-Codex {
  Write-Host "`nInstalling Armory for Codex" -ForegroundColor White
  if (-not (Test-Path ".codex")) { New-Item -ItemType Directory -Path ".codex" | Out-Null }
  Inject-McpEntry ".codex\mcp.json" "mcpServers"
  Write-Host "`nRun this to add the marketplace:" -ForegroundColor White
  Write-Host "  codex plugin marketplace add naman10parikh/armory`n"
  OK "MCP wired. Add the marketplace to complete install."
}

function Install-OpenCode {
  Write-Host "`nInstalling Armory for OpenCode" -ForegroundColor White
  Inject-McpEntry "opencode.json" "mcp"
  OK "Done. OpenCode auto-discovers opencode.json from the project root."
}

function Install-Gemini {
  Write-Host "`nInstalling Armory for Gemini CLI" -ForegroundColor White
  if (-not (Test-Path ".gemini")) { New-Item -ItemType Directory -Path ".gemini" | Out-Null }
  Inject-McpEntry ".gemini\settings.json" "mcpServers"
  OK "Done. Restart Gemini CLI to pick up the new MCP server."
}

function Install-Hermes {
  Write-Host "`nInstalling Armory for Hermes" -ForegroundColor White
  if (-not (Test-Path ".hermes")) { New-Item -ItemType Directory -Path ".hermes" | Out-Null }
  Inject-McpEntry ".hermes\config.json" "mcpServers"
  Write-Host "`nOptional: hermes plugin add naman10parikh/armory`n"
  OK "MCP wired. Restart Hermes to activate."
}

# ── main ───────────────────────────────────────────────────────────────────────
Write-Host "`nArmory v0.2.0 installer (Windows)" -ForegroundColor White
Write-Host "Repo: $ScriptDir"

$harness = $Cli
if (-not $harness) {
  $harness = Detect-Harness
  if ($harness -eq "unknown") {
    WARN "No harness detected. Use -Cli <harness> to target one explicitly."
    Show-Help
    exit 0
  }
  INFO "Detected harness: $harness"
}

switch ($harness) {
  "claude"   { Install-Claude   }
  "codex"    { Install-Codex    }
  "opencode" { Install-OpenCode }
  "gemini"   { Install-Gemini   }
  "hermes"   { Install-Hermes   }
  default    { DIE "Unknown harness '$harness'. Supported: claude, codex, opencode, gemini, hermes" }
}

Write-Host "`nArmory install complete" -ForegroundColor White
Write-Host "  MCP server : npx -y armory-mcp (starts on-demand)"
Write-Host "  Skills     : $ScriptDir\components\skills\"
Write-Host "  Agents     : $ScriptDir\components\agents\"
Write-Host "  Commands   : $ScriptDir\components\commands\"
Write-Host "  Docs       : https://armory-murex.vercel.app`n"
