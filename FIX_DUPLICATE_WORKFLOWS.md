# Fix Duplicate GitHub Pages Workflows

If you're seeing two workflows running:
1. **pages-build-deployment** (GitHub's automatic workflow)
2. **Deploy to GitHub Pages** (your custom workflow)

This happens when GitHub Pages is configured to use "Deploy from a branch" instead of "GitHub Actions".

## Solution: Use GitHub Actions Only

Follow these steps to disable the automatic workflow and use only your custom workflow:

### Step 1: Go to Repository Settings

1. Go to your GitHub repository: https://github.com/mudasarahmad42/AzureAuthViewer
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar

### Step 2: Change Pages Source

1. Under **Source**, you'll see options:
   - **Deploy from a branch** (this triggers `pages-build-deployment`)
   - **GitHub Actions** (this uses your custom workflow)

2. Select **"GitHub Actions"** radio button

3. Click **Save** (if there's a save button)

### Step 3: Verify

1. Go to the **Actions** tab
2. You should now only see **"Deploy to GitHub Pages"** workflow running
3. The `pages-build-deployment` workflow should no longer trigger automatically

## Why This Happens

- **"Deploy from a branch"**: GitHub automatically runs `pages-build-deployment` workflow whenever you push to the selected branch (usually `gh-pages` or `main`). This is GitHub's built-in Jekyll-based deployment.

- **"GitHub Actions"**: Uses your custom workflow (`.github/workflows/deploy.yml`) which builds your Angular app properly with the correct base-href and routing setup.

## Quick Links

- Repository Settings: https://github.com/mudasarahmad42/AzureAuthViewer/settings
- Pages Settings: https://github.com/mudasarahmad42/AzureAuthViewer/settings/pages
- Actions: https://github.com/mudasarahmad42/AzureAuthViewer/actions

## After Fixing

Once you've changed the source to "GitHub Actions":
- Only your custom workflow will run
- The `pages-build-deployment` workflow will stop automatically
- Your Angular app will deploy correctly with proper routing support

