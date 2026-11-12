# Design C handoff — Hero + About Me

Portfolio of Yuuna Tachihara (UX/UI designer). This folder contains design C
("Halftone Menu") for two screens, each at desktop (1440px) and mobile (390px).

## What's in this folder

| File | What it is |
| --- | --- |
| `html/hero-C-desktop-1440.html` | Home hero, desktop. Fixed 1440 × 900 artboard. |
| `html/hero-C-mobile-390.html` | Home hero, mobile. Fixed 390 × 1380 artboard. |
| `html/about-C-desktop-1440.html` | About Me page, desktop. 1440 × 5280. |
| `html/about-C-mobile-390.html` | About Me page, mobile. 390 × 5420. |
| `screenshots/*.png` | Full-page renders of the four files above (rendered without web fonts, so type looks plainer than the real design). |

The HTML files are the **source of truth** for layout, colors, spacing and copy.
They open directly in a browser (they load Google Fonts). Everything is inline
styles plus a small `<style>` block — no build step, no images to download.

## Design tokens

**Colors**

| Token | Hex | Used for |
| --- | --- | --- |
| background-pink | `#F9CBD8` | Page background |
| ink-maroon | `#5E1714` | Headings, nav, buttons, main text |
| ink-dark | `#3A1210` | Body text on paper |
| tomato | `#D93A2B` | Halftone tomato, vertical katakana, accents |
| tomato-shadow | `#9E2318` | Dark halftone on the tomato |
| heart-red | `#C0301F` | ♥ marks on the receipt |
| paper | `#FFF9F4` | Price tag / cards |
| receipt | `#FBF8F2` | Receipt paper |
| cream | `#F6EFC4` | Star sticker, tape |
| cream-line | `#E2D38E` | Star outline |
| leaf-light / leaf-dark | `#B7D9A2` / `#3E7D3A` | Dotted tomato calyx |
| kraft | `#EBDAB9` | Kraft-paper cards (About) |

**Typography** (Google Fonts)

- `Dela Gothic One` — display: "YUUNA", "タチハラ・ユウナ" (vertical), page titles.
- `DotGothic16` — everything else (body, nav, labels, receipt).
- Hero sizes (desktop → mobile): name 212px → 90px; vertical katakana 90px → 44px; intro 19px → 16px; nav 17px → 15px.

**Signature elements**

- Halftone tomato: `radial-gradient(circle, <color> 0 47%, transparent 49%)` on a 12px grid (9px on mobile), clipped to a circle.
- Receipt: zig-zag bottom edge via `clip-path: polygon(...)` (pre-computed in the HTML), dashed separators, dotted leaders, CSS barcode (`repeating-linear-gradient`).
- Price tag: rotated −5° card with a punched hole and a hard offset shadow `0 16px 0 -6px rgba(94,23,20,.22)`.
- Puffy star sticker, rotated 14°.
- About page: dashed blue "selection frames" with corner handles and labels (e.g. "Skills — 3 categories") are **intentional decoration** (design-tool look), not leftovers.

## Content notes

- Nav: ホーム → `/`, 私について → `/about`. 作品を見る → `#works`.
- Receipt "TODAY'S SPECIALS": 01 MUSE → MUSE case study; 02 MAPLE NEST → (no page yet, keep as placeholder link).
- Email: `yuuna.tatihara@gmail.com` (mailto).
- About page photo slots ("Your photo / 写真を追加", café photos) are placeholders — keep them as placeholders until real photos are provided.
- Copy is final unless marked with [ ].

## Prompt for Claude Code

Copy this into Claude Code from the root of the portfolio project:

```
Implement design C for the Home hero and the About Me page.
The design files are in ./yuuna-design-C (read HANDOFF.md first, then the
four HTML files in ./yuuna-design-C/html — they are the source of truth).

Requirements:
- Match the HTML designs exactly: copy, colors, fonts (Dela Gothic One,
  DotGothic16), sizes, rotations, shadows and decorative elements.
- Use the 1440px file for desktop and the 390px file for mobile; switch
  at 768px. Between breakpoints, scale the layout proportionally so it
  never overflows horizontally.
- Rebuild as components (e.g. Hero, Receipt, PriceTag, HalftoneTomato,
  StarSticker, AboutHeader, Skills, Journey, BeyondDesign, Footer) with
  shared design tokens as CSS variables. Keep absolute positioning only
  where the design is a collage; use normal flow elsewhere.
- Wire the nav links (/, /about), 作品を見る (#works), the MUSE receipt
  line to the MUSE case study route, and mailto links.
- Keep placeholders (photo slots, Maple Nest link) as they are.
- Make sure `npm run build` passes, then compare each screen side by side
  with the HTML file at 1440px and 390px and fix any differences.
```
