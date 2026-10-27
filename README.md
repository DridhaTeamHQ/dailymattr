# dailymattr — website

The dailymattr marketing site, `/news` and News Studio, built with
**Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui**.
It replaces the Vite site in `../dailymattr`: the design, URLs and SEO output
are the same.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run start
npm run typecheck
```

Environment: `.env.local` (see `.env.example`). Browser-side keys use the
`NEXT_PUBLIC_` prefix; server keys (`PIX_*`, `SUPPORT_*`, `NEWS_STUDIO_*`) never
reach the browser. Set the same names in the Vercel project. `next build`
prerenders `/news/`, so the `PIX_*` variables (or the local snapshot) must be
available at build time.

## Layout

```
src/
  app/
    layout.tsx            one root layout for the whole site (next/font, GA guard)
    globals.css           Tailwind v4 theme: dailymattr + News Studio tokens, shadcn tokens
    (site)/               marketing pages — shared SiteNav, film grain, Google Analytics
      page.tsx            homepage
      about/ author/… editorialguidelines/ privacypolicy/ termsandconditions/
      newsletter/ support/
    unsubscribe/          outside (site): no nav, never loads Google Analytics
    news/                 /news — server components, generateMetadata, ISR
    news-studio/          News Studio — server-rendered, then live in the browser
    studio-sitemaps/      /news-studio/sitemap*.xml (rewritten here by next.config.ts)
    download/route.ts     /download — 302 to the right store by User-Agent
    not-found.tsx
  components/
    ui/                   shadcn primitives (accordion, select, input, textarea, …)
    site/                 SiteNav, SiteFooter, pill buttons, grain, GA guard
    home/ legal/ news/ studio/ support/ newsletter/ unsubscribe/
    seo/json-ld.tsx
  lib/                    typed shared code (site constants, slugs, categories,
                          text, JSON-LD schema, cache policy, page metadata)
    news/ studio/ support/
  styles/                 per-area keyframes only (home, legal, forms, news, studio)
  proxy.ts                301s / 410s pages can't send (delegates to lib/news, lib/studio)
```

## How it's built

- **One root layout.** Moving between any two pages (marketing, `/news`,
  News Studio) is an in-app navigation; the nav stays mounted.
- **Styling.** Everything is Tailwind utilities. The theme (`globals.css`)
  holds the design tokens: `ink`, `ink-soft`, `coal`, `mist`, `brand`, `lm-*`,
  `rounded-panel`, `h-nav`, … Breakpoints keep the original cut-offs:
  `mobile:` is `max-width: 900px`, `desktop:` is `min-width: 901px`,
  `phone:` is `max-width: 640px`; one-offs are written as
  `[@media(max-width:380px)]:`. The `hover:` variant is plain `:hover`, as
  the old CSS was. Use `text-[15px]`, not `text-sm` — named sizes also set
  line-height. Merge conflicting class lists with `cn()`, never by string
  concatenation.
- **Fonts** are self-hosted by `next/font` (Be Vietnam Pro, Playfair Display,
  Roboto).
- **shadcn/ui** is used where it matches the design: the FAQ accordion, the
  support form's topic select and inputs. The News Studio drawers stay custom.
- **Homepage choreography** (GSAP + ScrollTrigger + Lenis, baked phone
  sequences) runs in `useGSAP` and tears everything down when you leave the
  page. The intro curtain plays only on the first page of a visit.
- **Forms.** The support form posts to a Server Action
  (`lib/support/actions.ts`) with the original validation, honeypot and
  per-IP throttle.
- **/news.** Server components with `generateMetadata`; feeds revalidate
  every 2 minutes, articles hourly, date filters per request. Sitemaps and
  `latest.json` are route handlers. `proxy.ts` sends the 301s (stale slugs,
  trailing slashes) and the 410 for withdrawn stories.
- **News Studio.** Story, topic and feed pages are server-rendered with real
  data (ISR), then stay live in the browser (polling, infinite scroll,
  drawers). It never loads Google Analytics.
- **Analytics.** The Google tag loads on the marketing pages and `/news`;
  `GaGuard` turns it off for `/news-studio` and `/unsubscribe` after an
  in-app navigation.

## Checks

```bash
npm run smoke:news                                         # /news modules + SEO payload
node scripts/smoke-news.mjs --base=http://localhost:3000   # the same against a running server
npm run check:pagination                                   # /news query ordering
OLD=https://www.dailymattr.com NEW=http://localhost:3000 npm run compare:seo -- / /about/ /news/ /news-studio/
```

`compare:seo` diffs title, meta, canonical, icons, JSON-LD, H1 and redirect
status between two hosts. Run it against a preview deployment before
switching the domain.

## Known differences from the Vite site

- 404 pages return `404` + `noindex`; Next 16 draws their title and text in
  the browser.
- JSON-LD is rendered in `<body>` (same content).
- News Studio pages are server-rendered with the real interface instead of a
  hidden crawlable list; the feed's H1 is the on-screen "NewsStudio." mark.
- Local images go through `next/image` (WebP, responsive sizes).
- `/api/support` is gone (the form uses a Server Action), and the offline
  three.js capture rig (`?capture=1`) was dropped — the baked phone images in
  `public/assets/` are unchanged.
