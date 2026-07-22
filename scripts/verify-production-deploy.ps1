param(
  [string]$CanonicalBranch = "main",
  [switch]$AllowConsolidationBranch,
  [switch]$SkipBuild,
  [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

function Stop-Deploy($Message) {
  Write-Error "STOP: $Message"
  exit 1
}

$branch = (git branch --show-current).Trim()
$allowedBranches = @($CanonicalBranch)
if ($AllowConsolidationBranch) {
  $allowedBranches += "codex/autorell-canonical-baseline-2026-07-22"
}

if (-not $allowedBranches.Contains($branch)) {
  Stop-Deploy "Current branch '$branch' is not an allowed production branch."
}

$dirty = git status --porcelain
if ($dirty) {
  Stop-Deploy "Worktree is dirty."
}

$head = (git rev-parse HEAD).Trim()
git cat-file -e "origin/$branch^{commit}" 2>$null
if ($LASTEXITCODE -ne 0) {
  Stop-Deploy "Remote branch origin/$branch was not found."
}

$remoteHead = (git rev-parse "origin/$branch").Trim()
if ($head -ne $remoteHead) {
  Stop-Deploy "HEAD is not pushed to origin/$branch."
}

$migrationFiles = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" -ErrorAction SilentlyContinue
if (-not $migrationFiles) {
  Stop-Deploy "Could not verify Supabase migration files."
}

npm run typecheck
npm run lint

if (-not $SkipTests) {
  npm run test
}

if (-not $SkipBuild) {
  npm run build
}

Write-Output "Production deploy safety check passed for $branch at $head."
