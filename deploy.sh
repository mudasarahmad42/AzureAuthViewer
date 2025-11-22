#!/bin/bash
# Bash script for easy deployment to GitHub Pages
# Usage: ./deploy.sh [commit-message]

COMMIT_MESSAGE="${1:-Deploy to GitHub Pages}"

echo "🚀 Starting deployment process..."

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed or not in PATH"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging changes..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "$COMMIT_MESSAGE"
    
    if [ $? -ne 0 ]; then
        echo "❌ Commit failed"
        exit 1
    fi
else
    echo "ℹ️  No changes to commit"
fi

# Push to remote
echo "📤 Pushing to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔗 Check deployment status at:"
    echo "   https://github.com/mudasarahmad42/AzureAuthViewer/actions"
    echo ""
    echo "🌐 Your app will be available at:"
    echo "   https://mudasarahmad42.github.io/AzureAuthViewer/"
    echo ""
    echo "⏳ Deployment usually takes 2-3 minutes to complete."
else
    echo "❌ Push failed"
    exit 1
fi

