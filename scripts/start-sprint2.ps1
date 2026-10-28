param([switch]$ProvisionAdmin)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
function Test-SupportedNode([string]$Candidate) {
    if (-not $Candidate -or -not (Test-Path -LiteralPath $Candidate)) { return $false }
    $runtimeVersion = [version]((& $Candidate --version).Trim().TrimStart('v'))
    return $LASTEXITCODE -eq 0 -and $runtimeVersion.Major -eq 24 -and $runtimeVersion.Minor -ge 15
}
if (-not (Test-SupportedNode $nodePath)) {
    $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-SupportedNode $bundledNode) { $nodePath = $bundledNode }
    else { throw 'Install supported Node 24.15+ within Node 24 and locked root/frontend dependencies first.' }
}
$originalPath = $env:PATH
Push-Location $projectRoot
try {
    $env:PATH = (Split-Path -Parent $nodePath) + ';' + $originalPath
    Write-Host 'Building the separate local Sprint 2 demo. Atlas configuration is not used.'
    & $nodePath scripts/build-local-demo.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Local frontend build failed. Run npm ci at root and in frontend first.' }
    $demoArguments = @('--import', 'tsx', 'backend/scripts/local-demo.ts', '--confirm-local-development')
    if ($ProvisionAdmin) { $demoArguments += '--provision-admin' }
    & $nodePath @demoArguments
    if ($LASTEXITCODE -ne 0) { throw 'Local demo failed. Check the safe startup message above.' }
} finally {
    $env:PATH = $originalPath
    Pop-Location
}
