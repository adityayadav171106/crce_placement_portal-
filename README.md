# CRCE Placement Cell

React + Node.js version of the CRCE Placement Cell site.

## Run Locally

Install dependencies once:

```bash
npm install
```

For development:

```bash
npm run dev
```

For the Node production server:

```bash
npm run build
npm start
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/login`
- `http://localhost:3000/student-portal`

## Visual Check

```bash
npm run visual-check
```

This launches Playwright, captures desktop/mobile screenshots, and checks the ClickSpark and MagicRings canvases for rendered pixels.
