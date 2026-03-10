## CornerList MVP - Product Requirements (UI, Data Model, APIs)

### 1. Overview

- **Product summary**: CornerList is a web app that connects event hosts with DJs around UVA. Hosts can discover DJs that match their budget, date, and vibe. DJs use CornerList as a profile and portfolio (similar to a mix of Airbnb listings and LinkedIn profiles).
- **Primary users**:
  - **Host**: UVA students and organizations planning parties, formals, and other events.
  - **DJ**: Local DJs who want more bookings and a place to showcase their skills.
- **Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Auth, Postgres, Storage, Realtime), deployed on Vercel.
- **MVP philosophy**: Build **frontend UI first** using mock data, then layer in Supabase data model and APIs without drastically changing the UI or component structure.

---

### 2. Scope for MVP (Phase 1-2)

#### 2.1 In scope

- **Global**
  - Dark-theme layout and visual language.
  - Top-level navigation with "Join as a DJ", "FAQ" (stub), and "Sign in" entry points.
  - Basic routing:
    - `/` - Home (hero with Airbnb-style search bar + trending DJs).
    - `/search` - Search results page with inline filter refinement.
    - `/djs/[id]` - DJ profile page.
    - `/join-dj` - DJ onboarding wizard.
    - External auth UIs: Google sign-in/sign-up screens and email confirmation flows from Supabase Auth.

- **Search & discovery** (Phase 1 complete)
  - **Home page (`/`)**: hero section with an Airbnb-style search bar containing three segments side by side in a rounded pill:
    - **DJ or Genre** - text input for name + dropdown for genre, combined in one segment.
    - **Date** - date picker for event date.
    - **Budget** - numeric input for max $/hr + search icon button.
    - None of the fields are required. Clicking search (or pressing Enter) redirects to `/search` with whatever params were filled.
  - **Search results page (`/search`)**: shows filtered DJ grid with a compact inline filter bar at the top for refining name, genre, date, and price. Filters update results and URL params in real time.
  - Grid of DJ cards with music note placeholders (Phase 1) showing:
    - Stage name, genres, rating, price per hour.
    - Click navigates to `/djs/[id]`.

- **DJ profile** (Phase 1 complete)
  - Profile header with avatar placeholder, stage name, genres, rating.
  - Sections for:
    - About / bio.
    - Equipment & setup summary.
    - Availability summary (text).
    - Showcase tiles (placeholders for media).
    - **Comments / reviews section** where only verified hosts who have completed a past booking with this DJ can leave a comment.
  - "Request booking" button:
    - Phase 1: opens a non-functional modal with date, time, event type, guest count, and notes fields.
    - Phase 2: posts to a `/api/bookings` endpoint to create a pending booking.

- **DJ onboarding (Join DJ)** (Phase 1 complete)
  - `/join-dj` multi-step wizard (4 steps):
    - Step 1 - Basics: stage name, years of experience, **contact email** (required if not provided by auth).
    - Step 2 - Style & rate: genres (multi-select pills), hourly price.
    - Step 3 - Profile photo: upload a profile picture (can be skipped and added later). Stored in Supabase Storage in Phase 2.
    - Step 4 - Bio & preview: bio textarea and live preview of resulting profile card (including uploaded photo).
  - Onboarding must end with a **verified email** for notifications:
    - If the user signed in with Google, use the verified Google email.
    - If the user registered with email/password, rely on Supabase's email confirmation flow.
  - Local state in Phase 1; Supabase persistence in Phase 2 via APIs.

- **Testing infrastructure** (Phase 1 complete)
  - Three-layer testing strategy: unit tests, component tests, and E2E browser tests.
  - 84 tests total, all passing. See Section 6 for details.

- **Backend integration (Phase 2)**
  - Supabase schema for profiles, DJs, genres, media, bookings, and reviews.
  - API routes for:
    - Listing/searching DJs.
    - Fetching a single DJ with related data.
    - Creating/updating DJ profile from onboarding (including profile photo upload).
    - Creating booking requests tied to a host and DJ.
  - **Payment processing (Stripe)**:
    - Stripe Checkout integration for booking payments (host pays upon DJ acceptance).
    - `POST /api/checkout` to create a Stripe Checkout session linked to a booking.
    - `POST /api/webhooks/stripe` webhook handler for payment confirmation events.
  - **Email notifications (SendGrid)**:
    - Transactional emails triggered server-side from existing API routes:
      - DJ onboarding welcome email (after completing the wizard).
      - Host welcome email (after first sign-up).
      - New booking request notification (sent to DJ).
      - Booking accepted/declined notification (sent to host).

#### 2.2 Out of scope (later phases)

- Full booking lifecycle UX (availability checking, conflict detection, calendar views).
- Reviews CRUD UI (writing/editing/deleting reviews), advanced analytics.
- Admin tools / moderation dashboards.

---

### 3. User stories (MVP-focused)

#### 3.1 Host

- As a host, I can **open CornerList** and immediately see a search bar and trending DJs, so I understand what the app does.
- As a host, I can **enter any combination of name/genre, date, and budget** in the search bar and be taken to a results page, so I can quickly browse options.
- As a host, I can **refine filters** on the results page without leaving it, so I can narrow down DJs in real time.
- As a host, I can **view a DJ's full profile** to see bio, genres, price, availability, and reviews from other hosts.
- As a host, I can **submit a simple booking request** (Phase 2) that a DJ can later confirm.

#### 3.2 DJ

- As a DJ, I can **enter my core information** (stage name, experience, genres, price, bio) via a simple multi-step onboarding flow.
- As a DJ, I can **upload a profile picture** during onboarding so hosts see a real photo of me.
- As a DJ, I can **see a live preview** of how my profile will appear to hosts before completing onboarding.
- As a DJ, I can **update my profile later** (Phase 2) to adjust genres, pricing, bio, or photo.

---

### 4. UI flows & screen breakdown

#### 4.1 Home (`/`)

- **Header / Nav**
  - Logo / wordmark "CornerList".
  - Links: `Join as a DJ` -> `/join-dj`, `FAQ` (stub), `Sign in` (auth placeholder).

- **Hero section**
  - Dark gradient background with headline and supporting copy.
  - Airbnb-style search bar (rounded pill shape):
    - Segment 1: "DJ or Genre" - text input + genre dropdown side by side.
    - Segment 2: "Date" - date picker.
    - Segment 3: "Budget" - numeric input + circular search button.
    - Segments separated by subtle vertical dividers.
    - None of the fields are required to proceed.
    - Clicking search or pressing Enter navigates to `/search?q=&genre=&date=&maxPrice=`.

- **Trending DJs**
  - Small grid (3 cards) of featured/trending DJs below the hero.

#### 4.2 Search Results (`/search`)

- **Inline filter bar** (compact row at the top):
  - Text input for name/keywords.
  - Genre dropdown.
  - Date picker.
  - Max price input.
  - Result count label (e.g., "6 DJs found").
  - Filters update results and URL params in real time (no page reload).

- **Results grid**
  - Responsive grid of DJ cards.
  - DJ card contents:
    - Music note placeholder (Phase 1) / image (Phase 2).
    - Stage name, genres list.
    - Price per hour, rating.
    - Click navigates to `/djs/[id]`.
  - Empty state if no DJs match filters.

#### 4.3 DJ Profile (`/djs/[id]`)

- **Header**
  - Avatar placeholder (Phase 1) / uploaded photo (Phase 2), stage name, genres, rating badge.
  - Primary CTA: `Request booking`.

- **Content sections**
  - About: long-form bio.
  - Equipment & Setup: text list of key gear.
  - Availability: short description (e.g., "Weekends only").
  - Showcase: tiles for future media (images/videos/audio links from Supabase Storage).
  - **Comments / reviews**:
    - List of comments from hosts who have completed bookings with this DJ.
    - Each comment shows host display name (or anonymized label), rating (1-5), and short text.
    - If the logged-in user is a host with at least one completed booking for this DJ, show an "Add your review" button or inline form.

- **Request booking**
  - Phase 1: Modal with non-functional form (date, time, event type, guest count, notes). Submitting shows a mock success alert.
  - Phase 2: Form POSTs to `/api/bookings` and shows success/failure state.

#### 4.4 Join as a DJ (`/join-dj`)

- **Step 1 - Basics**
  - Stage name (text input, required).
  - Years of experience (number input).
  - Contact email (required; read-only if sourced from Google login).

- **Step 2 - Style & rate**
  - Genres (clickable pills for multi-select, at least one required).
  - Price per hour (numeric input, required).

- **Step 3 - Profile photo**
  - Upload area with circular preview of the selected image.
  - "Upload photo" and "Remove" buttons.
  - File input accepts images only.
  - This step can be skipped (photo is optional).

- **Step 4 - Bio & preview**
  - Bio textarea.
  - Live preview card showing how the DJ will appear in search and on profile header, including uploaded photo.

- **Controls**
  - Step indicator component (4 steps: Basics, Style & Rate, Photo, Bio & Preview).
  - Back / Next buttons, with validation on required fields per step.
  - Final "Finish" button:
    - Phase 1: shows a "mock saved" success screen with profile summary.
    - Phase 2: calls `/api/dj-profile` to create/update records in Supabase, uploads photo to Supabase Storage.

---

### 5. Project architecture

#### 5.1 Directory structure

```
src/
  app/                          Next.js App Router pages
    page.tsx                    Home (/)
    search/page.tsx             Search results (/search)
    djs/[id]/page.tsx           DJ profile (/djs/:id)
    join-dj/page.tsx            DJ onboarding (/join-dj)
    layout.tsx                  Root layout (dark theme, Navbar)
    globals.css                 Theme variables and base styles

  components/                   Shared UI primitives
    Navbar.tsx
    index.ts                    Barrel export

  features/
    search/                     Search & discovery feature
      components/
        DjCard.tsx              Individual DJ card
        DjGrid.tsx              Responsive card grid + empty state
        SearchHero.tsx           Home hero with Airbnb-style search bar
        SearchResultsBar.tsx    Compact inline filter bar for /search
      data/
        mockDjs.ts              Mock DJ data + getDjById helper
      utils/
        filterDjs.ts            Pure filter function (by name, genre, price)
      __tests__/                6 test files
      index.ts                  Barrel export

    dj-profile/                 DJ profile feature
      components/
        BookingModal.tsx        Booking request modal
        DjAboutSection.tsx      Bio section
        DjDetailsSection.tsx    Equipment & availability
        DjProfileHeader.tsx     Avatar, name, genres, rating, CTA
        DjReviewsSection.tsx    Reviews list + empty state
      data/
        mockReviews.ts          Mock review data + getReviewsByDjId helper
      __tests__/                7 test files
      index.ts                  Barrel export

    join-dj/                    DJ onboarding feature
      components/
        JoinDjWizard.tsx        4-step onboarding wizard
        StepIndicator.tsx       Step progress indicator
      __tests__/                2 test files
      index.ts                  Barrel export

  types/
    dj.ts                       Shared types: Genre, Dj, Review
    index.ts                    Barrel export

  test/
    setup.ts                    Vitest + jest-dom setup

e2e/                            Playwright E2E specs
  home.spec.ts
  search.spec.ts
  dj-profile.spec.ts
  join-dj.spec.ts
```

#### 5.2 Key patterns

- **Barrel exports**: every module boundary has an `index.ts` that re-exports its public API. Consumer code imports from the module root rather than reaching into internal paths:

```ts
// Clean imports via barrel exports
import { SearchHero, DjGrid, MOCK_DJS } from "@/features/search";
import { Navbar } from "@/components";
import { Genre, Dj } from "@/types";
```

- **Data colocation**: mock data lives inside the feature that owns it. `mockDjs.ts` lives in `features/search/data/` because search is the primary consumer. `mockReviews.ts` lives in `features/dj-profile/data/`. Cross-feature access goes through barrel exports (e.g., the DJ profile page imports `getDjById` from `@/features/search`).

- **Utility extraction**: filtering logic is extracted into `features/search/utils/filterDjs.ts` as a pure function, enabling independent unit testing and reuse across the home page and search page.

- **Shared types stay shared**: `Genre`, `Dj`, and `Review` types live in `src/types/` because they are consumed by all three features. Colocating them into one feature would create an awkward dependency direction.

---

### 6. Testing strategy

#### 6.1 Three-layer approach

```
Layer 3: E2E (Playwright)        4 specs, 19 tests
Layer 2: Component (Vitest+RTL)  12 suites, 50 tests
Layer 1: Unit (Vitest)           3 suites, 15 tests
                                 ──────────────────
                                 84 tests total
```

#### 6.2 Layer 1 - Unit tests (Vitest)

| Suite | Tests | What it covers |
|-------|-------|----------------|
| `mockDjs.test.ts` | 4 | `MOCK_DJS` shape validation, `getDjById` lookup |
| `mockReviews.test.ts` | 4 | `MOCK_REVIEWS` shape validation, `getReviewsByDjId` |
| `filterDjs.test.ts` | 7 | Filter by name, genre, price, combined, empty, no-match |

#### 6.3 Layer 2 - Component tests (Vitest + React Testing Library)

| Suite | Tests | Key assertions |
|-------|-------|----------------|
| Navbar | 4 | Logo, Join link, FAQ, Sign in |
| SearchHero | 5 | Fields render, search navigation, Enter key |
| DjCard | 5 | Name, price, rating, genres, link |
| DjGrid | 2 | Card count, empty state |
| SearchResultsBar | 4 | Count label, pre-fill, onChange |
| DjProfileHeader | 5 | Name, rating, price, genres, booking CTA |
| DjAboutSection | 2 | Heading, bio text |
| DjDetailsSection | 2 | Equipment, availability |
| DjReviewsSection | 4 | Review list, host names, empty state |
| BookingModal | 5 | Open/closed, form fields, close handlers |
| StepIndicator | 3 | Labels, active step, completed vs future |
| JoinDjWizard | 9 | Validation gates, step navigation, genre toggle, full flow |

Mocking strategy:
- `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`): mocked via `vi.mock()`.
- `next/link`: mocked to render a plain `<a>` tag.

#### 6.4 Layer 3 - E2E tests (Playwright, Chromium)

| Spec | Tests | Flow covered |
|------|-------|-------------|
| `home.spec.ts` | 5 | Hero content, search bar, navigation, query params, trending |
| `search.spec.ts` | 5 | All DJs, name filter, price filter, empty state, real-time filter |
| `dj-profile.spec.ts` | 5 | Profile details, about, equipment, reviews, booking modal |
| `join-dj.spec.ts` | 4 | Initial state, validation, full wizard, back navigation |

Playwright auto-starts the Next.js dev server via the `webServer` config.

#### 6.5 Test scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm test` | `vitest run` | Run all unit + component tests once |
| `npm run test:watch` | `vitest` | Watch mode for development |
| `npm run test:e2e` | `playwright test` | Run E2E browser tests |
| `npm run test:all` | `vitest run && playwright test` | Full suite |

---

### 7. Data model & Supabase schema (Phase 2)

#### 7.1 Key entities

- **profiles** - one row per Supabase user, linked to `auth.users`.
- **dj_profiles** - DJ-specific info (stage name, experience, price, bios, etc.).
- **genres** - list of possible DJ genres.
- **dj_genres** - many-to-many relation between DJs and genres.
- **media_assets** - images/videos/audio snippets for DJ showcases.
- **availability_blocks** - simple weekly availability (optional early).
- **bookings** - host booking requests (Phase 2 backend, minimal UI hook).
- **reviews** - comments/ratings that hosts leave on DJs after completed bookings.

#### 7.2 Important fields (summary)

- `profiles`
  - `id (UUID)` - PK, references `auth.users`.
  - `role` - `'host' | 'dj' | 'admin'`.
  - `full_name`, `avatar_url`, `email` (copy of verified email from auth), `bio`.

- `dj_profiles`
  - `id (UUID)` - PK.
  - `user_id (UUID)` - FK to `profiles.id`, UNIQUE (1:1).
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
  - `payment_status` (`unpaid | pending | paid | refunded`).
  - `stripe_session_id` (nullable text) - Stripe Checkout session ID for payment tracking.

- `reviews` (Phase 2+)
  - `id` (UUID) - PK.
  - `booking_id` (UUID) - FK to `bookings.id`.
  - `host_id` (UUID) - FK to `profiles.id`.
  - `dj_id` (UUID) - FK to `dj_profiles.id`.
  - `rating` (integer 1-5).
  - `comment` (short text).
  - `created_at`.

#### 7.3 Example Supabase model (SQL)

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

### 8. API design (Phase 2 - Next.js Route Handlers)

APIs are designed as **thin wrappers** over Supabase. These will be implemented as Route Handlers in the Next.js App Router (e.g., `app/api/.../route.ts`).

#### 8.1 DJ search list - `GET /api/djs`

**Purpose**: Provide filtered list of DJs for the search page. All query params are optional.

- **Request query parameters**:
  - `eventDate` (optional string, ISO date).
  - `startTime` (optional string, HH:mm).
  - `genre` (optional string) - genre slug (e.g., `hip-hop`, `edm`).
  - `maxPrice` (optional number) - maximum `price_per_hour`.
  - `q` (optional string) - free text; matches stage name or bio keywords.
  - `limit` (optional number, default 20) - pagination size.
  - `offset` (optional number, default 0) - pagination offset.

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
    .select(`
      id,
      stage_name,
      price_per_hour,
      rating_average,
      rating_count
    `)
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
    genres: [] as string[],
    avatarUrl: null as string | null,
  }));

  return NextResponse.json({ djs });
}
```

- **Error cases**:
  - `400` for invalid query parameters.
  - `500` for internal Supabase errors.

#### 8.2 Single DJ profile - `GET /api/djs/:id`

**Purpose**: Fetch all data needed for the DJ profile page.

- **Path param**:
  - `id` - `dj_profiles.id` or slug.

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

#### 8.3 Upsert DJ profile (onboarding) - `POST /api/dj-profile`

**Purpose**: Create or update the logged-in user's DJ profile from the onboarding wizard.

- **Auth**:
  - Requires Supabase session (`auth.uid()` present). Only the logged-in user can upsert their own DJ profile.

- **Request body (JSON)**:
  - `stageName: string`
  - `yearsExperience?: number`
  - `genres: string[]` (genre slugs)
  - `pricePerHour: number`
  - `contactEmail?: string` - used if auth provider does not already supply a verified email
  - `profileImageUrl?: string` - URL of uploaded profile photo (uploaded separately via `/api/dj-media`)
  - `about?: string`
  - `equipmentSummary?: string`
  - `availabilitySummary?: string`

- **Behavior**:
  - Ensure a `profiles` row exists for `auth.uid()` (create if missing) and keep `email` on that row in sync with the verified auth email or `contactEmail`.
  - If `profileImageUrl` is provided, update `profiles.avatar_url`.
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

#### 8.4 Upload DJ media - `POST /api/dj-media` (Phase 2+)

**Purpose**: Allow DJs to upload media (profile photo, images, short clips) to Supabase Storage and track them in `media_assets`.

- **Auth**: DJ must be logged in and have an associated `dj_profile`.
- **Request**:
  - Could be `multipart/form-data` with file(s) and fields:
    - `type` (`profile-photo`, `image`, `video`, `audio`).
    - `title` / `description` (optional).
  - API uploads to a Supabase Storage bucket and inserts into `media_assets`.
  - For `type=profile-photo`, also updates `profiles.avatar_url`.

- **Response**:
  - List of created `media_assets` rows (with public URLs).

#### 8.5 Create booking (stub) - `POST /api/bookings`

**Purpose**: Allow a host to submit a booking request to a DJ (backend support for the profile "Request booking" button).

- **Auth**: User must be logged in as `role = 'host'`.

- **Request body**:
  - `djId: string` - `dj_profiles.id`.
  - `eventDate: string` (ISO date).
  - `startTime: string` (HH:mm).
  - `endTime: string` (HH:mm).
  - `guestCount?: number`
  - `eventType?: string`
  - `notes?: string`

- **Behavior**:
  - Validate required fields.
  - Insert a row into `bookings` with:
    - `host_id = auth.uid()`'s profile.
    - `dj_id = djId`.
    - `status = 'pending'`.
  - Return created booking data.

- **Responses**:
  - `201` with booking JSON.
  - `401` if not authenticated.
  - `403` if user is not `host`.
  - `422` on validation error.

#### 8.6 DJ reviews - `GET /api/djs/:id/reviews`

**Purpose**: Fetch comments and ratings for a given DJ to display on the DJ profile page.

- **Path param**:
  - `id` - `dj_profiles.id`.

- **Behavior**:
  - Joins `reviews` with `profiles` (for host display name) and ensures associated bookings have `status = 'confirmed'`.
  - Returns latest reviews first.

- **Response (200)**:
  - `reviews: ReviewItem[]`
  - `ReviewItem` example:
    - `id`, `rating`, `comment`, `createdAt`, `hostDisplayName`.

#### 8.7 Create review - `POST /api/reviews`

**Purpose**: Allow a host who has previously completed a booking with a DJ to leave a comment and rating.

- **Auth**: User must be logged in as `role = 'host'`.

- **Request body**:
  - `bookingId: string`
  - `djId: string`
  - `rating: number` (1-5)
  - `comment: string`

- **Behavior**:
  - Check that:
    - The booking exists and `booking.host_id = auth.uid()`'s profile.
    - `booking.dj_id = djId`.
    - `booking.status = 'confirmed'`.
  - Insert new row into `reviews`.
  - Optionally update `dj_profiles.rating_average` and `rating_count` using an aggregate.

- **Responses**:
  - `201` with created review JSON.
  - `401` if not authenticated.
  - `403` if booking does not belong to this host or is not confirmed.
  - `422` for validation errors.

#### 8.8 Create checkout session - `POST /api/checkout`

**Purpose**: Create a Stripe Checkout session so a host can pay for a booking after the DJ accepts.

- **Auth**: User must be logged in as `role = 'host'`.

- **Request body**:
  - `bookingId: string` - the accepted booking to pay for.

- **Behavior**:
  - Validate that the booking exists, belongs to this host, and has `status = 'accepted'`.
  - Look up the DJ's `price_per_hour` and the booking's duration to compute the total.
  - Create a Stripe Checkout session with:
    - Line item: DJ service for the event (name, amount, quantity).
    - `success_url`: redirect back to `/djs/:id?booking=confirmed`.
    - `cancel_url`: redirect back to `/djs/:id?booking=cancelled`.
    - `metadata`: `{ bookingId }` for webhook correlation.
  - Update `bookings.stripe_session_id` with the session ID.
  - Update `bookings.payment_status` to `'pending'`.
  - Return the Checkout session URL for client-side redirect.

- **Responses**:
  - `200` with `{ url: string }` (Stripe Checkout URL).
  - `401` if not authenticated.
  - `403` if booking does not belong to this host.
  - `422` if booking is not in `accepted` status.
  - `500` on Stripe or Supabase error.

#### 8.9 Stripe webhook - `POST /api/webhooks/stripe`

**Purpose**: Receive Stripe events to confirm payment and update booking status.

- **Auth**: Verified via Stripe webhook signature (`stripe.webhooks.constructEvent`). No Supabase session required.

- **Handled events**:
  - `checkout.session.completed`:
    - Extract `bookingId` from session `metadata`.
    - Update `bookings.status` to `'confirmed'` and `bookings.payment_status` to `'paid'`.
    - Trigger a SendGrid confirmation email to both host and DJ.
  - `checkout.session.expired`:
    - Reset `bookings.payment_status` to `'unpaid'`.

- **Response**:
  - `200` with `{ received: true }` for all events (Stripe expects a 2xx).
  - `400` if signature verification fails.

#### 8.10 Email notifications (SendGrid)

Transactional emails are sent server-side from existing API routes using the SendGrid SDK (`@sendgrid/mail`). No dedicated email endpoint is needed.

| Trigger | Sent from | Recipient | Email content |
|---------|-----------|-----------|---------------|
| DJ completes onboarding | `POST /api/dj-profile` | DJ | Welcome email with profile link |
| Host signs up | Supabase Auth webhook or first API call | Host | Welcome email with search link |
| New booking request | `POST /api/bookings` | DJ | Booking details, accept/decline link |
| Booking accepted | (future) `PATCH /api/bookings/:id` | Host | Confirmation + payment link |
| Booking declined | (future) `PATCH /api/bookings/:id` | Host | Notification with suggestion to try other DJs |
| Payment confirmed | `POST /api/webhooks/stripe` | Host + DJ | Receipt and event confirmation |

Environment variables required:
- `SENDGRID_API_KEY` - SendGrid API key (server-side only, never in client bundle).
- `SENDGRID_FROM_EMAIL` - verified sender address (e.g., `noreply@cornerlist.com`).

---

### 9. Frontend-API interaction summary

- **Home page (`/`)**
  - Search bar builds query params and redirects to `/search`.
  - Trending DJs section uses a static slice of mock data (Phase 1, implemented) or a curated query (Phase 2).

- **Search results (`/search`)**
  - Phase 1 (implemented): reads query params from URL and filters the `MOCK_DJS` array client-side using the `filterDjs` utility (`features/search/utils/filterDjs.ts`).
  - Phase 2: calls `GET /api/djs?q=&genre=&date=&maxPrice=` on mount and on filter changes. Caches results with TanStack Query.

- **DJ profile (`/djs/[id]`)**
  - Phase 1 (implemented): uses `getDjById` from `@/features/search` and `getReviewsByDjId` from `@/features/dj-profile` for mock data lookup by ID.
  - Phase 2: uses server-side data fetching from `GET /api/djs/:id`.
  - "Request booking" form posts to `POST /api/bookings`.
  - After a DJ accepts a booking, the host sees a "Pay now" button that calls `POST /api/checkout` and redirects to Stripe Checkout. On success, the page reloads with a confirmed booking state.

- **DJ onboarding (`/join-dj`)**
  - Phase 1 (implemented): React local state for all 4 steps; profile photo stored as data URL in memory; on "Finish" shows a success screen with profile summary.
  - Phase 2: on "Finish", uploads photo via `/api/dj-media`, then POSTs to `/api/dj-profile` to upsert records, then routes to DJ profile page.

**Example: current home page (`app/page.tsx`)**

```tsx
import { SearchHero, DjGrid, MOCK_DJS } from "@/features/search";

export default function HomePage() {
  const featured = MOCK_DJS.slice(0, 3);

  return (
    <main>
      <SearchHero />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Trending DJs in Charlottesville
        </h2>
        <DjGrid djs={featured} />
      </section>
    </main>
  );
}
```

**Example: current search page imports (`app/search/page.tsx`)**

```tsx
import { Genre } from "@/types";
import { DjGrid, SearchResultsBar, MOCK_DJS, filterDjs } from "@/features/search";
import type { SearchParams } from "@/features/search";
```

---

### 10. Success metrics (6 categories)

1. **DJs onboarded**
   - At least **15 DJs** complete the join flow and have `dj_profiles.is_active = true` within the first 2 months after launch.

2. **Host search adoption**
   - At least **50 unique hosts** (distinct authenticated users) execute `GET /api/djs` at least once in a 30-day window.

3. **Search to profile engagement**
   - At least **60% of sessions** that hit `/search` also view at least one DJ profile (`/djs/[id]`).

4. **Booking intent**
   - At least **30 booking requests** created (`bookings` rows with `status` in `('pending','accepted','confirmed')`) in the first 2 months.

5. **Reviews coverage**
   - At least **40% of confirmed bookings** have at least one review row in `reviews` after 3 months.

6. **Performance & UX**
   - P95 response time for `GET /api/djs` and `GET /api/djs/:id` is **< 400 ms**.
   - Largest Contentful Paint for `/` and `/djs/[id]` is **< 2.5s** on mid-range mobile over UVA Wi-Fi.

---

### 11. Implementation order

1. **Phase 1 - UI + Testing (DONE)**
   - Implemented all 4 routes (`/`, `/search`, `/djs/[id]`, `/join-dj`) with mock data.
   - Built feature-based architecture with barrel exports, data colocation, and shared types.
   - Set up three-layer testing (Vitest + RTL + Playwright): 84 tests, all passing.
   - Delivered: 12 UI components, 6 mock DJs, 10 mock reviews, `filterDjs` utility, `StepIndicator`, full `JoinDjWizard` with 4-step flow and photo upload.

2. **Phase 2 - Data model + APIs + Payments + Emails**
   - Create Supabase schema for `profiles`, `dj_profiles`, `genres`, `dj_genres`, `media_assets`, `bookings`, and `reviews`.
   - Implement `GET /api/djs`, `GET /api/djs/:id`, `POST /api/dj-profile`, `POST /api/dj-media`, and `POST /api/bookings`.
   - Wire UI components to these endpoints (search, profile, onboarding with photo upload).
   - Replace mock data imports with API calls; add TanStack Query for caching.
   - Integrate Stripe: `POST /api/checkout` for Checkout sessions, `POST /api/webhooks/stripe` for payment confirmation.
   - Integrate SendGrid: transactional emails for DJ/host onboarding welcome, booking request/accept/decline notifications, and payment confirmation receipts.

3. **Phase 3 - Enhancements**
   - Advanced reviews UI (writing/editing/deleting reviews).
   - Admin tools and moderation dashboards.
   - Analytics and reporting.

4. **Phase 4 - React Native Mobile App**
   - **Framework**: React Native with Expo (managed workflow) targeting both iOS and Android.
   - **Code sharing**: reuse shared TypeScript types (`src/types/`) and API client logic from the web app. UI is built natively with React Native components (no web component reuse).
   - **Navigation**: React Navigation with stack and tab navigators mirroring the web routes (Home/Search, DJ Profile, Booking, Onboarding).
   - **Auth**: Supabase Auth via `@supabase/supabase-js` with the same Google OAuth + email/password flows, using native auth UI.
   - **Payments**: Stripe integration via `@stripe/stripe-react-native` for in-app booking payments.
   - **Push notifications**: Expo Notifications (or Firebase Cloud Messaging) for booking requests, acceptance/decline alerts, and payment confirmations -- complementing the SendGrid emails from Phase 2.
   - **Key screens**: Home + search, DJ profile + booking, DJ onboarding wizard with camera/gallery photo upload, settings/profile management.
   - **Deployment**: EAS Build for app binaries, distributed via Apple App Store and Google Play Store.
