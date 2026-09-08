# Malttrix | 梦萃 Website

Static Malttrix homepage prepared for GitHub and Vercel, with Firebase configuration for future application services.

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

Firebase is reserved for future Authentication and Firestore features. Hosting remains on Vercel.
