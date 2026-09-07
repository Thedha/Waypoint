# Waypoint

A self-contained goal + checkpoint tracker. No build step, no external services —
just static HTML/CSS/JS. Data is saved in your phone's browser storage (localStorage),
so it stays on that one device only.

## Deploy to GitHub Pages

1. Create a new **public** repo on GitHub (Pages on the free plan requires the repo
   to be public — see the note on privacy below).
2. Upload all the files in this folder to the repo root (`index.html`, `styles.css`,
   `app.js`, `manifest.json`, `sw.js`, and the `icons/` folder), keeping the folder
   structure intact.
3. In the repo, go to **Settings → Pages**, and under "Build and deployment" set
   **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. GitHub will give you a URL like `https://yourusername.github.io/your-repo-name/`.
   It can take a minute to go live.

## Installing it on your phone

Open the GitHub Pages URL in your phone's browser, then:
- **iPhone (Safari):** tap the Share icon → "Add to Home Screen".
- **Android (Chrome):** tap the ⋮ menu → "Add to Home screen" / "Install app".

It'll open full-screen, without the browser address bar, like a regular app.

## A note on privacy

GitHub Pages URLs are public — anyone with the link can open the page, even though
the repo itself isn't listed anywhere for people to stumble onto. Since your goal
data never leaves your phone (it's not sent to any server, just saved in the
browser), the only thing a stranger could do with the link is see the empty app
shell, not your data. If you want a real access gate rather than just an
unguessable URL, consider hosting on **Cloudflare Pages** instead and turning on
**Cloudflare Access** to restrict the domain to your email address (free tier
covers this).

## If you ever want it to sync across devices

This version deliberately has no backend — that's what makes it a five-file static
site. If you later want your data to follow you between your phone and a laptop,
that needs a small database with your own login (e.g. Supabase or Firebase), which
is a bigger change from this version. Happy to help with that if you get there.
