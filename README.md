# Yuuna Tachihara — Portfolio

React + Vite build of the portfolio designed on the design canvas. Each page is
made of the original desktop (1440px) and mobile (390px) boards; the markup and
CSS are kept as designed and scaled to the screen width.

## Pages

| Japanese | English | Content |
| --- | --- | --- |
| `/` | `/en` | Home — Hero (A), Selected Projects (C type), Footer 1 |
| `/about` | `/en/about` | About Me |
| `/works/muse` | `/en/works/muse` | MUSE case study |
| `/works/maplenest` | `/en/works/maplenest` | Maple Nest case study (team project; prototype videos in `public/assets/maplenest-*.mp4`) |

Each page's header menu has a link to the same page in the other language.
`/works/muse/ja` (the old Japanese case-study URL) still works.

Screens narrower than 768px get the mobile boards.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serves dist/
```

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel, **Add New → Project**, import the repository.
3. Framework preset: **Vite** (detected automatically). Build command `npm run build`, output directory `dist`.
4. Deploy. `vercel.json` already rewrites all routes to `index.html`, so links like `/about` work on refresh.

## Editing

- Page content lives in `src/boards/*.js` (HTML + CSS per board, desktop and mobile).
  English boards are the `*-en.js` files; a text change needs to be made in both languages.
- Images are in `public/assets/`.
- Routes are defined in `src/App.jsx`.
