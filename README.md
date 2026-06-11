# PUPS Site (Next.js App Router, TypeScript, MongoDB)

A full-stack events management platform for the Physics Society. Built with Next.js App Router, TypeScript, and MongoDB, with Cloudinary for media storage and JWT authentication for admin access.

## Features

- **Event Management**: Create, read, update, delete events (lecture series, workshops, conferences)
- **Colloquium Management**: Manage colloquium entries with speakers and abstracts
- **Team Pages**: Display team members with roles and details
- **Admin API**: Protected endpoints for managing events, colloquia, and team data
- **File Uploads**: Direct-to-Cloudinary uploads with signed signatures
- **TypeScript**: Full type safety across frontend and backend

## Routes

### Public Pages
- `/` — Landing page
- `/about` — About page
- `/events` — Events listing
- `/events/[id]` — Event detail page
- `/colloquium` — Colloquium listing
- `/colloquium/[id]` — Colloquium detail page
- `/team` — Team listing
- `/team/[id]` — Team member detail page

### Admin API Routes (Protected with JWT)
- `POST /api/auth/login` — Admin login
- `POST /api/cloudinary/sign` — Get signed upload signature
- `GET/POST/PUT/DELETE /api/events` — Event CRUD
- `GET/POST/PUT/DELETE /api/colloquia` — Colloquium CRUD
- `GET/POST/PUT/DELETE /api/team` — Team CRUD
- `POST /api/admin/migrate` — One-time data migration (LectureSeries/Workshop → Event)

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

# Admin credentials
ADMIN_EMAIL=admin@pups.com
ADMIN_PASSWORD_HASH=$2b$10$... # bcrypt hash of your password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Important**: Get your MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). The `ADMIN_PASSWORD_HASH` should be a bcrypt hash—generate one using an online tool or the Node.js `bcryptjs` library.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Scripts

```bash
npm run dev      # Start dev server (with hot reload)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run linters
npm run format   # Format code with Prettier
npm run test     # Run tests (if configured)
```

## Project Structure

```
pups-app/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes (backend)
│   │   ├── auth/
│   │   ├── cloudinary/
│   │   ├── events/
│   │   ├── colloquia/
│   │   ├── team/
│   │   └── admin/migrate/
│   ├── page.tsx                # Landing page
│   ├── about/                  # About page
│   ├── events/                 # Events pages
│   ├── colloquium/             # Colloquium pages
│   ├── team/                   # Team pages
│   └── layout.tsx              # Root layout
├── components/                 # Reusable UI components
│   ├── ui/                     # Basic UI components
│   └── ...
├── lib/                        # Shared utilities
│   ├── api.ts                  # API client helpers
│   ├── auth.ts                 # JWT verification
│   ├── db.ts                   # MongoDB connection (cached)
│   ├── cloudinary.ts           # Cloudinary config
│   └── models/                 # Mongoose schemas
│       ├── Event.ts
│       ├── Colloquium.ts
│       ├── LectureSeries.ts
│       ├── Workshop.ts
│       └── TeamMember.ts
├── types/                      # TypeScript type definitions
│   └── index.ts
├── styles/                     # Global styles
├── public/                     # Static assets
│   └── placeholders/           # Placeholder images
├── .env.local                  # Environment variables (not in git)
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript config
└── package.json
```

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Storage**: Cloudinary
- **Runtime**: Node.js (Vercel Functions)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Any random 32+ char string |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d`, `24h` |
| `ADMIN_EMAIL` | Admin account email | `admin@pups.com` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password | `$2b$10$...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |

## File Upload Flow

1. **Admin requests upload signature**: `POST /api/cloudinary/sign` with JWT token
2. **Server responds with signed parameters**: Valid for 60 seconds
3. **Frontend uploads directly to Cloudinary**: Bypasses Vercel's 4.5 MB limit
4. **Cloudinary returns secure URL**: Frontend includes URL in create/update request
5. **API saves URL to MongoDB**: Event/Colloquium/Team document stores Cloudinary URL

This approach avoids Vercel's request body size limit.

## Admin Authentication Example

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pups.com","password":"your_password"}'

# Response:
# {"success":true,"token":"eyJhbGc..."}

# 2. Use token for protected endpoints
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer eyJhbGc..."
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add environment variables in Project Settings → Environment Variables
4. Deploy

```bash
npm run build
npm run start
```

### Other Platforms

Works on any Node.js 18+ host (AWS Lambda, Railway, Render, etc.).

## Database Schema

### Event
```typescript
{
  type: 'lecture_series' | 'workshop' | 'conference',
  title: string,
  description?: string,
  mode: 'online' | 'offline',
  thumbnail?: string,  // Cloudinary URL
  lecturer_details: { name, affiliation?, image? }[],
  date_time: { start?, end?, schedule? },
  reg_form_link?: string,
  to_contact: { name?, email?, phone?, role? }[],
  suppliments: { url, name?, type?, source? }[],
  // ... more fields
}
```

See `/lib/models/Event.ts` for full schema.

## Important Notes

- **Mongoose Caching**: MongoDB connections are cached in `lib/db.ts` to avoid exhausting the connection pool on serverless.
- **Type-Safe Imports**: Use `import type { Event }` for TypeScript types to avoid runtime issues.
- **Spelling**: Field name `suppliments` is intentionally misspelled to match legacy database—don't change without migration.
- **Next.js 15+**: Dynamic route `params` are Promises; always `await params` before accessing.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

[Add your license here]

## Support

For issues or questions, open a GitHub issue or contact the PUPS team.
