# AzureAuthViewer

A lightweight Angular web application for viewing and managing Azure AD access tokens. This application provides a user-friendly interface for authenticating with Azure Active Directory, viewing raw and decoded JWT tokens, and testing token refresh functionality.

## Features

- 🔐 **Azure AD Authentication** - Secure login using Microsoft Authentication Library (MSAL)
- 📋 **Token Display** - View raw JWT tokens with copy-to-clipboard functionality
- 🔍 **Token Decoding** - Automatically decode and display JWT token claims in a readable format
- 🔄 **Token Refresh** - Manually refresh access tokens with detailed Azure endpoint information
- ⚙️ **Runtime Configuration** - Configure Azure AD credentials and API endpoints via UI (no code changes needed)
- 🎨 **Material Design** - Clean, modern UI built with Angular Material
- 📊 **Debug Information** - View detailed Azure endpoint calls and responses during token refresh

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- An Azure AD app registration configured as a **Single-page application (SPA)**

## Installation

1. Clone or navigate to the project directory:
   ```bash
   cd "Angular Web Client"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Step 1: Initial Configuration

On first launch, the application will redirect you to the configuration page where you need to provide:

1. **API Base URL** - The base URL of your backend API (e.g., `https://localhost:7001`)
2. **Tenant ID** - Your Azure AD tenant ID (Directory ID)
3. **Client ID** - Your Azure AD application (client) ID
4. **Redirect URI** - The redirect URI registered in Azure AD (defaults to current origin)

The application will automatically generate API scopes based on your Client ID:
- `api://{clientId}/Relia.Create`
- `api://{clientId}/Relia.Read`
- `api://{clientId}/Relia.Update`
- `api://{clientId}/Relia.Delete`

### Step 2: Azure AD App Registration Setup

**Important**: Your Azure AD app registration must be configured as a **Single-page application (SPA)**, not a Web application.

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Create a new app registration or select an existing one
3. Note down the **Application (client) ID** and **Directory (tenant) ID**
4. Go to **Authentication** section:
   - If you see a **Web** platform configuration, delete it
   - Click **"Add a platform"** → Select **"Single-page application"**
   - **Add ALL of these redirect URIs** (for both local testing and production):
     - `http://localhost:4200` (for local HTTP development)
     - `https://localhost:4200` (for local HTTPS development)
     - `https://mudasarahmad42.github.io/AzureAuthViewer` (for GitHub Pages production)
   - Adding all redirect URIs allows you to test locally and deploy without changing Azure AD settings
   - Click **Configure**
5. Under **API permissions**:
   - Add permission to your backend API
   - Grant admin consent if required

**Common Error**: If you see `AADSTS9002326: Cross-origin token redemption is permitted only for the 'Single-Page Application' client-type`, it means your app registration is configured as a Web app instead of SPA. Follow step 4 above to fix it.

### Step 3: Running with HTTPS (Optional)

If your backend API requires HTTPS, you can run the Angular dev server with HTTPS:

```bash
npm run start:https
```

Or with custom SSL certificates:

```bash
npm run start:https:cert
```

The application is configured to use HTTPS by default (check `angular.json` for SSL settings).

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```
   or
   ```
   https://localhost:4200
   ```
   (depending on your configuration)

3. If this is your first time, you'll be redirected to the configuration page. Enter your Azure AD credentials and API base URL.

4. Click **"Initialize Application"** to save the configuration.

5. After initialization, you'll be redirected to the home page.

6. Click **"Login with Azure AD"** to authenticate.

## Usage

### Configuration Page

- **First Launch**: Automatically redirects to configuration page if no config exists
- **Manual Access**: Navigate to `/config` (only accessible when not configured)
- **Auto-Generated Scopes**: API scopes are automatically generated based on Client ID
- **Validation**: All fields are validated before allowing initialization

### Home Page

After successful authentication, you'll see:

1. **Access Token Section**:
   - Raw JWT token in a scrollable, copy-friendly format
   - Copy button to quickly copy the token to clipboard
   - Token is displayed in a dark theme for better readability

2. **Decoded Token Section**:
   - Automatically decoded JWT claims
   - Formatted JSON with bold keys for easy reading
   - Error message if token cannot be decoded

3. **Refresh Token Debug Section** (appears after clicking "Refresh token"):
   - **Azure Endpoint Called**: Shows which Azure endpoint was called, with:
     - Timestamp
     - Endpoint URL
     - Authority
     - Requested scopes
     - Account username
   - **Azure Response**: Shows Azure's response with:
     - Timestamp
     - Status (Success/Failed)
     - Token type
     - Expiration time
     - Granted scopes
     - Confirmation that access token was updated

4. **Actions**:
   - **Refresh token**: Manually refresh the access token
   - **Logout**: Sign out from Azure AD

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── components/
│   │   │   └── msal-redirect-handler/  # Handles MSAL redirects
│   │   ├── guards/
│   │   │   └── config.guard.ts         # Route guards for configuration
│   │   ├── interceptors/
│   │   │   └── msal.interceptor.ts     # Attaches tokens to API requests
│   │   └── services/
│   │       ├── auth.service.ts         # Manages authentication state
│   │       ├── config.service.ts       # Manages runtime configuration
│   │       └── jwt-decoder.service.ts  # Decodes JWT tokens
│   ├── features/
│   │   ├── config/
│   │   │   └── config.component.*      # Configuration page
│   │   └── home/
│   │       └── home.component.*        # Home page with login/token display
│   ├── shared/
│   │   └── components/
│   │       └── json-viewer/            # Reusable JSON display component
│   ├── app.config.ts                   # App configuration with MSAL setup
│   ├── app.routes.ts                   # Route definitions
│   └── app.ts                          # Root component
└── environments/
    └── environment.ts                  # Environment configuration (minimal usage)
```

## Key Components

### Configuration Service

The `ConfigService` manages runtime configuration stored in `localStorage`:
- Provides reactive signals for configuration state
- Auto-generates API scopes based on client ID
- Validates configuration on load
- Handles configuration persistence

### Authentication Service

The `AuthService` manages the authentication lifecycle:
- Handles login/logout via MSAL
- Acquires and stores access tokens
- Provides token refresh functionality
- Tracks Azure endpoint calls for debugging

### JWT Decoder Service

The `JwtDecoderService` decodes JWT tokens:
- Uses reactive signals for automatic decoding
- Validates JWT format before decoding
- Provides error messages for invalid tokens
- Returns decoded claims as formatted JSON

### MSAL Configuration

The app uses MSAL Angular for authentication:
- `MSALInstanceFactory`: Creates MSAL instance with dynamic configuration
- `MSALInitializerFactory`: Initializes MSAL before app starts (via APP_INITIALIZER)
- `MSALGuardConfigFactory`: Configures route guards
- `MSALInterceptorConfigFactory`: Configures token attachment to API requests

### HTTP Interceptor

The `msalInterceptor` automatically attaches Azure AD access tokens to outgoing HTTP requests that target the configured backend API base URL.

## Troubleshooting

### Authentication Issues

- **"Unable to acquire access token"**: 
  - Check that your Azure AD app registration is configured correctly
  - Verify the app is configured as a **Single-page application (SPA)**, not Web
  - Ensure redirect URIs match exactly (including protocol and trailing slashes)

- **"AADSTS9002326" Error**: 
  - This means your app registration is configured as a Web app instead of SPA
  - Go to Azure Portal → App registrations → Authentication
  - Remove any Web platform configurations
  - Add a Single-page application platform with correct redirect URIs

- **Redirect URI mismatch**: 
  - The app automatically detects the correct redirect URI based on the environment (local vs GitHub Pages)
  - Make sure you've added ALL redirect URIs to Azure AD:
    - `http://localhost:4200` (for local HTTP)
    - `https://localhost:4200` (for local HTTPS)
    - `https://mudasarahmad42.github.io/AzureAuthViewer` (for GitHub Pages)
  - The app will use the appropriate redirect URI based on where it's running
  - Check that the protocol (http/https) matches your dev server configuration when testing locally

- **Invalid scope**: 
  - Verify the generated API scopes match your backend API's app ID
  - Check that API permissions are granted in Azure Portal

### Configuration Issues

- **Configuration not persisting**: 
  - Check browser console for localStorage errors
  - Ensure localStorage is enabled in your browser
  - Try clearing browser cache and reconfiguring

- **Configuration page keeps redirecting**: 
  - Clear localStorage: Open browser DevTools → Application → Local Storage → Clear
  - Restart the application

### Token Issues

- **Token not displaying**: 
  - Check that you're logged in successfully
  - Verify MSAL initialization completed (check browser console)
  - Ensure the token was acquired successfully

- **Token decode errors**: 
  - Verify you have a valid JWT token
  - Check the browser console for detailed error messages
  - Ensure the token format is correct (3 parts separated by dots)

## Building for Production

1. Build the application:
   ```bash
   ng build --configuration production
   ```

2. The built files will be in the `dist/` folder

3. Deploy the `dist/` folder to your hosting provider

4. **Important**: Add all redirect URIs to Azure Portal (both local and production):
   - Add `http://localhost:4200` and `https://localhost:4200` for local testing
   - Add `https://mudasarahmad42.github.io/AzureAuthViewer` for GitHub Pages
   - The app automatically uses the correct redirect URI based on the environment

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [MSAL Angular Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular)
- [Angular Material Documentation](https://material.angular.io)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## Deployment

### Deploy to GitHub Pages

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

Quick deployment:
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings (use GitHub Actions)
3. The workflow will automatically build and deploy on push to `main`/`master`

Your app will be available at: `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/`

## License

This project is provided as-is for token viewing and testing purposes.
