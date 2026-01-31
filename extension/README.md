# Card Optimizer Browser Extension

A WXT-based browser extension that recommends the optimal credit card at checkout.

## Features

- Detects checkout pages on supported e-commerce sites
- Shows card recommendation overlay with potential savings
- One-click card switching via Knot API
- Popup for settings and card management

## Supported Sites

- Amazon
- Walmart
- Target
- Best Buy

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build for Firefox
npm run build:firefox

# Create zip for Chrome Web Store
npm run zip
```

## Loading the Extension

### Chrome
1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3` folder

### Firefox
1. Run `npm run build:firefox`
2. Open `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select any file in `.output/firefox-mv2`

## Configuration

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Architecture

See [PLAN.md](./PLAN.md) for detailed architecture documentation.
