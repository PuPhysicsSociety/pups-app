# API Specification — Physics Society Backend

**Base URL:** `https://<your-vercel-domain>`

**Content-Type:** All write endpoints accept `multipart/form-data`. GET and DELETE use no body.

**Response envelope:**

```json
{ "success": true, "data": {} }
{ "success": false, "message": "error reason" }
```

**Authentication:** All write endpoints (POST, PUT, DELETE) require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

---

## Auth

### `POST /api/auth/login`

Returns a JWT for the admin user.

**Body** (`application/json`)

```json
{ "email": "admin@pups.com", "password": "yourpassword" }
```

**Response `200`**

```json
{ "success": true, "token": "<jwt>" }
```

**Response `401`** — `{ "success": false, "message": "Invalid credentials" }`

> Token expiry is controlled by `JWT_EXPIRES_IN` env var (default `7d`).

---

## Colloquium

Base path: `/api/colloquia`

### Data shape

```json
{
  "_id": "684673f1a2b3c4d5e6f70001",
  "title": "Quantum Gravity and the Holographic Principle",
  "speaker": {
    "name": "Dr. Rina Sharma",
    "affiliation": "TIFR Mumbai"
  },
  "abstract": "We explore the conjecture that...",
  "time": "2026-07-10T15:00:00.000Z",
  "venue": "Seminar Hall, Physics Dept.",
  "ytLink": "https://youtube.com/live/abc123",
  "poster": "https://res.cloudinary.com/dfrqqn5ry/image/upload/v1/physics-society/colloquia/posters/poster_xyz.jpg",
  "reg_form_link": "https://forms.gle/abc123",
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:00:00.000Z"
}
```

> `poster` is a Cloudinary URL. If no poster was uploaded, the field is `undefined`.

---

### `GET /api/colloquia`

Returns all colloquia sorted newest first. No auth required.

**Response `200`**

```json
{ "success": true, "data": [ ...colloquia ] }
```

---

### `GET /api/colloquia/:id`

Returns a single colloquium by MongoDB `_id`. No auth required.

**Response `200`**

```json
{ "success": true, "data": { ...colloquium } }
```

**Response `404`**

```json
{ "success": false, "message": "Not found" }
```

---

### `POST /api/colloquia`

Creates a colloquium. Requires auth. Accepts `multipart/form-data`.

**Headers**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | |
| `speaker` | text (JSON string) | yes | `{"name":"Dr. X","affiliation":"IISc"}` |
| `abstract` | text | no | |
| `time` | text | no | ISO 8601 — e.g. `2026-07-10T15:00:00Z` |
| `venue` | text | no | |
| `ytLink` | text | no | YouTube live or recording link |
| `reg_form_link` | text | no | Google Form link |
| `poster` | file | no | JPG/PNG/WEBP, max 5 MB — uploaded to Cloudinary, stored as URL |

**Response `201`**

```json
{ "success": true, "data": { ...createdColloquium } }
```

**Response `400`** — validation error (e.g. missing `title`)

```json
{ "success": false, "message": "Path `title` is required." }
```

**Response `401`** — missing or invalid token

```json
{ "success": false, "message": "No token provided" }
```

---

### `PUT /api/colloquia/:id`

Updates an existing colloquium. Requires auth. Accepts `multipart/form-data`.

Send only the fields that need to change. All fields are optional.

**Headers**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Fields** — same as POST, all optional.

> If `poster` file is not sent, the existing Cloudinary URL is preserved.
> To replace the poster, send a new file in the `poster` field.

**Response `200`**

```json
{ "success": true, "data": { ...updatedColloquium } }
```

**Response `404`** — `{ "success": false, "message": "Not found" }`

---

### `DELETE /api/colloquia/:id`

Deletes a colloquium. Requires auth.

**Headers**
```
Authorization: Bearer <token>
```

**Response `200`**

```json
{ "success": true, "message": "Deleted successfully" }
```

**Response `404`** — `{ "success": false, "message": "Not found" }`

---

## Lecture Series

### `GET /api/lecture-series`

Returns all lecture series, newest first.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Intro to QFT",
      "description": "...",
      "thumbnail": "https://res.cloudinary.com/...",
      "lecturer_details": [
        { "name": "Dr. Roy", "affiliation": "IISc" }
      ],
      "date_time": {
        "start": "2026-07-01T10:00:00.000Z",
        "end": "2026-08-01T10:00:00.000Z",
        "schedule": "Every Saturday 10am"
      },
      "mode": "online",
      "no_of_classes": 12,
      "reg_form_link": "https://forms.gle/...",
      "to_contact": [
        { "name": "Arka", "email": "arka@example.com", "phone": "9876543210", "role": "Coordinator" }
      ],
      "suppliments": [
        { "url": "https://res.cloudinary.com/...", "name": "notes.pdf", "type": "application/pdf" }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### `GET /api/lecture-series/:id`

Returns a single lecture series.

**Response `200`** — same shape as single object above.
**Response `404`** — `{ "success": false, "message": "Not found" }`

---

### `POST /api/lecture-series`

Creates a lecture series. Accepts `multipart/form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | |
| `mode` | text | yes | `online` or `offline` |
| `description` | text | no | |
| `thumbnail` | file | no | image, max 20 MB → uploaded to Cloudinary |
| `lecturer_details` | text (JSON) | no | `[{"name":"...","affiliation":"..."}]` |
| `date_time` | text (JSON) | no | `{"start":"...","end":"...","schedule":"..."}` |
| `no_of_classes` | text | no | integer |
| `reg_form_link` | text | no | |
| `to_contact` | text (JSON) | no | `[{"name":"...","email":"...","phone":"...","role":"..."}]` |
| `suppliments` | file(s) | no | PDFs/docs, up to 10 files, max 20 MB each → stored as `{url, name, type}` |

**Response `201`** — created document.

---

### `PUT /api/lecture-series/:id`

Updates a lecture series. Same fields as POST — only send what needs to change.
If `thumbnail` or `suppliments` files are omitted, existing values are preserved.

**Response `200`** — updated document.

---

### `POST /api/lecture-series/:id/suppliments`

Adds a supplement by URL. Use this when the file was uploaded directly to Cloudinary from the frontend, or when linking a Google Drive / external file.

**Body** (`application/json`)

```json
{
  "url": "https://res.cloudinary.com/...",
  "name": "lecture-notes.pdf",
  "type": "application/pdf",
  "source": "cloudinary"
}
```

```json
{
  "url": "https://drive.google.com/file/d/...",
  "name": "lecture-notes.pdf",
  "source": "drive"
}
```

| Field | Required | Notes |
|---|---|---|
| `url` | yes | Cloudinary `secure_url`, Google Drive share link, or any external URL |
| `name` | no | display filename |
| `type` | no | MIME type |
| `source` | no | `cloudinary` \| `drive` \| `external` |

**Response `200`** — updated document with new supplement appended.

---

### `DELETE /api/lecture-series/:id/suppliments`

Removes a specific supplement from the array by URL.

**Body** (`application/json`)

```json
{ "url": "https://res.cloudinary.com/..." }
```

**Response `200`** — updated document with supplement removed.

---

### `DELETE /api/lecture-series/:id`

Deletes a lecture series.

**Response `200`**

```json
{ "success": true, "message": "Deleted successfully" }
```
