# PUPS Site (Next.js App Router, TypeScript, MongoDB)

A full-stack site and admin CMS for the Presidency University Physics Society. Built with Next.js App Router, TypeScript, and MongoDB, with Cloudinary for media storage and JWT authentication for admin access.

## Features

- **Event Management** — unified CRUD for lecture series, workshops, and conferences (single `Event` collection, distinguished by `type`)
- **Colloquium Management** — manage colloquium entries with speakers and abstracts
- **Team Management** — full CRUD for team members, with Cloudinary photo upload/cleanup, drag-to-reorder (with an up/down-arrow fallback for touch devices), and active/inactive visibility control
- **Page Content (CMS)** — Home, About, and Contact page copy is editable from the admin panel instead of hardcoded, with a "reset to default" option per page
- **Admin Panel** — single-page app at `/admin` with tabs for Overview, Events, Colloquia, Team, and Pages; search + pagination on list views
- **File Uploads** — direct-to-Cloudinary uploads with signed signatures, and automatic cleanup of the old asset when a photo/thumbnail is replaced or its record is deleted
- **JWT Authentication** — protects all write endpoints; public read endpoints additionally filter out unpublished/inactive records for unauthenticated requests
- **TypeScript** — full type safety across frontend and backend

## Routes

### Public Pages
- `/` — Landing page (server-rendered; content editable via admin → Pages)
- `/about` — About page (server-rendered; content editable via admin → Pages)
- `/contact` — Contact page (server-rendered; content editable via admin → Pages)
- `/events` — Events listing (lecture series, workshops, conferences)
- `/events/[id]` — Event detail page
- `/lecture-series` — Lecture series listing (reads from the unified `Event` collection, filtered by type)
- `/lecture-series/[id]` — Lecture series detail page
- `/colloquium` — Colloquium listing
- `/colloquium/[id]` — Colloquium detail page
- `/team` — Team listing (active members only)

### Admin
- `/admin` — Admin dashboard (client-side auth guard; redirects to `/login` if not authenticated). Supports `?tab=events|colloquia|team|pages` deep links.
- `/login` — Admin login

### API Routes
Unless noted, write operations (`POST`/`PUT`/`DELETE`) require `Authorization: Bearer <JWT>`.

| Route | Notes |
|---|---|
| `POST /api/auth/login` | Returns a JWT on valid credentials |
| `POST /api/cloudinary/sign` | Signed upload signature (auth required) |
| `GET/POST /api/events`, `GET/PUT/DELETE /api/events/[id]` | Unified Event CRUD (`type`: `lecture_series` \| `workshop` \| `conference`). `GET` supports `?type=` filtering |
| `POST/DELETE /api/events/[id]/suppliments` | Manage event supplement links |
| `GET/POST /api/colloquia`, `GET/PUT/DELETE /api/colloquia/[id]` | Colloquium CRUD |
| `GET/POST /api/team`, `GET/PUT/DELETE /api/team/[id]` | Team CRUD. `GET` hides inactive members from unauthenticated requests regardless of query params; PUT/DELETE clean up the old Cloudinary photo automatically |
| `POST /api/team/reorder` | Bulk-updates the `order` field from an ordered array of ids (auth required) |
| `GET/PUT/DELETE /api/site-content/[page]` | `page` is `home`, `about`, or `contact`. `GET` is public and merges stored content over hardcoded defaults; `PUT` upserts; `DELETE` resets to default (auth required for PUT/DELETE) |
| `POST /api/admin/migrate` | One-time backfill: legacy `LectureSeries`/`Workshop` collections → unified `Event` collection. Idempotent (skips existing records by title+type) |
| `POST /api/admin/migrate-team` | One-time backfill: `data/team.json` → `TeamMember` collection. Idempotent (skips existing records by name+role) |

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/PuPhysicsSociety/pups-app.git
cd pups-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pups_db

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
JWT_EXPIRES_IN=7d

# Admin login (single shared admin account — see "Known limitations" below)
ADMIN_EMAIL=admin@pups.com
ADMIN_PASSWORD=choose_a_strong_password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> Get your MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). If your local network can't resolve `mongodb+srv://` DNS SRV records (some corporate/campus networks and VPNs block this), use the standard `mongodb://host1,host2,host3/...` connection string from Atlas's "Drivers" connection dialog instead — it works identically but skips the SRV lookup.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. First-time setup:
1. Log in at `/login` with `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
2. In the admin **Overview** tab, run **"Run Migration"** (Event backfill) and **"Run Team Migration"** if you're seeding from an existing database — safe to run multiple times.
3. Visit admin → **Pages** if you want to customize Home/About/Contact copy; otherwise the built-in defaults render as-is.

## Development Scripts

```bash
npm run dev      # Start dev server (with hot reload), port 3000
npm run build    # Create production build
npm run start    # Start production server, port 3000
npm run lint     # Run next lint
```

## Project Structure

```
pups-app/
├── app/
│   ├── api/
│   │   ├── auth/login/
│   │   ├── cloudinary/sign/
│   │   ├── events/                 # unified Event CRUD (+ [id]/suppliments)
│   │   ├── colloquia/
│   │   ├── team/                   # CRUD + reorder/
│   │   ├── site-content/[page]/    # Home/About/Contact CMS
│   │   ├── lecture-series/         # legacy — no longer used, see note below
│   │   ├── workshops/              # legacy — no longer used, see note below
│   │   └── admin/
│   │       ├── migrate/            # LectureSeries/Workshop → Event backfill
│   │       └── migrate-team/       # team.json → TeamMember backfill
│   ├── admin/
│   │   ├── page.tsx                # Overview / Colloquia / Team tab switcher
│   │   ├── EventsPanel.tsx
│   │   ├── PagesPanel.tsx          # Home/About/Contact editor
│   │   ├── AdminListControls.tsx   # shared search + pagination hook/components
│   │   └── layout.tsx              # client-side auth guard
│   ├── (main)/
│   │   ├── page.tsx, HomeClient.tsx    # server-fetched content + client-fetched latest event/colloquium
│   │   ├── about/, contact/            # server-rendered, content from site-content
│   │   ├── events/, colloquium/, team/
│   │   └── lecture-series/             # reads unified Event collection, filtered by type
│   └── layout.tsx
├── components/
│   └── ui/
│       └── emphasis.tsx            # **word** → <em>, paragraph splitting for CMS copy
├── lib/
│   ├── api.ts                      # client-side API helpers
│   ├── auth.ts                     # verifyAuth (hard 401) + isAuthenticated (soft check)
│   ├── db.ts                       # cached MongoDB connection
│   ├── cloudinary.ts               # config + upload cleanup helpers
│   ├── defaultSiteContent.ts       # fallback copy for Home/About/Contact
│   ├── server/siteContent.ts       # server-component-only content fetch (no HTTP round trip)
│   └── models/
│       ├── Event.ts
│       ├── Colloquium.ts
│       ├── TeamMember.ts
│       ├── SiteContent.ts
│       ├── LectureSeries.ts        # legacy — kept only for admin/migrate, see note below
│       └── Workshop.ts             # legacy — kept only for admin/migrate, see note below
├── types/index.ts
├── data/team.json                  # legacy seed data for /api/admin/migrate-team
├── public/
├── next.config.js
├── tsconfig.json
└── package.json
```

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS + hand-written CSS (see `app/globals.css`) — most of the site's visual language is custom classes, not Tailwind utilities
- **Authentication**: JWT (`jsonwebtoken`)
- **File Storage**: Cloudinary
- **Runtime**: Node.js

## Environment Variables Reference

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | JWT token expiration (e.g. `7d`) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password, compared in plaintext — see "Known limitations" |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

## File Upload Flow

1. Admin panel requests a signature: `POST /api/cloudinary/sign` (JWT required)
2. Server responds with a short-lived signed payload
3. Browser uploads the file directly to Cloudinary (bypasses any server body-size limit)
4. Cloudinary returns a secure URL, which the admin panel includes in the create/update request
5. The relevant API route saves the URL to MongoDB — and if a photo/thumbnail is being replaced or the record deleted, deletes the old Cloudinary asset so it doesn't sit around unused

## Page Content (CMS)

Home, About, and Contact page copy lives in a `SiteContent` document per page (`{ page, data }`, `data` shape varies per page — see `lib/defaultSiteContent.ts`). `GET /api/site-content/[page]` merges the stored document over the hardcoded default, so a field added to the default shape later won't just disappear from a page nobody's re-saved yet.

Editable text fields support one lightweight convention: wrap a word in `**double asterisks**` to italicise it (matching the site's heading style), and a blank line to start a new paragraph in body-text fields. There's no rich text editor beyond that — links, addresses, emails, and social URLs are separate structured fields instead, so they stay functional (clickable) rather than being pasted into free text.

These three pages are rendered server-side and marked `export const dynamic = 'force-dynamic'` so admin edits show up immediately on the next request, rather than requiring a redeploy (Next.js would otherwise statically bake a fixed-path page like `/about` at build time).

## Admin Authentication Example

```bash
# 1. Log in to get a JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pups.com","password":"your_password"}'

# Response: {"success":true,"token":"eyJhbGc..."}

# 2. Use the token for protected endpoints
curl -X GET http://localhost:3000/api/team \
  -H "Authorization: Bearer eyJhbGc..."
```

## Deployment

### Vercel (recommended)
1. Push code to GitHub
2. Import the repository in the [Vercel Dashboard](https://vercel.com/dashboard)
3. Add the environment variables above in Project Settings → Environment Variables
4. Deploy

### Other platforms
Works on any Node.js 18+ host (Railway, Render, a plain VPS, etc.) — `npm run build && npm run start`.

## Legacy `LectureSeries` / `Workshop` collections

Early versions of this app stored lecture series and workshops in separate `LectureSeries`/`Workshop` collections. They were later unified into a single `Event` collection (`type` field distinguishes them), and the admin panel now only ever writes to `Event`.

The old `lib/models/LectureSeries.ts` / `Workshop.ts` models and the `/api/admin/migrate` backfill endpoint are kept intentionally — if your database still has data in those old collections that was never migrated, run `POST /api/admin/migrate` (from the admin → Overview tab) to copy it into `Event`. It's idempotent, so it's safe to run more than once. The old `/api/lecture-series/*` and `/api/workshops/*` **HTTP routes** have been removed since nothing in the app calls them anymore — only the underlying Mongoose models remain, solely for that migration script.

## Known limitations / things worth hardening further

- **Admin login is a single shared account**, and the password is compared in plaintext against `ADMIN_PASSWORD` (no hashing, no rate limiting). Fine for a small trusted team, but don't reuse this password elsewhere, and consider adding `bcryptjs` hashing + login rate limiting if this ever needs to be more robust.
- **`/admin/*` route protection is client-side only** (a redirect-if-not-logged-in check). All actual data mutations are protected server-side via JWT, but there's no `middleware.ts` blocking the page shell itself from loading before the redirect fires.
- Drag-to-reorder in the Team admin panel uses native HTML5 drag-and-drop, which doesn't work on touch screens — an up/down arrow fallback is provided for that reason.
- Free-text CMS fields (About's two body columns, Contact's intro paragraph) don't support inline links — use the dedicated structured fields (email, department link, socials) for anything that needs to be clickable.

## Important Notes

- **Mongoose connection caching**: `lib/db.ts` caches the connection to avoid exhausting the pool in serverless environments.
- **`suppliments` spelling**: This field name is intentionally misspelled to match the existing database schema — don't "fix" it without a migration.
- **Dynamic route params are Promises**: this codebase targets a Next.js version where `params` in route handlers and pages must be `await`ed before use.
- **DNS SRV errors locally** (`querySrv ENOTFOUND _mongodb._tcp...`): usually a local network/VPN blocking SRV record lookups, not a code bug — see the `.env.local` note above for a workaround.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to your branch and open a Pull Request

## License

[Add your license here]

## Support

For issues or questions, open a GitHub issue or contact the PUPS team.