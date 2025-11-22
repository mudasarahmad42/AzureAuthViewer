# Fix GitHub Pages Environment Protection Rules

If you're seeing this error:
```
Branch "main" is not allowed to deploy to github-pages due to environment protection rules.
```

Follow these steps to fix it:

## Solution 1: Add gh-pages Branch (Recommended)

1. Go to your GitHub repository: https://github.com/mudasarahmad42/AzureAuthViewer
2. Click on **Settings** tab
3. Scroll down to **Environments** in the left sidebar (under "Code and automation")
4. Click on **github-pages** environment
5. Under **Deployment branches**:
   - Select **"Selected branches"** radio button
   - In the branch name field, type: `gh-pages`
   - Press Enter or click to add it
6. Click **Save protection rules** at the bottom

## Solution 2: Allow All Branches (Alternative)

1. Go to **Settings** → **Environments** → **github-pages**
2. Under **Deployment branches**:
   - Select **"All branches"** radio button
3. Click **Save protection rules**

## Solution 3: Remove Environment Protection (If Not Needed)

If you don't need environment protection:

1. Go to **Settings** → **Environments** → **github-pages**
2. Scroll down to **Environment protection rules**
3. Uncheck any protection rules you don't need
4. Click **Save protection rules**

## After Fixing

Once you've updated the environment settings:

1. Go to the **Actions** tab
2. Find the failed workflow run
3. Click **Re-run all jobs** or **Re-run failed jobs**
4. The deployment should now succeed

## Quick Links

- Repository Settings: https://github.com/mudasarahmad42/AzureAuthViewer/settings
- Environments: https://github.com/mudasarahmad42/AzureAuthViewer/settings/environments
- Actions: https://github.com/mudasarahmad42/AzureAuthViewer/actions

