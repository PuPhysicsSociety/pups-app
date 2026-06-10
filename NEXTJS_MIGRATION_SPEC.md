# Next.js API Routes Migration Spec
## Physics Society Backend → Next.js App Router

**Date:** 2026-06-10  
**Source:** Express.js backend at `/backend`  
**Target:** Next.js project (App Router, `src/app/api/` directory)

---

## Overview

This spec migrates all Express routes to Next.js App Router route handlers. The external API contract (URLs, request/response shapes, auth) is **preserved exactly** with one deliberate change: **file uploads are moved to direct client → Cloudinary uploads** (explained below). All other fetch calls require no changes.

### Why file uploads must change

Vercel Functions have a **hard 4.5 MB request body limit** ([source](https://vercel.com/docs/functions/limitations#request-body-size)). The Express backend accepts 20 MB thumbnails, 20 MB supplement files, and 5 MB posters — all exceed this limit and would return `413 FUNCTION_PAYLOAD_TOO_LARGE`.

**New upload flow:**
1. Admin form calls `POST /api/cloudinary/sign` → receives a signed upload signature (valid 60 s)
2. Frontend POSTs the file directly to `https://api.cloudinary.com/v1_1/{cloud}/upload`
3. Cloudinary returns `{ secure_url, public_id, ... }`
4. Frontend includes the `secure_url` as a JSON string in the normal create/update body

The create/update endpoints now accept **JSON** instead of `multipart/form-data` for Lecture Series and Colloquia. `thumbnail` and `poster` are plain string fields containing a Cloudinary URL.

---

## Route Mapping

| Express Route | Next.js File | Change |
|---|---|---|
| `POST /api/auth/login` | `src/app/api/auth/login/route.ts` | none |
| _(new)_ `POST /api/cloudinary/sign` | `src/app/api/cloudinary/sign/route.ts` | new — generates upload signature |
| `GET /api/colloquia` | `src/app/api/colloquia/route.ts` | none |
| `POST /api/colloquia` | `src/app/api/colloquia/route.ts` | body is now JSON, not multipart |
| `GET /api/colloquia/:id` | `src/app/api/colloquia/[id]/route.ts` | none |
| `PUT /api/colloquia/:id` | `src/app/api/colloquia/[id]/route.ts` | body is now JSON, not multipart |
| `DELETE /api/colloquia/:id` | `src/app/api/colloquia/[id]/route.ts` | none |
| `GET /api/lecture-series` | `src/app/api/lecture-series/route.ts` | none |
| `POST /api/lecture-series` | `src/app/api/lecture-series/route.ts` | body is now JSON, not multipart |
| `GET /api/lecture-series/:id` | `src/app/api/lecture-series/[id]/route.ts` | none |
| `PUT /api/lecture-series/:id` | `src/app/api/lecture-series/[id]/route.ts` | body is now JSON, not multipart |
| `DELETE /api/lecture-series/:id` | `src/app/api/lecture-series/[id]/route.ts` | none |
| `POST /api/lecture-series/:id/suppliments` | `src/app/api/lecture-series/[id]/suppliments/route.ts` | none |
| `DELETE /api/lecture-series/:id/suppliments` | `src/app/api/lecture-series/[id]/suppliments/route.ts` | none |
| `GET /api/workshops` | `src/app/api/workshops/route.ts` | none |
| `POST /api/workshops` | `src/app/api/workshops/route.ts` | none |
| `GET /api/workshops/:id` | `src/app/api/workshops/[id]/route.ts` | none |
| `PUT /api/workshops/:id` | `src/app/api/workshops/[id]/route.ts` | none |
| `DELETE /api/workshops/:id` | `src/app/api/workshops/[id]/route.ts` | none |

---

## File Structure to Create

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   └── login/
│       │       └── route.ts
│       ├── cloudinary/
│       │   └── sign/
│       │       └── route.ts
│       ├── colloquia/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── lecture-series/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── suppliments/
│       │           └── route.ts
│       └── workshops/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
└── lib/
    ├── db.ts
    ├── cloudinary.ts
    ├── auth.ts
    └── models/
        ├── Colloquium.ts
        ├── LectureSeries.ts
        └── Workshop.ts
```

---

## Step 1 — Install Dependencies

```bash
npm install mongoose bcryptjs jsonwebtoken cloudinary
npm install -D @types/bcryptjs @types/jsonwebtoken
```

Do NOT install `express`, `cors`, `morgan`, `multer`, `multer-storage-cloudinary`, or `lodash-es`.

---

## Step 2 — Environment Variables

Add to `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@pups.com
ADMIN_PASSWORD_HASH=$2b$10$...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Important:** The original Express backend had `MONGODB_URI_MONGODB_URI` (a typo). Use the correct name `MONGODB_URI` here.

---

## Step 3 — Shared Library Files

### `src/lib/db.ts`

Mongoose requires a cached singleton in Next.js. Without it, each serverless invocation opens a new connection and exhausts the MongoDB connection pool.

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
```

---

### `src/lib/cloudinary.ts`

Only used server-side for generating signed upload parameters. The actual file upload goes directly from the browser to Cloudinary.

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;
```

---

### `src/lib/auth.ts`

Replaces the Express `requireAuth` middleware. Call at the top of any protected handler and return early if the result is a `NextResponse`.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminPayload {
  email: string;
}

export function verifyAuth(
  req: NextRequest
): { admin: AdminPayload } | NextResponse {
  const header = req.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }

  const token = header.split(' ')[1];

  try {
    const admin = jwt.verify(token, process.env.JWT_SECRET!) as AdminPayload;
    return { admin };
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
```

---

## Step 4 — Mongoose Models

> **Critical rule for every model file:** always use the `mongoose.models.X ?? mongoose.model(...)` guard. Next.js hot reload re-executes module code, and calling `mongoose.model()` twice crashes with `OverwriteModelError`.

### `src/lib/models/Colloquium.ts`

```typescript
import mongoose from 'mongoose';

const colloquiumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    speaker: {
      name: { type: String, required: true },
      affiliation: String,
    },
    abstract: String,
    time: Date,
    venue: String,
    ytLink: String,
    poster: String,
    reg_form_link: String,
  },
  { timestamps: true }
);

export default mongoose.models.Colloquium ??
  mongoose.model('Colloquium', colloquiumSchema);
```

---

### `src/lib/models/LectureSeries.ts`

```typescript
import mongoose from 'mongoose';

const lecturerDetailSchema = new mongoose.Schema(
  { name: { type: String, required: true }, affiliation: String },
  { _id: false }
);

const dateTimeSchema = new mongoose.Schema(
  { start: Date, end: Date, schedule: String },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  { name: String, email: String, phone: String, role: String },
  { _id: false }
);

const lectureSeriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lecturer_details: [lecturerDetailSchema],
    date_time: dateTimeSchema,
    mode: { type: String, enum: ['online', 'offline'], required: true },
    no_of_classes: { type: Number, min: 1 },
    thumbnail: String,
    reg_form_link: String,
    to_contact: [contactSchema],
    suppliments: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

export default mongoose.models.LectureSeries ??
  mongoose.model('LectureSeries', lectureSeriesSchema);
```

---

### `src/lib/models/Workshop.ts`

```typescript
import mongoose from 'mongoose';

const lecturerDetailSchema = new mongoose.Schema(
  { name: { type: String, required: true }, affiliation: String, image: String },
  { _id: false }
);

const dateTimeSchema = new mongoose.Schema(
  { start: Date, end: Date, schedule: String },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  { name: String, email: String, phone: String, role: String },
  { _id: false }
);

const subeventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date_time: dateTimeSchema,
    speaker: String,
  },
  { _id: false }
);

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lecturer_details: [lecturerDetailSchema],
    date_time: dateTimeSchema,
    mode: { type: String, enum: ['online', 'offline'], required: true },
    reg_form_link: String,
    to_contact: [contactSchema],
    suppliments: [mongoose.Schema.Types.Mixed],
    past_images_preview: [String],
    drive_link: String,
    subevent: [subeventSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Workshop ??
  mongoose.model('Workshop', workshopSchema);
```

---

## Step 5 — API Route Handlers

> **Next.js 15 note:** `params` in dynamic route handlers is now a **Promise**. You must `await params` before accessing its properties. Every `[id]` route below uses this pattern.

---

### `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    });

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
```

---

### `src/app/api/cloudinary/sign/route.ts`

Generates a signed upload signature so the browser can POST files directly to Cloudinary. Requires auth so only the admin can trigger uploads.

**Request** (`application/json`, protected):
```json
{ "folder": "physics-society/lecture-series/thumbnails", "resource_type": "image" }
```

**Response:**
```json
{
  "success": true,
  "signature": "...",
  "timestamp": 1234567890,
  "cloudName": "your_cloud_name",
  "apiKey": "your_api_key",
  "folder": "physics-society/lecture-series/thumbnails"
}
```

The frontend then POSTs to `https://api.cloudinary.com/v1_1/{cloudName}/upload` with these fields plus the file.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { folder, resource_type = 'image' } = await req.json();

    if (!folder) {
      return NextResponse.json(
        { success: false, message: 'folder is required' },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resource_type,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
```

**How the frontend uses this (example):**
```typescript
// 1. Get signature from your API
const { signature, timestamp, cloudName, apiKey, folder } = await fetch('/api/cloudinary/sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ folder: 'physics-society/lecture-series/thumbnails', resource_type: 'image' }),
}).then(r => r.json());

// 2. Upload directly to Cloudinary — bypasses Vercel entirely
const form = new FormData();
form.append('file', fileInput);
form.append('api_key', apiKey);
form.append('timestamp', String(timestamp));
form.append('signature', signature);
form.append('folder', folder);

const { secure_url } = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  { method: 'POST', body: form }
).then(r => r.json());

// 3. Include the URL as a string in your create/update call
await fetch('/api/lecture-series', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ title: '...', mode: 'online', thumbnail: secure_url }),
});
```

---

### `src/app/api/colloquia/route.ts`

POST now accepts **JSON** — `poster` is a Cloudinary URL string.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Colloquium from '@/lib/models/Colloquium';
import { verifyAuth } from '@/lib/auth';

// GET /api/colloquia — public
export async function GET() {
  try {
    await connectDB();
    const items = await Colloquium.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/colloquia — protected, application/json
// Body: { title, speaker: { name, affiliation? }, abstract?, time?, venue?,
//         ytLink?, poster?: "https://res.cloudinary.com/...", reg_form_link? }
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const body = await req.json();
    const item = await Colloquium.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
```

---

### `src/app/api/colloquia/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Colloquium from '@/lib/models/Colloquium';
import { verifyAuth } from '@/lib/auth';

type Context = { params: Promise<{ id: string }> };

// GET /api/colloquia/:id — public
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await connectDB();
    const item = await Colloquium.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT /api/colloquia/:id — protected, application/json
// Send only the fields that need updating. All fields optional.
export async function PUT(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const item = await Colloquium.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// DELETE /api/colloquia/:id — protected
export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const item = await Colloquium.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
```

---

### `src/app/api/lecture-series/route.ts`

POST now accepts **JSON** — `thumbnail` and `suppliments` are strings/objects with Cloudinary URLs.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import { verifyAuth } from '@/lib/auth';

// GET /api/lecture-series — public
export async function GET() {
  try {
    await connectDB();
    const items = await LectureSeries.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/lecture-series — protected, application/json
// Body: { title, mode, description?, thumbnail?: "https://...",
//         lecturer_details?, date_time?, no_of_classes?,
//         reg_form_link?, to_contact?, suppliments? }
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const body = await req.json();
    const item = await LectureSeries.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
```

---

### `src/app/api/lecture-series/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import { verifyAuth } from '@/lib/auth';

type Context = { params: Promise<{ id: string }> };

// GET /api/lecture-series/:id — public
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await connectDB();
    const item = await LectureSeries.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT /api/lecture-series/:id — protected, application/json
// Send only the fields that need updating. All fields optional.
export async function PUT(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const item = await LectureSeries.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// DELETE /api/lecture-series/:id — protected
export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const item = await LectureSeries.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
```

---

### `src/app/api/lecture-series/[id]/suppliments/route.ts`

Unchanged from Express — both methods accept JSON bodies.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import { verifyAuth } from '@/lib/auth';

type Context = { params: Promise<{ id: string }> };

const VALID_SOURCES = ['cloudinary', 'drive', 'external'] as const;

// POST /api/lecture-series/:id/suppliments — protected
// Body: { url: string, name?: string, type?: string, source?: "cloudinary"|"drive"|"external" }
export async function POST(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const { url, name, type, source } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required' }, { status: 400 });
    }
    if (source && !VALID_SOURCES.includes(source)) {
      return NextResponse.json(
        { success: false, message: 'source must be cloudinary, drive, or external' },
        { status: 400 }
      );
    }

    const item = await LectureSeries.findByIdAndUpdate(
      id,
      { $push: { suppliments: { url, name, type, source } } },
      { new: true }
    );
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE /api/lecture-series/:id/suppliments — protected
// Body: { url: string }
export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required' }, { status: 400 });
    }

    const item = await LectureSeries.findByIdAndUpdate(
      id,
      { $pull: { suppliments: { url } } },
      { new: true }
    );
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
```

---

### `src/app/api/workshops/route.ts`

Workshops have no file uploads in the Express backend — no changes.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workshop from '@/lib/models/Workshop';
import { verifyAuth } from '@/lib/auth';

// GET /api/workshops — public
export async function GET() {
  try {
    await connectDB();
    const items = await Workshop.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/workshops — protected, application/json
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const body = await req.json();
    const item = await Workshop.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
```

---

### `src/app/api/workshops/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workshop from '@/lib/models/Workshop';
import { verifyAuth } from '@/lib/auth';

type Context = { params: Promise<{ id: string }> };

// GET /api/workshops/:id — public
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await connectDB();
    const item = await Workshop.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT /api/workshops/:id — protected, application/json
export async function PUT(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const item = await Workshop.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// DELETE /api/workshops/:id — protected
export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const item = await Workshop.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
```

---

## Step 6 — next.config.js / next.config.ts

No special config is needed for the routes themselves. If the admin panel is on a different origin, add CORS headers:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL ?? '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

If you ever see `"mongoose is not supported in Edge Runtime"`, add to the affected route file:

```typescript
export const runtime = 'nodejs';
```

This is not normally needed — App Router defaults to Node.js runtime for route handlers.

---

## Step 7 — TypeScript Path Alias

Ensure `tsconfig.json` has the `@/` alias (Next.js adds this automatically):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## Critical Gotchas Summary

### 1. Vercel 4.5 MB body limit
**Never** send files through a Next.js API route on Vercel. Always use the `/api/cloudinary/sign` → direct Cloudinary upload pattern. The API routes only receive Cloudinary URLs as plain strings.

### 2. Next.js 15 — `params` is a Promise
In Next.js 15 App Router, dynamic route params are async. Every `[id]` route handler must use:
```typescript
type Context = { params: Promise<{ id: string }> };
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  ...
}
```
Using the old `{ params }: { params: { id: string } }` pattern will give TypeScript errors and may break at runtime.

### 3. Mongoose `OverwriteModelError` on hot reload
Every model must use `mongoose.models.X ?? mongoose.model('X', schema)`. See the model files above.

### 4. MongoDB env var name
The Express backend had `MONGODB_URI_MONGODB_URI` (Vercel naming artifact/typo). Use `MONGODB_URI` in `.env.local`.

### 5. `suppliments` spelling
The schema, route paths, and field names all misspell "supplements" as "suppliments". Keep the misspelling — changing it requires a MongoDB data migration.

### 6. All POST/PUT bodies are now `application/json`
The Express backend used `multipart/form-data` for Lecture Series and Colloquia to receive files. The new Next.js routes use `application/json` everywhere. Any admin UI that was sending `FormData` for these routes must be updated to send `JSON` (with the Cloudinary URL as a field value, uploaded separately first).

---

## Response Contract (unchanged)

```json
{ "success": true, "data": {} }
{ "success": true, "message": "Deleted successfully" }
{ "success": false, "message": "reason" }
```

HTTP status codes are identical to the Express backend.

---

## Deployment

Once migrated, the separate Express backend on Vercel is no longer needed. The Next.js project handles both frontend and API. Remove any `NEXT_PUBLIC_API_URL` env vars pointing to the old backend and update fetch calls to use relative paths (`/api/...`).
