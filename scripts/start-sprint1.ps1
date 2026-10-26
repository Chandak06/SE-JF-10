param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('backend', 'frontend')]
    [string]$Service
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }

function Test-SupportedNode([string]$Candidate) {
    if (-not $Candidate -or -not (Test-Path -LiteralPath $Candidate)) { return $false }
    $versionText = & $Candidate --version
    if ($LASTEXITCODE -ne 0) { return $false }
    $runtimeVersion = [version]($versionText.Trim().TrimStart('v'))
    return $runtimeVersion.Major -eq 24 -and $runtimeVersion.Minor -ge 15
}

if (-not (Test-SupportedNode $nodePath)) {
    $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-SupportedNode $bundledNode) { $nodePath = $bundledNode }
    else { throw 'Install Node 24.15 or newer within Node 24 (see .nvmrc), then rerun this command.' }
}

$originalPath = $env:PATH
Push-Location $projectRoot
try {
    $env:PATH = (Split-Path -Parent $nodePath) + ';' + $originalPath
    Write-Host ('Starting Sprint 1 ' + $Service + ' with Node ' + (& $nodePath --version))
    if ($Service -eq 'backend') {
        $entry = Join-Path $projectRoot 'node_modules\tsx\dist\cli.mjs'
        if (-not (Test-Path -LiteralPath $entry)) { throw 'Install backend dependencies with npm ci first.' }
        & $nodePath $entry watch backend/src/server.ts
    }
    else {
        Set-Location (Join-Path $projectRoot 'frontend')
        $entry = Join-Path $projectRoot 'frontend\node_modules\vite\bin\vite.js'
        if (-not (Test-Path -LiteralPath $entry)) { throw 'Install frontend dependencies with npm ci in frontend first.' }
        & $nodePath $entry
    }
    if ($LASTEXITCODE -ne 0) { throw ('The ' + $Service + ' process exited with code ' + $LASTEXITCODE) }
}
finally {
    $env:PATH = $originalPath
    Pop-Location
}
