# SpeedAI Labs Blog

A production-grade, SEO-optimized blog platform built with **Next.js 15 (App Router)**, **Payload CMS 3.x**, and **Supabase (PostgreSQL)**. 

Designed both as a standalone blog application and as a modular component that seamlessly integrates into the organization's main website repository.

---

## ⚡ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) | App Router, React Server Components (RSC), SSR / SSG |
| **CMS** | [Payload CMS 3.x](https://payloadcms.com/) | Native Next.js CMS, Lexical Rich Text editor, drafts & versioning |
| **Database** | [Supabase](https://supabase.com/) | Managed PostgreSQL via `@payloadcms/db-postgres` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Sass | Clean, responsive light theme |
| **Media & Images** | [Sharp](https://sharp.pixelplumbing.com/) | Automated multi-size responsive image generation |
| **Type Safety** | TypeScript 5 | Auto-generated database & collection types |

---

## 🌟 Key Features

- **🚀 Server-Side Rendered (SSR) & SEO First:** Googlebot and search engines receive 100% pre-rendered HTML on the first HTTP request. Zero reliance on client-side JS rendering.
- **🔍 Automated SEO & Crawlability:**
  - Dynamic Open Graph and Twitter Card tags.
  - Schema.org `BlogPosting` JSON-LD structured data for Google Rich Snippets.
  - Auto-updating dynamic `/sitemap.xml` generated directly from published posts.
  - Configured `/robots.txt` protecting private CMS routes (`/admin/`, `/api/`) while allowing indexable content.
  - Canonical URL support to avoid duplicate content penalties.
- **✍️ Intuitive Daily Publishing Workflow:**
  - Rich text editor with headings, markdown support, code blocks, and media uploads.
  - Dedicated SEO metadata controls per post (custom meta title, description, and social share image).
  - Drafts, version history, autosave, and scheduled/immediate publishing.
- **👥 Content Relational Architecture:**
  - Authors with avatar, role, bio, and social handles.
  - Categorization and tagging system.
- **🧩 Modular & Integration-Ready:** Uses route groups `(frontend)` and `(payload)` to allow clean merging into a larger mono-repo or parent Next.js site without route collisions.

---

## 📁 Project Structure

```
blog_testing/
├── src/
│   ├── app/
│   │   ├── (frontend)/              # Public-facing blog routes
│   │   │   ├── layout.tsx           # Global HTML, site metadata & light theme
│   │   │   ├── page.tsx             # Blog homepage listing feed
│   │   │   ├── globals.css          # CSS styles & prose formatting
│   │   │   ├── sitemap.ts           # Dynamic sitemap.xml generator
│   │   │   ├── robots.ts            # Dynamic robots.txt generator
│   │   │   └── blog/[slug]/         # Individual blog post page
│   │   │       ├── page.tsx         # SSR post view + JSON-LD structured data
│   │   │       └── not-found.tsx    # Custom 404 page for missing posts
│   │   └── (payload)/               # Payload CMS Admin & API routes
│   │       ├── layout.tsx           # Admin layout with @payloadcms/next/css
│   │       ├── custom.scss          # Custom admin styling overrides
│   │       ├── admin/               # Admin panel views & import map
│   │       └── api/                 # REST & GraphQL endpoints
│   ├── collections/                 # Payload Schema Definitions
│   │   ├── Posts.ts                 # Blog post schema (content, SEO, status)
│   │   ├── Authors.ts               # Author profiles & bios
│   │   ├── Categories.ts            # Taxonomy & categories
│   │   ├── Media.ts                 # Image uploads & responsive sizes
│   │   └── Users.ts                 # Admin authentication
│   ├── components/
│   │   └── RichText.tsx             # Lexical rich text HTML renderer
│   ├── lib/
│   │   ├── payload.ts               # Cached Payload client helper
│   │   └── formatDate.ts            # Date formatting utility
│   └── payload.config.ts            # Core CMS configuration & DB connection
├── .env.example                     # Environment variables template
├── next.config.ts                   # Next.js configuration wrapped with withPayload
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (`v22+` recommended)
- **npm** or **pnpm**
- A **Supabase** account with a PostgreSQL project

---

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd blog_testing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```

   Fill in your `.env` values:
   ```env
   # Database (Supabase PostgreSQL URI)
   DATABASE_URI=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

   # Supabase Storage & API
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_BUCKET=media

   # Payload CMS Secret (Min 32 characters)
   PAYLOAD_SECRET=your-random-secret-key-at-least-32-chars

   # Public Website URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   > Generate a secure secret with: `openssl rand -hex 32`

4. **Generate Import Map & Types:**
   ```bash
   npm run generate:importmap
   npm run generate:types
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. Open your browser:
   - **Public Blog**: [http://localhost:3000](http://localhost:3000)
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📝 Content Management Guide (For Daily Operations)

### 1. Creating the First Admin
When accessing `/admin` for the first time, register your primary administrative account.

### 2. Setting Up Taxonomy (One-time or occasional)
- **Authors**: Go to **Authors** → **Create New** (Add name, job role, avatar image, and social links).
- **Categories**: Go to **Categories** → **Create New** (e.g., *Engineering*, *AI Updates*, *Tutorials*).

### 3. Publishing a Blog Post
1. Navigate to **Posts** → **Create New**.
2. **Title & Excerpt**: Enter a compelling title (slug auto-generates) and a brief 1-2 sentence excerpt.
3. **Content**: Use the rich text editor for formatted copy, subheadings, code snippets, blockquotes, and inline images.
4. **Sidebar Settings**:
   - Select the **Author** and **Category**.
   - Add **Tags**.
   - Set **Status** to **Published**.
   - *(Optional)* Set a specific **Published At** date (if left blank, it automatically defaults to the current timestamp upon publishing).
5. **SEO Tab**:
   - Custom **Meta Title** (under 70 characters).
   - Custom **Meta Description** (under 160 characters).
   - Custom **OG Social Image** (defaults to featured image if omitted).
6. Click **Save** / **Publish**.

---

## 🔍 SEO & Indexing Architecture

This project is architected specifically for high search engine crawl efficiency:

1. **Initial HTML Pre-rendering**: All article content, heading tags, and links are present in the raw server response—no waiting for client-side bundle hydration.
2. **Schema.org Structured Data**: Each blog page injects a valid `BlogPosting` JSON-LD object containing publisher metadata, author details, timestamps, and article URLs.
3. **Live XML Sitemap**: Available at `/sitemap.xml`. Search engines fetch this to automatically discover new and updated blog posts.
4. **Robots Exclusion Standard**: Available at `/robots.txt`. Guides search bots to index `/` and `/blog/*` while shielding private `/admin/` and `/api/` endpoints.

---

## 🔄 Merging into the Main Organization Website

When you receive access to the organization's main Next.js repository, follow these steps to integrate the blog:

1. **Dependencies**: Add Payload and Supabase dependencies from `package.json` to the main repository.
2. **Configuration**: 
   - Wrap the main site's `next.config.ts` with `withPayload(nextConfig)`.
   - Copy `src/payload.config.ts` into the root or `src/` directory.
3. **Collections & Lib**:
   - Copy `src/collections/` into the main repo.
   - Copy `src/lib/payload.ts` and `src/components/RichText.tsx`.
4. **Routes**:
   - Copy `src/app/(payload)/` to embed the admin panel under `/admin`.
   - The public blog can remain at `/blog` or be mounted directly onto existing layouts by placing `blog/[slug]` inside the main app's routing tree.

---

## 🛠️ Available Scripts

### Generate 10 demo blogs

Point `DATABASE_URI` in `.env` at a **test database**, then run `npm run demo:blogs` from the repository root. This creates ten `[DEMO]` draft posts with sample rich text, SEO fields and local pixel covers, plus a demo author and category. It uses no AI APIs or credits. Run one instance at a time; running it again skips existing `demo-test-blog-*` posts. It refuses to run with `NODE_ENV=production`.

Find the drafts in **Payload Admin → Posts**. They are intentionally absent from the public blog until manually published; use only a local/test site for publication tests. Existing posts are not modified. Cover files are saved through Payload's configured media storage.

- `npm run dev` - Start local development server with Turbopack/Next.js
- `npm run build` - Compile and build the production bundle
- `npm run start` - Run the production server
- `npm run generate:types` - Compile TypeScript interfaces from Payload collections
- `npm run generate:importmap` - Regenerate Payload admin component import map

---

## 🤖 AI Blog Drafts with OpenRouter

Authenticated editors can generate a complete reviewable post from **Payload Admin → Posts**. The generator asks for a title, factual brief, keywords, audience, tone, author, and optional category.

The server then:

1. Sends the editorial brief to the configured GPT model through OpenRouter.
2. Requires structured JSON containing the article sections, SEO metadata, tags, alt text, and a separate image brief.
3. Builds a free, deterministic 1200×630 category scene from the article title, slug and service by default.
4. Renders the SVG template to PNG with Sharp and uploads it to the Payload `media` collection.
5. Saves the article, SEO fields, tags, author, category, and image as a **draft**.
6. Opens the Payload editor for fact checking and human approval. AI drafts are never published automatically.

### Create an OpenRouter API key

1. Sign in at [OpenRouter](https://openrouter.ai/).
2. Open the **Keys** page from your account settings and create a key for this application.
3. Give the key a clear name such as `material-mate-blog-production` and set a spending limit if the account supports one.
4. Add credits or configure billing before using paid models.
5. Copy the key once and store it only in the deployment or cloud environment's secret manager as `OPENROUTER_API_KEY`. Never put it in source control, screenshots, or client-side code.

Configure these variables:

```env
OPENROUTER_API_KEY=your-secret-key
OPENROUTER_TEXT_MODEL=openai/gpt-4.1-mini
# Free local vector cover generation is the default.
BLOG_IMAGE_MODE=vector
# Used only when BLOG_IMAGE_MODE=ai.
OPENROUTER_IMAGE_MODEL=qwen/qwen-image-2.1-turbo
```

### Free non-AI vector covers

The shared generator is `src/lib/ai-blog/vectorImage.ts`. It exports `createVectorCoverSVG({ title, slug, serviceCategory })` for editable SVG and `generateVectorImage(...)` for PNG bytes. Use `furniture`, `roofing` or `plumbing` for `serviceCategory`. Rich category palettes, warm lighting and decorative objects are rendered locally; the slug keeps colour selection repeatable.

Run `npm run export:covers` to export nine examples (three per category) as SVG and PNG, plus a contact sheet at `generated-covers/preview.png`. No API key, database or running server is needed. The export script is `scripts/export-vector-covers.ts`; edit its example titles to preview other topics. New drafts in Payload use this same generator automatically when `BLOG_IMAGE_MODE=vector` or `template`.

Generated articles now include a validated primary service: Furniture, Roofing or Plumbing. The generator saves the matching Payload category (creating it if absent). An existing service selected in the admin dropdown overrides the automatic classification; leave it on **Auto-detect from article** otherwise. Other existing categories and posts are preserved.

The default renderer creates detailed flat SVG illustrations without an image model. Furniture uses a furnished room and changes its centrepiece between a sofa, storage unit and table. Roofing uses a house scene and adds weather or an inspection ladder when relevant. Plumbing uses a fitted bathroom and changes between shower, pipework and basin details. The slug selects a repeatable category palette, and a small service badge keeps the system consistent.

`BLOG_IMAGE_MODE=vector` creates the SVG locally, renders it to a 1200×630 PNG with Sharp, uploads it to Payload Media, and assigns it as both the featured and Open Graph image. It has no image API or per-image charge. The article title stays in the page layout instead of being repeated inside the cover. `template` is accepted as a backwards-compatible alias for vector mode, so existing local `.env` files switch to the new renderer after pulling. Use `BLOG_IMAGE_MODE=pixel` only to retain the earlier pixel renderer. Existing uploaded covers are unchanged; newly generated drafts use the vector design.

Run `node --import tsx scripts/test-service-generation.ts` to test classification, category overrides, media/post linkage and rejection paths with simulated provider and database responses (no credits or database required).

Use `BLOG_IMAGE_MODE=none` for text-only drafts. Use `BLOG_IMAGE_MODE=ai` to opt into a configured Gemini or OpenRouter image model. Model identifiers, capabilities, and prices can change, so AI image modes should be treated as optional.

The API key is read only by the server-side Payload endpoint. Requests require an authenticated Payload user. OpenRouter errors are returned without exposing the key, generated files are limited to images up to 12 MB, and article content is constrained to a validated schema.

### Use Gemini for featured images

OpenRouter can remain the text provider while Gemini generates the image. Add an API key created in Google AI Studio:

```env
GEMINI_API_KEY=your-secret-google-ai-studio-key
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

When `GEMINI_API_KEY` is present, Gemini takes precedence over `OPENROUTER_IMAGE_MODEL`. The generator requests a 16:9 image, uploads the returned image bytes into Payload Media, and attaches that media record to the draft. `GOOGLE_API_KEY` is also accepted as an alternative key name. The configured Gemini model must support image output; a standard text or vision-input model cannot generate an image.

---

## 📄 License

Proprietary — SpeedAI Labs. All rights reserved.

