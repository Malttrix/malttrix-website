# Malttrix | 梦萃 Website

Static Malttrix homepage prepared for GitHub and Vercel, with Firebase configuration for future application services.

Live site: https://malttrix-website.vercel.app/

## Connect GitHub

```bash
gh auth login
gh repo create malttrix-website --private --source=. --remote=origin --push
```

## Connect Vercel

Import the GitHub repository in Vercel, or run:

```bash
npx vercel login
npx vercel link
npx vercel deploy
```

Vercel reads `vercel.json` and publishes the root `index.html`.

## Connect Firebase

Create a Firebase project, copy `.firebaserc.example` to `.firebaserc`, and replace the placeholder with the project ID. Then run:

```bash
npx firebase-tools login
npx firebase-tools use YOUR_FIREBASE_PROJECT_ID
npx firebase-tools deploy --only firestore
```

Firebase project `malttrix-website` is initialized in `firebase-config.js` for future Authentication and Firestore features. Hosting remains on Vercel.

## V11 homepage revision

Includes a warm glass header (original header logo retained), authored 3D
hummingbird geometry with a matching SVG fallback, selective scroll parallax,
Maxon's desktop/mobile portraits, restored founder heading, and the supplied
footer logo with its gold signature. The redundant footer CTA is removed.

Static deployment: publish the repository root, or run `node scripts/build.mjs`
and publish `dist`. No npm install is required. Keep `assets/` with `index.html`.

Validation completed: JavaScript syntax, local assets and anchor targets,
unique IDs, EN/ZH founder translations, unchanged header markup, retained footer
navigation, and matching fallback geometry generation.

V11 is published from the private GitHub repository to Vercel. Source and
asset-path validation passed, and Vercel reported a successful production
deployment. Full visual QA of real WebGL playback should still cover desktop,
mobile, reduced-motion, language switching, navigation and portrait crops.
