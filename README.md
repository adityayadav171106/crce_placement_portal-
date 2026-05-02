# CRCE Placement Cell

React + Express + MongoDB version of the CRCE Placement Cell site.

## Run Locally

Install dependencies once:

```bash
npm install
```

Create an environment file:

```bash
copy .env.example .env
```

`.env.example` is the committed template. `.env` is your local file and is ignored by git.

Update `MONGO_URI` in `.env` if your MongoDB server is not running locally.

For development, run the API and Vite in two terminals:

```bash
npm run dev:api
```

```bash
npm run dev
```

Vite proxies `/api` requests to `http://localhost:3000`.

For the production MERN server:

```bash
npm run build
npm start
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/login`
- `http://localhost:3000/student-portal`
- `http://localhost:3000/faculty-portal`
- `http://localhost:3000/recruiter-portal`

## Backend Features

- Mongo-backed role login with password hashing
- Student profiles, photos, and resume snapshots
- Faculty resume approvals
- Student internship and placement applications
- Faculty-posted internships and placements
- Recruiter opportunity posting with faculty approval for academic-window conflicts
- Recruiter applicant and listing-status views

## Visual Check

```bash
npm run visual-check
```

This launches Playwright, captures desktop/mobile screenshots, and checks the ClickSpark and MagicRings canvases for rendered pixels.
