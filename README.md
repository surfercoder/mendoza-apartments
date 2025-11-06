# Mendoza Apartments

Discover and manage beautiful apartment listings in Mendoza, Argentina. The project showcases a modern, production-ready Next.js application with internationalization, typed data access with Supabase, and a clean UI built with Tailwind CSS and shadcn/ui.

—

## Live Site

- https://mendoza-apartments.vercel.app/

## What this site is for

- Public site for browsing apartments, searching availability, and initiating booking requests.
- Admin area for managing apartment listings and availability.
- Localized UX in Spanish (default) and English with a language switcher.

## Highlights & Features

- **Next.js App Router (v16)** with **React 19** and **TypeScript**.
- **Internationalization (next-intl)** with middleware-based locale detection and cookie persistence.
- **Supabase** integration for data (Postgres) and SSR-friendly session handling via `@supabase/ssr`.
- **UI/UX** with **Tailwind CSS v4** and **shadcn/ui** (Radix primitives). Dark mode via `next-themes`.
- **Forms & Validation** via `react-hook-form` and `zod`.
- **Icons** with `lucide-react`.
- **Testing** with **Jest** and **@testing-library/react**.
- **Strict linting** (ESLint 9 flat config) and **type safety** (tsc).

## Tech Stack

- Framework: `next@16`, `react@19`, `react-dom@19`, TypeScript
- Styling: `tailwindcss@4`, shadcn/ui, Radix UI
- i18n: `next-intl`
- Data: `@supabase/supabase-js`, `@supabase/ssr`
- State/UI: `next-themes`, `lucide-react`, `date-fns`
- Forms: `react-hook-form`, `zod`
- Testing: `jest`, `@testing-library/react`, `@testing-library/jest-dom`
- Tooling: `eslint` (v9 flat config), `tsc`

## Architecture

- `src/app/`
  - `layout.tsx`: Root layout. Determines locale from `NEXT_LOCALE` cookie (Spanish fallback) and injects `RootProviders`.
  - `page.tsx`: Public landing page, search and listing UI (Client Component) using translations from `next-intl`.
  - `auth/*`: Auth-related pages.
  - `admin/page.tsx`: Admin dashboard for managing apartments.
- `middleware.ts`:
  - Composes two concerns: Supabase session sync (`updateSession`) and next-intl routing.
  - Ensures `NEXT_LOCALE` cookie defaults to `es` for first-time visitors.
  - Merges cookies from Supabase into the outgoing response safely by setting each cookie individually.
- `src/components/`
  - Reusable UI components including `language-switcher.tsx` (uses emoji flags 🇦🇷/🇺🇸), `apartment-card.tsx`, forms, etc.
  - `root-providers.tsx` wires `NextIntlClientProvider` and `ThemeProvider`.
- `src/lib/supabase/`
  - `server.ts`: Creates a server-side Supabase client with SSR-compatible cookie adapter.
  - `middleware.ts`: Supabase helper used by the global middleware to keep sessions in sync.
  - `apartments.ts`: Data access helpers for listings and availability.
- `src/i18n/`
  - `routing.ts`: next-intl routing (locales: `en`, `es`; default: `es`; `localePrefix: 'as-needed'`).
  - `request.ts`: Server config that selects `messages/<locale>.json` based on cookie.
- `messages/`
  - `en.json`, `es.json`: Translation catalogs.

### Data model (at a glance)

- `apartments`: core apartment listings with attributes like title, description, images, price per night, capacity, etc.
- `apartment_availability`: date ranges and availability metadata for each apartment.

## Best Practices Followed

- **App Router + Server Components** where possible; **Client Components** only where interactivity is required (e.g., forms, search UI).
- **Cookie handling** compatible with Edge/Node runtimes; avoid non-existent APIs like `cookies.setAll` on responses; merge cookies one-by-one.
- **i18n cookie** (`NEXT_LOCALE`) persisted on client selection and defaulted to Spanish in middleware.
- **Type safety** end-to-end with TypeScript and `zod` for forms.
- **Separation of concerns**: data access lives under `src/lib/supabase/`, UI under `src/components/`, cross-cutting concerns in `middleware.ts`.
- **Production-safe builds**: use `next build` for production; `--turbopack` only for dev (script retained).

## Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Local Development

```
npm install
npm run dev
```

Open http://localhost:3000

## Production build & start

```
npm run build
npm run start
```

If port 3000 is busy, start on another port: `next start -p 3001`.

## Testing

- Unit/integration tests: Jest + Testing Library

```
npm run test
npm run test:watch
npm run test:ci
```

## Scripts

- `npm run dev` – start dev server (Turbopack)
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint with eslint
- `npm run type-check` – TypeScript checks
- `npm run test*` – run tests

## Deployment

- Hosted on **Vercel**. Push to the default branch triggers a deploy.
- Ensure the Supabase env vars are configured in Vercel Project Settings.

## Credits

- Built with Next.js, next-intl, Tailwind CSS, shadcn/ui, and Supabase.
- Inspired by best practices from Vercel and Supabase community examples.

---