# PUPS Site (Next.js App Router, TypeScript)

A scaffolded frontend for the PUPS Site based on the provided flowchart.  
Built with Next.js App Router and TypeScript, this project provides simple, local-data-driven pages for events, colloquium entries, and the team.

## Routes
- /                        (Landing page)
- /about                   (About page)
- /events                  (Events listing)
- /events/panel-discussion (Panel discussions listing)
- /events/[id]             (Event detail)
- /colloquium              (Colloquium listing)
- /colloquium/[id]         (Colloquium detail)
- /team                    (Team listing)
- /team/[id]               (Team member detail)

## Quick start

1. Clone the repo
```bash
git clone https://github.com/AritraBakshi/pups_front.git
cd pups_front
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open http://localhost:3000

Default dev port: 3000 (Next.js will print the actual port if different).

## Notes / Project details

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Simple CSS (styles/globals.css)
- Data source: Local JSON files in /data
  - data/events.json
  - data/colloquium.json
  - data/team.json
- Placeholder images: put placeholder images into /public/placeholders/
  - See public/placeholders/readme.txt for filenames and guidance.

## Development scripts (typical)
Adjust to match package.json if different.

- npm run dev — start dev server
- npm run build — create production build
- npm run start — start production server (after build)
- npm run lint — run linters
- npm run format — format code
- npm run test — run tests

Example:
```bash
npm run dev
npm run build
npm run start
```

## Recommended environment
- Node.js 18+ (or the version configured in your project)
- npm 8+ or Yarn

## Project structure (high level)
- /app                — Next.js App Router pages and layout
- /components         — Reusable UI components
- /data               — Local JSON data (events.json, colloquium.json, team.json)
- /public/placeholders — Placeholder images used by the scaffold
- /styles             — globals.css and other styles
- next.config.js
- package.json
- tsconfig.json

## Adding or updating data
Edit the JSON files in /data. The app reads from these local files; no backend is required for the scaffold.

## Images / placeholders
Place image files in /public/placeholders/ and reference them in the JSON records by filename/path. See public/placeholders/readme.txt for required placeholder names.

## Tests
If you add tests, include instructions here for running unit/e2e tests and any test setup.

## Deployment
Build the app and deploy to Vercel, Netlify, or any Node-capable host.

Build:
```bash
npm run build
npm run start
```

## Contributing
Contributions welcome. Typical workflow:
1. Fork the repo
2. Create a branch: git checkout -b feature/your-feature
3. Commit changes: git commit -m "Add feature"
4. Push and open a PR

Add any repo-specific contribution guidelines or PR templates here.
