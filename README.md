# GiftLink

Personalised, interactive surprise pages sold as one shareable link. Eight gifts ready:
Diwali, Birthday, Love notes, Proposal, Best friend, Anniversary, Apology, Photo puzzle.
The buyer fills a short form on their phone, watches a free preview, pays ₹199 by UPI/card, and gets a
private link to send on WhatsApp. The recipient opens a little animated experience made just for them.

> "GiftLink" is a placeholder name. Rename it in `src/config/site.ts`.

## Stack

| Part | Choice | Why |
| --- | --- | --- |
| Language | **TypeScript** (front and back end) | One language everywhere, shared validation |
| Framework | **Next.js 16** (App Router, React 19) | Pages + API in one app, great link previews (OG images) |
| Styling / motion | Tailwind CSS 4, Motion, canvas-confetti | Smooth mobile animations |
| Database | SQLite via **libSQL + Drizzle ORM** | Zero setup locally; Turso in production (same code) |
| Photos | Local disk, or **Cloudflare R2** | Photos are resized and EXIF/GPS stripped with `sharp` |
| Payments | **Razorpay** (UPI, cards, netbanking) | Order + signature check + webhook backup |
| Music | Web Audio synth (no licensed tracks needed) | See `src/templates/shared/audio.ts` |

## Run it locally

```bash
npm install
npm run setup      # creates .env.local and the local database
npm run dev        # http://localhost:3000
```

Payments start in **mock mode** (`PAYMENT_MODE=mock`): a fake checkout dialog, no money moves.

**If `npm run dev` fails with "OS file watch limit reached":** your editor and other apps have used up
Linux's file-watcher slots. Raise the limit once:

```bash
echo -e "fs.inotify.max_user_watches=524288\nfs.inotify.max_user_instances=512" | sudo tee /etc/sysctl.d/60-inotify.conf
sudo sysctl --system
```

## How it works

```
/                       landing page (occasions, how it works, FAQ)
/demo/<occasion>        full demo with sample data
/create/<occasion>      the wizard: steps → free preview → pay
/ready/<code>           after payment: link, WhatsApp share, "have they opened it?"
/g/<code>               what the recipient opens (private, noindex, auto-expires)

POST /api/upload                  photo → resized WebP, EXIF stripped
POST /api/gifts                   validate + save draft gift → { slug, ownerToken }
POST /api/checkout                create Razorpay order (amount set by the server)
POST /api/checkout/verify         verify Razorpay signature → gift goes live for 90 days
POST /api/webhooks/razorpay       backup: unlocks the gift even if the buyer's browser closed
POST /api/gifts/<code>/events     recipient opened / finished / said yes
GET  /api/gifts/<code>            status for the maker (needs x-owner-token)
GET  /api/cron/cleanup            deletes expired gifts, stale drafts, orphan photos
```

Nothing is shown at `/g/<code>` until it is paid. The maker's browser keeps a secret owner token, so only
they see the stats. Their own visits are not counted as opens.

## Add a new occasion

Each gift lives in `src/templates/<id>/`:

| File | What it is |
| --- | --- |
| `definition.ts` | zod schema, wizard steps (fields), card theme, categories, demo data |
| `art.tsx` | backgrounds and illustrations shared by the cover and the experience |
| `Cover.tsx` | the static opening screen: gallery cards, hero phone (must render on the server) |
| `Experience.tsx` | what the recipient plays through |

Then register it in `src/templates/registry.ts` (order = order on the home page), `experiences.tsx` and `covers.tsx`.
The wizard, live preview, validation, payment and sharing all work automatically from the definition.

Rules inside experiences: size things with `cqw`/`cqh` (never `vw`/`vh` or `position: fixed`), so the same
gift works full-screen and inside the builder's phone preview; use the `fx` prop for confetti and `synth` for sound;
use `seeded()` instead of `Math.random()` while rendering. Shared building blocks are in `src/templates/shared/`
(`PhotoStack`, `LetterReveal`, `Countdown`, `FloatingHearts`, `Scene`, `StageButton`).

## Going live

1. **Razorpay**: create an account and finish KYC (it needs the Contact, Terms, Privacy, Refund and
   Delivery pages, which are already at `/contact`, `/terms`, ... Edit the placeholder text). Then set
   `PAYMENT_MODE=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. In Razorpay → Webhooks, add
   `https://yourdomain/api/webhooks/razorpay` with events `payment.captured` and `order.paid`, and put
   its secret in `RAZORPAY_WEBHOOK_SECRET`. Test with Razorpay *test* keys first.
2. **Hosting**: either
   - **Vercel**: use Turso for the database (`DATABASE_URL=libsql://…`, `DATABASE_AUTH_TOKEN`, then
     `npm run db:push`) and R2 for photos (`STORAGE_DRIVER=r2` + `R2_*`). `vercel.json` already runs the
     daily cleanup; set `CRON_SECRET`.
   - **A VPS** (any ₹400/month server): keep SQLite + local photos, run `npm run build && npm start`
     behind nginx/Caddy, and call the cleanup daily from crontab:
     `curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain/api/cron/cleanup`.
3. Set `NEXT_PUBLIC_SITE_URL` to your real domain (used in link previews).
4. Change the support email/WhatsApp in `src/config/site.ts`.

## Notes and limits

- The rate limiter is in memory (fine for one server). With several servers, move it to Redis.
- Photo URLs are unguessable but public to anyone who has them, the same as the gift link.
- The music is synthesised. For real songs, add licensed MP3s and play them with `<audio>`.
