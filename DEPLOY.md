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

```bash
git branch -M main  # or master, depending on your default branch
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your GitHub repository on GitHub.com
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. The workflow will automatically run when you push to `main` or `master` branch

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

## Local Testing

Before deploying, you can test the production build locally:

```bash
npm run build:gh-pages
```

Then serve the `dist/azure-auth-viewer/browser` folder with a local server to test.

