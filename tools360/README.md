# Tools360

Free online file tools that run **inside the visitor's browser**: merge, split, compress and rotate PDFs; PDF to JPG; images to PDF; PNG/JPG/WebP conversion; image compress, resize and crop; QR codes; Image to Base64.

## Folder map

```
tools360/
  public/                  <- the website (this is what you deploy)
    index.html  404.html  robots.txt  sitemap.xml
    tools/                 14 tool pages
    pages/                 about, contact, privacy, terms, cookies, report-abuse
    assets/
      css/                 variables, base, layout, components, tool-page, responsive
      js/
        main.js  ui.js  theme.js  config.js  analytics.js  cookie-consent.js  contact.js
        tool-core.js       shared engine used by every tool
        utils/             file-validator, format-size, download, dropzone, image, libs, errors
        tools/             one JS file per tool
      img/favicon.svg
  server/                  optional API (contact form, feedback, usage counts)
  database/                schema.sql, seed.sql
  netlify.toml             hosting settings and security headers
```

## 1. Run it on your computer

Browsers block JavaScript modules when you double-click a file, so use a tiny local server:

- **VS Code:** install the "Live Server" extension, right-click `public/index.html`, choose *Open with Live Server*.
- **Or in a terminal:** `cd public` then `npx serve`.

## 2. Before you go live (find and replace)

| Search for | Replace with |
|---|---|
| `https://tools360.example` | your real domain (in every page, `sitemap.xml`, `robots.txt`) |
| `support@tools360.example` | your real email (pages and `assets/js/config.js`) |
| `[add date]`, `[your name or company, address]`, `[your country or state]` | real details in `privacy.html` and `terms.html` |

Tip: in VS Code use *Edit > Replace in Files* (Ctrl+Shift+H). Have the legal pages reviewed for your country (India DPDP Act, GDPR if you serve Europe).

## 3. Deploy the website (free)

**Netlify (easiest):**
1. Put the project on GitHub (`git init`, commit, push).
2. On netlify.com choose *Add new site > Import from Git*, pick the repo. Netlify reads `netlify.toml`, and the publish folder is `public`.
3. Add your domain under *Domain management*. HTTPS is automatic.

Cloudflare Pages and Vercel work too: set the output folder to `public`, and copy the security headers from `netlify.toml`.

## 4. Optional backend (contact form, feedback, usage counts)

The site works fully without it (the contact form opens the visitor's email app instead).

1. Create a free PostgreSQL database (Supabase, Neon or Render).
2. Run `database/schema.sql` in its SQL editor.
3. `cd server`, copy `.env.example` to `.env`, fill in `DATABASE_URL`, `ALLOWED_ORIGINS` (your site URL) and `ADMIN_KEY`.
4. Test locally: `npm install` then `npm start`. Check `http://localhost:3000/health`.
5. Deploy `server/` on Render or Railway (build: `npm install`, start: `npm start`), and add the same environment variables there.
6. In `public/assets/js/config.js` set `API_BASE` to your API URL. In `netlify.toml` add that URL to `connect-src`.
7. See usage totals: `GET /api/stats/summary` with header `x-admin-key: <your ADMIN_KEY>`.

## 5. After launch

- Verify the site in Google Search Console and Bing Webmaster Tools, and submit `sitemap.xml`.
- Add Google Analytics by setting `GA_ID` in `config.js`. It only loads after the visitor accepts the cookie banner.
- Test every tool on your phone and in Chrome, Edge, Firefox and Safari.
- Only apply for ads (for example AdSense) once every page has real content and the legal pages are complete.
- Add an `og-image.png` (1200x630) and an `og:image` tag if you want rich link previews.

## Honest limits

- Everything is processed in the browser, so very large files depend on the visitor's device memory (limit set to 50 MB per file).
- **Compress PDF** re-renders pages as images, so text becomes non-selectable. Good for scans, not for text documents.
- Word/Excel/PowerPoint to PDF and PDF to Word need a server with LibreOffice and are **not** included.
- Libraries load from cdnjs. For extra safety add Subresource Integrity hashes, or copy the libraries into `assets/vendor/`.

## Open-source libraries used

| Library | License |
|---|---|
| pdf-lib 1.17.1 | MIT |
| PDF.js 3.11.174 | Apache-2.0 |
| JSZip 3.10.1 | MIT or GPL-3.0 (used under MIT) |
| qrcodejs 1.0.0 | MIT |
| Express, helmet, cors, express-rate-limit, pg, dotenv (server) | MIT / BSD |
| Inter, Plus Jakarta Sans fonts | SIL Open Font License |

Tools360 is not affiliated with any other file-tool website. All branding, text and code here are original.
