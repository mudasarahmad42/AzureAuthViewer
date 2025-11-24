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

# Check for uncommitted changes on current branch
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
    echo "ℹ️  No changes to commit on current branch"
fi

# Switch to gh-pages branch (create if it doesn't exist)
echo "🔄 Switching to gh-pages branch..."
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "📦 Creating gh-pages branch..."
    git checkout -b gh-pages
else
    git checkout gh-pages
    if [ $? -ne 0 ]; then
        echo "❌ Failed to checkout gh-pages branch"
        exit 1
    fi
    
    # Merge current branch into gh-pages
    if [ "$CURRENT_BRANCH" != "gh-pages" ]; then
        echo "🔀 Merging $CURRENT_BRANCH into gh-pages..."
        git merge "$CURRENT_BRANCH" --no-edit
        if [ $? -ne 0 ]; then
            echo "⚠️  Merge conflict or error. Please resolve manually."
            exit 1
        fi
    fi
fi

# Push to remote gh-pages branch
echo "📤 Pushing to origin/gh-pages..."
git push origin gh-pages

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

