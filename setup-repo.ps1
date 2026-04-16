# ============================================================
# setup-repo.ps1 — Corre esto UNA VEZ desde la carpeta del proyecto
# Inicializa git, crea las 3 ramas y sube a GitHub
# ============================================================
# USO: Abre PowerShell en C:\...\backoffice-vivero-urbano y corre:
#   .\setup-repo.ps1 -GithubUser "carlosaurelio94"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$GithubUser = "carlosaurelio94"
)

$RepoName = "backoffice-vivero-urbano"
$RemoteUrl = "https://github.com/$GithubUser/$RepoName.git"

Write-Host "==> Inicializando repositorio git..." -ForegroundColor Cyan
git init -b main
git config user.email "carlosarc10@gmail.com"
git config user.name "Carlos"

Write-Host "==> Agregando todos los archivos..." -ForegroundColor Cyan
git add .
git commit -m "feat: initial project setup

Frontend: Next.js 14 + TypeScript + Tailwind + TanStack Query + Zustand
Backend:  Spring Boot 3.3 + Java 21 + Clean Architecture
Infra:    Docker Compose (PostgreSQL), GitHub Actions, .gitignore"

Write-Host "==> Creando ramas dev y test desde main..." -ForegroundColor Cyan
git branch dev
git branch test
# Quedamos en main (= prod)

Write-Host "==> Ramas creadas: main (prod), test, dev" -ForegroundColor Green

Write-Host ""
Write-Host "PASO SIGUIENTE:" -ForegroundColor Yellow
Write-Host "1. Crea el repo PRIVADO en GitHub: https://github.com/new"
Write-Host "   Nombre: $RepoName | Privado: SI | Sin README ni .gitignore"
Write-Host ""
Write-Host "2. Luego corre:"
Write-Host "   git remote add origin $RemoteUrl" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host "   git push origin dev" -ForegroundColor White
Write-Host "   git push origin test" -ForegroundColor White
