# varnanknair.me

Personal portfolio of **Varnan Kanjhinghat**: Python/Django software developer (Tesco Mobile) and freelance web designer in Reading, UK.

Live at **https://varnanknair.me**

Plain HTML, CSS and vanilla JavaScript. There is no build step and there are no dependencies, so it deploys straight to GitHub Pages.

## Project structure
```
varnanknair.me/
├── index.html            page content + SEO meta + JSON-LD structured data
├── 404.html              custom not-found page
├── CNAME                 custom domain for GitHub Pages
├── robots.txt            crawler rules
├── sitemap.xml           sitemap (with image entries)
├── site.webmanifest      PWA / home-screen metadata
├── serve.py              local preview server (serves 404.html like GitHub Pages)
├── work/ services/ skills/ ai/ experience/ about/ contact/
│                         tiny redirect pages so /work, /contact … open the right section
└── assets/
    ├── css/main.css      theme tokens (teal + copper), layout, components, responsive rules
    ├── js/main.js        preloader, nav, reveals, filters, skills "periodic table", copy-email
    └── img/
        ├── brand/        VK logo (master + web mark), favicon, apple-touch icon, OG share image
        ├── me/           personal photos (portrait, avatar, gallery)
        ├── work/         live-site screenshots of current projects (1200px JPG)
        └── archive/      artwork for earlier projects (themed via SVG duotone filter)
```

## Editing
- **Projects:** edit the `<article class="work">` blocks in `index.html`. Add screenshots to `assets/img/work/`.
- **Earlier projects:** edit the `<article class="arch">` blocks. Images go in `assets/img/archive/`, and the teal/copper duotone is applied automatically.
- **Skills:** edit the `SKILLS` array in `assets/js/main.js` (`[symbol, name, category, level, note, core?]`).
- **Colours:** edit the CSS variables at the top of `assets/css/main.css`.
- **SEO:** the `<head>` of `index.html` holds the meta tags and the JSON-LD (`Person`, `ProfilePage`, `ProfessionalService`).

## Clean URLs
Nav links point to `/work`, `/contact` and so on. `main.js` intercepts them, scrolls smoothly and updates the address bar with the History API, and the URL follows the section you're reading (the top of the page is plain `/`). Opening `/contact` directly loads `contact/index.html`, which redirects to `/?s=contact`; the page then scrolls there and restores `/contact`.

## Run locally
```
python3 serve.py
```
(`python3 -m http.server` works too, but it shows its own error page instead of `404.html`.)
Then open http://localhost:8000
