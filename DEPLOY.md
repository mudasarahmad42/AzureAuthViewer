# Deployment Guide for GitHub Pages

This guide will help you deploy the Angular application to GitHub Pages using GitHub Actions.

## Quick Deploy (Easiest Method)

### Windows (PowerShell):
```powershell
npm run deploy
```

Or with a custom commit message:
```powershell
.\deploy.ps1 "Your commit message here"
```

### Linux/Mac (Bash):
```bash
chmod +x deploy.sh
./deploy.sh
```

Or with a custom commit message:
```bash
./deploy.sh "Your commit message here"
```

The script will automatically:
1. Stage all changes
2. Commit with your message (or default)
3. Push to GitHub
4. Trigger the GitHub Actions workflow
5. Deploy to GitHub Pages

## Prerequisites

1. A GitHub repository (create one if you don't have it yet)
2. Git installed on your local machine
3. The repository should be initialized and connected to GitHub

## Step 1: Initialize Git Repository (if not already done)

If you haven't initialized git yet:

```bash
git init
git add .
git commit -m "Initial commit: Azure Auth Viewer"
```

## Step 2: Connect to GitHub Repository

If you haven't connected to a remote repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 3: Push Code to GitHub

The workflow is configured to run only when changes are pushed to the `gh-pages` branch.

### Option A: Push to gh-pages directly (for deployment)
```bash
git checkout -b gh-pages  # Create gh-pages branch if it doesn't exist
git push -u origin gh-pages
```

### Option B: Merge main into gh-pages (recommended workflow)
```bash
# Work on main branch for development
git checkout main
git push origin main

# When ready to deploy, merge main into gh-pages
git checkout gh-pages
git merge main
git push origin gh-pages  # This will trigger the deployment
```

## Step 4: Enable GitHub Pages

1. Go to your GitHub repository on GitHub.com
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. The workflow will automatically run when you push to `gh-pages` branch

**Important**: Make sure you select **"GitHub Actions"** and NOT **"Deploy from a branch"**. If you select "Deploy from a branch", GitHub will run the automatic `pages-build-deployment` workflow in addition to your custom workflow, causing duplicate deployments.

## Step 4a: Fix Environment Protection Rules (If Needed)

If you see an error: **"Branch 'gh-pages' is not allowed to deploy to github-pages due to environment protection rules"**, follow these steps:

1. Go to your GitHub repository on GitHub.com
2. Click on **Settings** tab
3. Scroll down to **Environments** in the left sidebar (under "Code and automation")
4. Click on **github-pages** environment
5. Under **Deployment branches**:
   - Select **"Selected branches"** radio button
   - Add **gh-pages** to the allowed branches list
6. Click **Save protection rules**

Alternatively, you can:
- Remove the branch restriction entirely
- Or disable environment protection rules if not needed

## Step 5: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually takes 2-3 minutes)
4. Once complete, your app will be available at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

## Manual Deployment

You can also trigger the deployment manually:

1. Go to the **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select the branch (main/master) and click **Run workflow**

## Important Notes

1. **Repository Name**: The workflow automatically uses your repository name for the base href. Make sure your repository name matches what you want in the URL.

2. **Azure AD Configuration**: After deployment, make sure to add your GitHub Pages URL to Azure AD redirect URIs:
   - Go to Azure Portal → App registrations → Your app → Authentication
   - Add: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

3. **Custom Domain**: If you want to use a custom domain, you can configure it in the GitHub Pages settings after deployment.

## Troubleshooting

### Workflow fails to build
- Check the Actions tab for error messages
- Ensure Node.js version is compatible (workflow uses Node 20 - Angular CLI requires v20.19+ or v22.12+)
- Verify all dependencies are in package.json

### 404 errors on routes
- The workflow automatically creates a 404.html file for Angular routing
- If you still see 404 errors, check that the base-href matches your repository name

### Pages not updating
- Clear your browser cache
- Check that the workflow completed successfully
- Verify the Pages source is set to "GitHub Actions"

### Seeing Two Workflows (pages-build-deployment and Deploy to GitHub Pages)
If you see both `pages-build-deployment` and `Deploy to GitHub Pages` workflows running:
1. Go to **Settings** → **Pages**
2. Under **Source**, make sure **"GitHub Actions"** is selected (NOT "Deploy from a branch")
3. If it was set to "Deploy from a branch", change it to "GitHub Actions"
4. The `pages-build-deployment` workflow will stop running automatically
5. Only your custom "Deploy to GitHub Pages" workflow will run

### Environment Protection Rules Error
If you see: **"Branch 'gh-pages' is not allowed to deploy to github-pages due to environment protection rules"**:
1. Go to **Settings** → **Environments** → **github-pages**
2. Under **Deployment branches**, select **"Selected branches"** and add **gh-pages** to allowed branches
3. Save the changes
4. Re-run the workflow from the Actions tab

## Local Testing

Before deploying, you can test the production build locally:

```bash
npm run build:gh-pages
```

Then serve the `dist/azure-auth-viewer/browser` folder with a local server to test.

