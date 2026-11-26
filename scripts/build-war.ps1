#Requires -Version 5.1
<#
.SYNOPSIS
    Genera el WAR estático de la UI de JerokySys.

.DESCRIPTION
    1. Ejecuta pnpm build y genera out/.
    2. Empaqueta out/ + el filtro de sesión en infra/ui-war/target/ROOT.war.

    Si Next se detiene por el aviso de seguridad, reintenta pnpm build una vez.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "==> Build estático (pnpm build)" -ForegroundColor Cyan
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Warning "pnpm build falló. Reintentando una vez (aviso de seguridad de Next)..."
    pnpm build
}
if ($LASTEXITCODE -ne 0) {
    throw "pnpm build falló. Revisá el error y volvé a intentar."
}

Write-Host "==> Empaquetando WAR" -ForegroundColor Cyan
mvn -f infra/ui-war/pom.xml clean package
if ($LASTEXITCODE -ne 0) {
    throw "mvn package falló. Revisá el error y volvé a intentar."
}

$war = Join-Path $root "infra/ui-war/target/ROOT.war"
Write-Host ""
Write-Host "WAR generado: $war" -ForegroundColor Green
