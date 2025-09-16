# chai site

Static site for chai.

## Project structure

- `chai/`
  - `index.html` (entry)
  - `style.css` (global styles – includes merged case-studies v2 styles)
  - `hero.css`, `case-studies.css` (base styling)
  - `Images/` (assets)
  - `main.js` (scroll rail, services/about word fill, menu)
- `vercel.json` (routing + caching config)

## Local preview

Open `chai/index.html` in a browser via a local server (recommended):

- VS Code Live Server, or
- `npx http-server .` and open `http://localhost:8080/chai/`

## Deploy to Vercel

1. Push to GitHub (already connected): `https://github.com/CamDog38/chai`
2. In Vercel, create a new project from this repo.
3. Framework preset: "Other" (static).
4. Build & Output Settings:
   - Build Command: (leave empty)
   - Output Directory: `/` (repo root)
5. Environment: none required.
6. Deploy.

### Clean URLs and caching

`vercel.json` adds:
- Clean URLs (no `.html`).
- Rewrites so `/` → `chai/index.html` and any path `/x` → `chai/x`.
- Long-term caching for `/Images/*`, `*.css`, and `*.js`.

## Notes

- The app expects to live at `/chai/` under the domain root. The rewrites map root requests accordingly.
- If you move files out of `chai/`, update `vercel.json` and links.
- If you add new asset folders, extend caching rules in `vercel.json`.
