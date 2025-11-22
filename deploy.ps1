# PowerShell script for easy deployment to GitHub Pages
# Usage: .\deploy.ps1 [commit-message]

param(
    [string]$CommitMessage = "Deploy to GitHub Pages"
)

Write-Host "🚀 Starting deployment process..." -ForegroundColor Cyan

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Not a git repository. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current
Write-Host " branch: $currentBranch" -ForegroundColor Yellow

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Staging changes..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Commit failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Gray
}

# Push to remote
Write-Host "📤 Pushing to origin/$currentBranch..." -ForegroundColor Yellow
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Check deployment status at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/mudasarahmad42/AzureAuthViewer/actions" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Your app will be available at:" -ForegroundColor Cyan
    Write-Host "   https://mudasarahmad42.github.io/AzureAuthViewer/" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Deployment usually takes 2-3 minutes to complete." -ForegroundColor Yellow
} else {
    Write-Host "❌ Push failed" -ForegroundColor Red
    exit 1
}

