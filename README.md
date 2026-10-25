# My Digital Library — Personal & Public Knowledge Hub

A responsive Next.js foundation for a personal writing studio and public reading catalog.

## Current milestone

This repository contains the **Stage 1 foundation**:
- Responsive desktop/mobile dashboard and navigation
- Navy-and-gold scholarly visual system
- Portrait upload preview placeholder (no portrait has been supplied yet)
- Search across works created in the current page session
- Create-work modal and document-selection UI
- Theme toggle and PWA manifest/icon starter
- Initial PostgreSQL schema draft for the core library data model

**Important:** This is not yet a production library. Authentication, durable database writes, cloud file storage, rich-text editing, role enforcement, publication access controls, and deployment are not connected. The current create-work interaction is a UI preview and resets on refresh.

## Recommended implementation path

- Frontend: Next.js App Router + TypeScript
- Database: PostgreSQL (managed provider)
- Authentication: Auth.js or a managed auth provider
- Rich-text editor: TipTap
- Private file storage: private object storage with short-lived signed URLs
- Search: PostgreSQL full-text search
- Hosting: Vercel
- Version control: GitHub

Do not expose service-role credentials in browser code. Configure the initial owner role server-side; never grant admin based only on a self-entered email address.

## Requirements

- Node.js 20.9+
- npm
- Git and a GitHub account
- A hosting account when ready to deploy
- A PostgreSQL provider and authentication/storage providers for later stages

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Build check:

```bash
npm run build
```

## GitHub setup

1. Create a new empty repository named `my-digital-library` on GitHub.
2. Extract this project folder.
3. From the project folder run:

```bash
git init
git add .
git commit -m "Build My Digital Library foundation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/my-digital-library.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Do not commit `.env.local` or real secrets.

## Environment configuration

Copy `.env.example` to `.env.local` when configuring providers. Fill values only in your local environment or hosting provider's encrypted environment-variable settings. Never share secrets in chat or commit them.

## Database migration

`migrations/001_initial_schema.sql` is an initial PostgreSQL schema draft. Review it for your chosen provider and configure server-side authorization policies before connecting the app. Do not expose the database directly to an untrusted browser client.

## Portrait and branding

The dashboard includes a marked portrait placeholder. Uploading a portrait currently changes only the browser preview and is not persisted. Once storage and settings are implemented, the portrait will be saved securely and reused for the profile, hero, logo, and icon. The app intentionally does not invent a portrait.

## Planned stages

1. Foundation and responsive dashboard — included in this starter.
2. Authentication, PostgreSQL connection, server-side roles, and access-control tests.
3. My Works: TipTap editor, autosave, uploads, revisions, drafts, and publication states.
4. Public catalog: metadata, legal-source links, search, and filters.
5. Reader, bookmarks, lists, progress, and private notes.
6. Branding/admin settings and persisted portrait.
7. Security, accessibility, functional tests, backups, and error handling.
8. GitHub-to-host deployment and production verification.

## Security and copyright

- Private works must be authorized server-side before returning content or files.
- Store private files in private buckets; use short-lived signed URLs after authorization.
- Validate MIME type, file extension, file size, and content where possible.
- Use public-domain, open-access, licensed, or otherwise authorized content. For other copyrighted books, store metadata and a legitimate source link rather than an unauthorized copy.
- Add audit logs and backup/restore procedures before production use.
