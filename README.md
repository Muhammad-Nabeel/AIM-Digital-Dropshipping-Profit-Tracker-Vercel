# AIM Digital UK — Dropshipping Profit Tracker

A private, browser-based product research dashboard for comparing eBay US/AU products, landed costs, fees, margins, demand, competition, IP risk, trends, and Q4 sourcing ideas.

## Features

- Product profit and margin calculator
- eBay US and Australia filtering
- Excel/CSV import and CSV export
- Product shortlist and promising-product rules
- eBay trend research workspace
- Q4 AliExpress sourcing shortlist
- Browser-local storage (data stays on the visitor's device)
- Responsive desktop and mobile layout

## Run locally

Install Node.js 18 or newer, then run:

```bash
npm run build
npx serve dist
```

Open the local address shown in the terminal.

## Deploy to Vercel from GitHub

1. Create a new GitHub repository.
2. Upload all files from this project or push them with Git.
3. In Vercel, select **Add New → Project**.
4. Import the GitHub repository.
5. Vercel should use the included configuration automatically:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Select **Deploy**.

No environment variables or database are required.

## Important storage note

Products are stored in the browser using `localStorage`. They do not automatically synchronize across devices or browsers. Export a CSV backup before clearing browser data.

## Project structure

- `index.html` — dashboard markup
- `styles.css` — visual design and responsive layout
- `app.js` — dashboard interactions and product data
- `calc.js` — fee, profit, margin and import calculations
- `vendor/` — local spreadsheet import library
- `tests/` — calculation tests
- `scripts/build.mjs` — static production build
- `vercel.json` — Vercel build configuration

