## CornerList MVP – Product Requirements (UI, Data Model, APIs)

### 1. Overview

- **Product summary**: CornerList is a web app that connects event hosts with DJs around UVA. Hosts can discover DJs that match their budget, date, and vibe. DJs use CornerList as a profile and portfolio (similar to a mix of Airbnb listings and LinkedIn profiles).
- **Primary users**:
  - **Host**: UVA students and organizations planning parties, formals, and other events.
  - **DJ**: Local DJs who want more bookings and a place to showcase their skills.
- **Stack (planned)**: Next.js (App Router), TypeScript, Tailwind CSS (+ optional shadcn/ui), Supabase (Auth, Postgres, Storage, Realtime), deployed on Vercel.
- **MVP philosophy**: Build **frontend UI first** using mock data, then layer in Supabase data model and APIs without drastically changing the UI or component structure.

---

### 2. Scope for MVP (Phase 1–2)

#### 2.1 In scope

- **Global**
  - Dark‑theme layout and visual language.
  - Top‑level navigation with “Join as a DJ”, “FAQ” (stub), and “Sign in” entry points.
  - Basic routing:
    - `/` – Home + search/browse DJs.
    - `/djs/[id]` – DJ profile page.
    - `/join-dj` – DJ onboarding wizard.
    - External auth UIs: Google sign‑in/sign‑up screens and email confirmation flows from Supabase Auth.

- **Search & discovery**
  - Search hero with headline and gradient hero section.
  - **Primary filters (always visible)**:
    - Event **date** picker and optional start time input.
    - **Price** control (max budget per hour or per event).
  - **Secondary filters (collapsed under “More filters”)**:
    - Genre dropdown or multi‑select (Any, Hip‑Hop, EDM, Pop, House, etc.).
    - Text search (DJ name or keywords from bio).
  - Grid of DJ cards (mock first, then Supabase) with:
    - Stage name, genres, rating, price per hour.
    - “View profile” button.

- **DJ profile**
  - Profile header with avatar, stage name, genres, rating.
  - Sections for:
    - About / bio.
    - Equipment & setup summary.
    - Availability summary (text).
    - Showcase tiles (placeholders for media).
    - **Comments / reviews section** where only verified hosts who have completed a past booking with this DJ can leave a comment.
  - “Request booking” button:
    - Phase 1: opens a non‑functional modal.
    - Phase 2: posts to a `/api/bookings` endpoint to create a pending booking (schema stub).

- **DJ onboarding (Join DJ)**
  - `/join-dj` multi‑step wizard:
    - Step 1 – Basics: stage name, years of experience, **contact email** (required if not provided by auth).
    - Step 2 – Style & rate: genres (multi‑select pills), hourly price.
    - Step 3 – Bio & preview: bio textarea and live preview of resulting profile card.
  - Onboarding must end with a **verified email** for notifications:
    - If the user signed in with Google, use the verified Google email.
    - If the user registered with email/password, rely on Supabase’s email confirmation flow.
  - Local state in Phase 1; Supabase persistence in Phase 2 via APIs.

- **Backend integration (Phase 2)**
  - Supabase schema for profiles, DJs, genres, media, and (stubbed) bookings.
  - API routes for:
    - Listing/searching DJs.
    - Fetching a single DJ with related data.
    - Creating/updating DJ profile from onboarding.
    - Creating booking requests tied to a host and DJ.

#### 2.2 Out of scope (later phases)

- Full booking lifecycle UX (availability checking, conflict detection, calendar views).
- Real payment processing and escrow (e.g., Stripe).
- Real‑time messaging (Supabase Realtime) and notifications.
- Reviews CRUD UI (writing/editing/deleting reviews), advanced analytics.
- Admin tools / moderation dashboards.

---

### 3. User stories (MVP‑focused)

#### 3.1 Host

- As a host, I can **open CornerList** and immediately see a list of DJs with key details, so I understand what the app offers.
- As a host, I can **filter DJs** by search text, genre, and max price, so I can quickly find options that fit my event.
- As a host, I can **view a DJ’s full profile** to see bio, genres, price, and availability summary, so I can decide whether to reach out.
- As a host, I can **submit a simple booking request** (Phase 2) that a DJ can later confirm.

#### 3.2 DJ

- As a DJ, I can **enter my core information** (stage name, experience, genres, price, bio) via a simple multi‑step onboarding flow.
- As a DJ, I can **see a live preview** of how my profile will appear to hosts before completing onboarding.
- As a DJ, I can **update my profile later** (Phase 2) to adjust genres, pricing, or bio.

---

### 4. UI flows & screen breakdown

#### 4.1 Home / Search (`/`)

- **Header / Nav**
  - Logo / wordmark “CornerList”.
  - Links: `Join as a DJ` → `/join-dj`, `FAQ` (stub), `Sign in` (auth placeholder).

- **Hero section**
  - Dark gradient background with headline and supporting copy.
  - Positioned search/filters card beneath the main text.

- **Filters card**
  - **Primary row (always visible)**:
    - Date picker: “Event date”.
    - Optional time selector: “Start time” (can be stubbed initially).
    - Price input or slider: “Max budget ($/hr or per night)”.
    - Search button.
  - **Secondary row (expandable “More filters”)**:
    - Genre multi‑select (Any, Hip‑Hop, EDM, Pop, House, R&B).
    - Text input: “Search by DJ name or keywords”.

- **Results grid**
  - Responsive grid of DJ cards.
  - DJ card contents:
    - Image placeholder.
    - Stage name, genres list.
    - Price per hour, rating.
    - “View profile” button → `/djs/[id]`.
  - Empty state if no DJs match filters.

**Example Next.js page (simplified UI using mock data):**

```tsx
// app/page.tsx
"use client";

import { useMemo, useState } from "react";

type Dj = {
  id: string;
  stageName: string;
  pricePerHour: number;
  rating: number;
  genres: string[];
};

const MOCK_DJS: Dj[] = [
  { id: "mike", stageName: "DJ Mike Beats", pricePerHour: 120, rating: 4.9, genres: ["Hip-Hop", "Pop"] },
  { id: "emma", stageName: "DJ Emma Vibe", pricePerHour: 150, rating: 5.0, genres: ["EDM", "House"] },
];

export default function HomePage() {
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const filtered = useMemo(
    () =>
      MOCK_DJS.filter((dj) => {
        const priceOk = !maxPrice || dj.pricePerHour <= Number(maxPrice);
        const textOk =
          !q || dj.stageName.toLowerCase().includes(q.toLowerCase());
        return priceOk && textOk;
      }),
    [maxPrice, q]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-semibold">Book the perfect DJ.</h1>
        <div className="mt-4 flex gap-3">
          <input
            placeholder="Search by DJ name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max $/hr"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((dj) => (
            <article
              key={dj.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="h-24 rounded-lg bg-slate-800" />
              <h2 className="mt-3 text-lg font-semibold">{dj.stageName}</h2>
              <p className="mt-1 text-sm text-slate-300">
                ${dj.pricePerHour} / hour • ⭐ {dj.rating.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {dj.genres.join(" • ")}
              </p>
            </article>
          ))}

          {filtered.length === 0 && (
            <p className="mt-6 text-sm text-slate-400">
              No DJs match your filters yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
```

#### 4.2 DJ Profile (`/djs/[id]`)

- **Header**
  - Avatar, stage name, genres, rating badge.
  - Primary CTA: `Request booking`.

- **Content sections**
  - About: long‑form bio.
  - Equipment & Setup: text list of key gear.
  - Availability: short description (e.g., “Weekends only”).
  - Showcase: tiles for future media (images/videos/audio links from Supabase Storage).
  - **Comments / reviews**:
    - List of comments from hosts who have completed bookings with this DJ.
    - Each comment shows host display name (or anonymized label), rating (1–5), and short text.
    - If the logged‑in user is a host with at least one completed booking for this DJ, show an “Add your review” button or inline form.

- **Request booking**
  - Phase 1: Modal with non‑functional form (date, time, guest count, notes).
  - Phase 2: Form POSTs to `/api/bookings` and shows success/failure state.

#### 4.3 Join as a DJ (`/join-dj`)

- **Step 1 – Basics**
  - Stage name (text input).
  - Years of experience (number or text).
  - Contact email (if not sourced from Google; show read‑only if already known).

- **Step 2 – Style & rate**
  - Genres (clickable pills for multi‑select).
  - Price per hour (numeric input).

- **Step 3 – Bio & preview**
  - Bio textarea.
  - Preview card component showing how the DJ will appear in search and on profile header.

- **Controls**
  - Step indicator component.
  - Back / Next buttons, with validation on required fields.
  - Final “Finish” button:
    - Phase 1: shows a “mock saved” message only.
    - Phase 2: calls `/api/dj-profile` to create/update records in Supabase.

---

### 5. Data model & Supabase schema (high level)

#### 5.1 Key entities

- **profiles** – one row per Supabase user, linked to `auth.users`.
- **dj_profiles** – DJ‑specific info (stage name, experience, price, bios, etc.).
- **genres** – list of possible DJ genres.
- **dj_genres** – many‑to‑many relation between DJs and genres.
- **media_assets** – images/videos/audio snippets for DJ showcases.
- **availability_blocks** – simple weekly availability (optional early).
- **bookings** – host booking requests (Phase 2 backend, minimal UI hook).
 - **reviews** – comments/ratings that hosts leave on DJs after completed bookings.

#### 5.2 Important fields (summary)

- `profiles`
  - `id (UUID)` – PK, references `auth.users`.
  - `role` – `'host' | 'dj' | 'admin'`.
  - `full_name`, `avatar_url`, `email` (copy of verified email from auth), `bio`.

- `dj_profiles`
  - `id (UUID)` – PK.
  - `user_id (UUID)` – FK to `profiles.id`, UNIQUE (1:1).
  - `stage_name`, `years_experience`, `price_per_hour`.
  - `about`, `equipment_summary`, `availability_summary`.
  - `is_active`, `rating_average`, `rating_count`.

- `genres`
  - `id`, `slug`, `name`.

- `dj_genres`
  - `dj_id` (FK to `dj_profiles`), `genre_id` (FK to `genres`), composite PK.

- `media_assets`
  - `dj_id`, `type` (`image | video | audio | link`), `storage_path`, `public_url`.

- `bookings` (Phase 2)
  - `host_id`, `dj_id`, `event_date`, `start_time`, `end_time`, `notes`.
  - `status` (`pending | accepted | declined | confirmed | cancelled`).

- `reviews` (Phase 2+)
  - `id` (UUID) – PK.
  - `booking_id` (UUID) – FK to `bookings.id`.
  - `host_id` (UUID) – FK to `profiles.id`.
  - `dj_id` (UUID) – FK to `dj_profiles.id`.
  - `rating` (integer 1–5).
  - `comment` (short text).
  - `created_at`.

#### 5.3 Example Supabase model (SQL)

Concrete example of the `dj_profiles` table definition:

```sql
create table public.dj_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id) on delete cascade unique,
  stage_name text not null,
  years_experience int check (years_experience >= 0),
  price_per_hour int not null check (price_per_hour >= 0),
  about text,
  equipment_summary text,
  availability_summary text,
  is_active boolean default true,
  rating_average numeric(3,2),
  rating_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index dj_profiles_active_idx on public.dj_profiles(is_active);
create index dj_profiles_price_idx on public.dj_profiles(price_per_hour);
```

Supabase Auth + Row Level Security (RLS) will ensure:

- Anyone can **read active DJ profiles** for search.
- Only a DJ (owner of the `profile`/`dj_profile`) can modify their own `dj_profiles`, `dj_genres`, and `media_assets`.
- Only host and DJ involved in a booking can read its details (once bookings are implemented).

---

### 6. API design (Next.js API routes or Route Handlers)

APIs are designed as **thin wrappers** over Supabase. For the first full‑stack pass, these will be implemented as Route Handlers in the Next.js App Router (e.g., `app/api/.../route.ts`).

#### 6.1 DJ search list – `GET /api/djs`

**Purpose**: Provide filtered list of DJs for the search page, prioritizing event date and price.

- **Request query parameters**:
  - `eventDate` (optional string, ISO date).
  - `startTime` (optional string, HH:mm).
  - `genre` (optional string) – genre slug (e.g., `hip-hop`, `edm`).
  - `maxPrice` (optional number) – maximum `price_per_hour`.
  - `q` (optional string) – free text; matches stage name or bio keywords.
  - `limit` (optional number, default 20) – pagination size.
  - `offset` (optional number, default 0) – pagination offset.

- **Behavior**:
  - Joins `dj_profiles` with `profiles` and `dj_genres`/`genres`.
  - Filters on:
    - `dj_profiles.is_active = true`.
    - `price_per_hour <= maxPrice` if provided.
    - `genre` slug if provided.
    - `q` against stage name and about text (basic `ILIKE` search).
  - `eventDate`/`startTime` can later be used with `availability_blocks` to exclude unavailable DJs or rank results.
  - Orders by:
    - Default: `rating_average DESC NULLS LAST`, then `price_per_hour ASC`.

- **Response (200)**:
  - `djs: DjSearchItem[]`
  - `DjSearchItem` example:
    - `id`, `stageName`, `pricePerHour`, `ratingAverage`, `ratingCount`, `genres: string[]`, `avatarUrl`.

**Example Next.js route handler (simplified):**

```ts
// app/api/djs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const maxPrice = searchParams.get("maxPrice");
  const genre = searchParams.get("genre");
  const q = searchParams.get("q");

  let query = supabase
    .from("dj_profiles")
    .select(
      `
      id,
      stage_name,
      price_per_hour,
      rating_average,
      rating_count
    `
    )
    .eq("is_active", true)
    .order("rating_average", { ascending: false, nullsFirst: false })
    .order("price_per_hour", { ascending: true });

  if (maxPrice) {
    query = query.lte("price_per_hour", Number(maxPrice));
  }

  if (q) {
    query = query.ilike("stage_name", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load DJs" }, { status: 500 });
  }

  const djs = (data ?? []).map((row) => ({
    id: row.id,
    stageName: row.stage_name,
    pricePerHour: row.price_per_hour,
    ratingAverage: row.rating_average,
    ratingCount: row.rating_count,
    genres: [] as string[], // populated when joins are added
    avatarUrl: null as string | null,
  }));

  return NextResponse.json({ djs });
}
```

- **Error cases**:
  - `400` for invalid query parameters.
  - `500` for internal Supabase errors.

#### 6.2 Single DJ profile – `GET /api/djs/:id`

**Purpose**: Fetch all data needed for the DJ profile page.

- **Path param**:
  - `id` – `dj_profiles.id` or slug.

- **Behavior**:
  - Join `dj_profiles` with `profiles`, `dj_genres`/`genres`, and `media_assets`.
  - Return 404 if `dj_profiles.is_active = false` or not found.

- **Response (200)**:
  - `dj` object containing:
    - Basic info: `id`, `stageName`, `yearsExperience`, `about`, `equipmentSummary`, `availabilitySummary`.
    - Avatar and base profile info from `profiles`.
    - `genres: string[]`.
    - `media: MediaAsset[]`.
    - `ratingAverage`, `ratingCount`, `pricePerHour`.

#### 6.3 Upsert DJ profile (onboarding) – `POST /api/dj-profile`

**Purpose**: Create or update the logged‑in user’s DJ profile from the onboarding wizard.

- **Auth**:
  - Requires Supabase session (`auth.uid()` present). Only the logged‑in user can upsert their own DJ profile.

- **Request body (JSON)**:
  - `stageName: string`
  - `yearsExperience?: number`
  - `genres: string[]` (genre slugs)
  - `pricePerHour: number`
  - `contactEmail?: string`  -- used if auth provider does not already supply a verified email
  - `about?: string`
  - `equipmentSummary?: string`
  - `availabilitySummary?: string`

- **Behavior**:
  - Ensure a `profiles` row exists for `auth.uid()` (create if missing) and keep `email` on that row in sync with the verified auth email or `contactEmail`.
  - Upsert into `dj_profiles` for that `user_id`:
    - Set/replace fields based on payload.
  - Sync `dj_genres`:
    - Look up genre IDs by slug in `genres`.
    - Replace existing rows for this DJ with new set.
  - Return the updated `dj_profile` + `genres`.

- **Responses**:
  - `200` with updated DJ profile JSON.
  - `401` if not authenticated.
  - `422` if validation fails.
  - `500` on Supabase error.

#### 6.4 Upload DJ media – `POST /api/dj-media` (Phase 2+)

**Purpose**: Allow DJs to upload media (images, short clips) to Supabase Storage and track them in `media_assets`.

- **Auth**: DJ must be logged in and have an associated `dj_profile`.
- **Request**:
  - Could be `multipart/form-data` with file(s) and fields:
    - `type` (`image`, `video`, `audio`).
    - `title` / `description` (optional).
  - API uploads to a Supabase Storage bucket and inserts into `media_assets`.

- **Response**:
  - List of created `media_assets` rows (with public URLs).

#### 6.5 Create booking (stub) – `POST /api/bookings`

**Purpose**: Allow a host to submit a booking request to a DJ (backend support for the profile “Request booking” button).

- **Auth**: User must be logged in as `role = 'host'`.

- **Request body**:
  - `djId: string` – `dj_profiles.id`.
  - `eventDate: string` (ISO date).
  - `startTime: string` (HH:mm).
  - `endTime: string` (HH:mm).
  - `guestCount?: number`
  - `eventType?: string`
  - `notes?: string`

- **Behavior**:
  - Validate required fields.
  - Insert a row into `bookings` with:
    - `host_id = auth.uid()`’s profile.
    - `dj_id = djId`.
    - `status = 'pending'`.
  - Return created booking data.

- **Responses**:
  - `201` with booking JSON.
  - `401` if not authenticated.
  - `403` if user is not `host`.
  - `422` on validation error.

#### 6.6 DJ reviews – `GET /api/djs/:id/reviews`

**Purpose**: Fetch comments and ratings for a given DJ to display on the DJ profile page.

- **Path param**:
  - `id` – `dj_profiles.id`.

- **Behavior**:
  - Joins `reviews` with `profiles` (for host display name) and ensures associated bookings have `status = 'confirmed'`.
  - Returns latest reviews first.

- **Response (200)**:
  - `reviews: ReviewItem[]`
  - `ReviewItem` example:
    - `id`, `rating`, `comment`, `createdAt`, `hostDisplayName`.

#### 6.7 Create review – `POST /api/reviews`

**Purpose**: Allow a host who has previously completed a booking with a DJ to leave a comment and rating.

- **Auth**: User must be logged in as `role = 'host'`.

- **Request body**:
  - `bookingId: string`
  - `djId: string`
  - `rating: number` (1–5)
  - `comment: string`

- **Behavior**:
  - Check that:
    - The booking exists and `booking.host_id = auth.uid()`’s profile.
    - `booking.dj_id = djId`.
    - `booking.status = 'confirmed'`.
  - Insert new row into `reviews`.
  - Optionally update `dj_profiles.rating_average` and `rating_count` using an aggregate.

- **Responses**:
  - `201` with created review JSON.
  - `401` if not authenticated.
  - `403` if booking does not belong to this host or is not confirmed.
  - `422` for validation errors.

---

### 7. Frontend–API interaction summary

- **Search page (`/`)**
  - Phase 1: Uses mock `Dj[]` array in client state.
  - Phase 2: Calls `GET /api/djs?q=&genre=&maxPrice=` on filter changes. Caches results on the client (e.g., with TanStack Query).

- **DJ profile (`/djs/[id]`)**
  - Phase 1: Uses mock data (e.g., from static JSON).
  - Phase 2: Uses server‑side data fetching (Next.js Route Segment) from `GET /api/djs/:id`.
  - “Request booking” form posts to `POST /api/bookings`.

- **DJ onboarding (`/join-dj`)**
  - Phase 1: React local state; on “Finish” show success toast only.
  - Phase 2: On “Finish”, POSTs to `/api/dj-profile` to upsert records, then routes to DJ profile page or dashboard.

---

### 8. Success metrics (6 categories)

1. **DJs onboarded**
   - At least **15 DJs** complete the join flow and have `dj_profiles.is_active = true` within the first 2 months after launch.

2. **Host search adoption**
   - At least **50 unique hosts** (distinct authenticated users) execute `GET /api/djs` at least once in a 30‑day window.

3. **Search → profile engagement**
   - At least **60% of sessions** that hit `/` also view at least one DJ profile (`/djs/[id]`).

4. **Booking intent**
   - At least **30 booking requests** created (`bookings` rows with `status` in `('pending','accepted','confirmed')`) in the first 2 months.

5. **Reviews coverage**
   - At least **40% of confirmed bookings** have at least one review row in `reviews` after 3 months.

6. **Performance & UX**
   - P95 response time for `GET /api/djs` and `GET /api/djs/:id` is **< 400 ms**.
   - Largest Contentful Paint for `/` and `/djs/[id]` is **< 2.5s** on mid‑range mobile over UVA Wi‑Fi.

---

### 9. Implementation order (high level)

1. **Phase 1 – UI only**
   - Implement `/`, `/djs/[id]`, `/join-dj` using mock data and feature‑based folder structure.
2. **Phase 2 – Data model + APIs**
   - Create Supabase schema for `profiles`, `dj_profiles`, `genres`, `dj_genres`, `media_assets`, and `bookings`.
   - Implement `GET /api/djs`, `GET /api/djs/:id`, `POST /api/dj-profile`, and `POST /api/bookings`.
   - Wire UI components to these endpoints (search, profile, onboarding).
3. **Phase 3 – Enhancements**
   - Add media upload flow, messaging, reviews, and real payments as separate PRDs.

