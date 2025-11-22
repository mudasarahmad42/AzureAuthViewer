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
Write-Host "📋 Current branch: $currentBranch" -ForegroundColor Yellow

# Check for uncommitted changes on current branch
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
    Write-Host "ℹ️  No changes to commit on current branch" -ForegroundColor Gray
}

# Switch to gh-pages branch (create if it doesn't exist)
Write-Host "🔄 Switching to gh-pages branch..." -ForegroundColor Yellow
$ghPagesExists = git show-ref --verify --quiet refs/heads/gh-pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Creating gh-pages branch..." -ForegroundColor Yellow
    git checkout -b gh-pages
} else {
    git checkout gh-pages
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to checkout gh-pages branch" -ForegroundColor Red
        exit 1
    }
    
    # Merge current branch into gh-pages
    if ($currentBranch -ne "gh-pages") {
        Write-Host "🔀 Merging $currentBranch into gh-pages..." -ForegroundColor Yellow
        git merge $currentBranch --no-edit
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Merge conflict or error. Please resolve manually." -ForegroundColor Red
            exit 1
        }
    }
}

# Push to remote gh-pages branch
Write-Host "📤 Pushing to origin/gh-pages..." -ForegroundColor Yellow
git push origin gh-pages

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

