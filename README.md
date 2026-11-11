# UGC Portfolio

A static, animated portfolio site. No build step — plain HTML, CSS and JS.

## Editing your content

Everything on the site comes from **`content.js`**. Open it, change the text, save, refresh.

- Wrap words in `*asterisks*` to render them in the italic accent font.
- Set a field to `""` to hide it. Set `showRates: false` to remove the Rates section.
- To change the brand colour, edit `--accent` at the top of `styles.css`.

## Adding videos and photos

1. Put `.mp4` files in `assets/videos/` and images in `assets/images/`.
2. Point to them in `content.js`:

   ```js
   { title: "Morning routine", brand: "Lumen Skin", category: "Beauty",
     metric: "2.1M views", video: "assets/videos/lumen.mp4", poster: "assets/images/lumen.jpg" }
   ```

Vertical 9:16 video works best. Keep each file small (ideally under 10 MB — GitHub rejects files over 100 MB). To compress:

```sh
ffmpeg -i input.mov -vf "scale=720:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 128k output.mp4
```

A `poster` image is optional but makes the grid load faster. Until a video is added, a coloured placeholder is shown.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages

1. Create a new **public** repository on GitHub (name it `yourusername.github.io` for a clean URL, or anything else).
2. Push this folder:

   ```sh
   git init
   git add .
   git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/REPO.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.

The site goes live at `https://YOURUSERNAME.github.io/REPO/` within a minute or two.
