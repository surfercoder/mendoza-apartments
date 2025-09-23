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

- **Next.js App Router (v15)** with **React 19** and **TypeScript**.
- **Internationalization (next-intl)** with middleware-based locale detection and cookie persistence.
- **Supabase** integration for data (Postgres) and SSR-friendly session handling via `@supabase/ssr`.
- **UI/UX** with **Tailwind CSS v4** and **shadcn/ui** (Radix primitives). Dark mode via `next-themes`.
- **Forms & Validation** via `react-hook-form` and `zod`.
- **Icons** with `lucide-react`.
- **Testing** with **Jest** and **@testing-library/react**.
- **Strict linting** (eslint) and **type safety** (tsc).

## Tech Stack

- Framework: `next@15`, `react@19`, `react-dom@19`, TypeScript
- Styling: `tailwindcss@4`, shadcn/ui, Radix UI
- i18n: `next-intl`
- Data: `@supabase/supabase-js`, `@supabase/ssr`
- State/UI: `next-themes`, `lucide-react`, `date-fns`
- Forms: `react-hook-form`, `zod`
- Testing: `jest`, `@testing-library/react`, `@testing-library/jest-dom`
- Tooling: `eslint`, `tsc`

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

<!-- Original template README preserved below for reference -->
<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
