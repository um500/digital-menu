# Garden Cafe — Standalone Sanity Studio

This folder is **only** for getting a shareable `*.sanity.studio` link.
It is completely separate from the main Next.js app — its own
`package.json`, its own `node_modules`, its own dependencies. Installing
anything here, or upgrading Node to run it, never touches the main app.

Day-to-day menu editing should still go through the main app's own admin
panel (`/admin/menu`), or the embedded Studio at `/studio` on the
deployed site. This standalone copy exists only so you have a plain link
you can open or share without going through the app at all.

## One-time setup

1. `cd sanity-studio`
2. `npm install`
3. Create a `.env` file here (plain text, same folder as this README)
   with:
   ```
   SANITY_STUDIO_PROJECT_ID=bfoijyut
   SANITY_STUDIO_DATASET=production
   ```
   These two values aren't secret — they're the same project ID/dataset
   already public in the main app's `NEXT_PUBLIC_SANITY_PROJECT_ID`/
   `DATASET`, and in the live site's own JS bundle. The real secret
   (`SANITY_API_WRITE_TOKEN`) is never needed in this folder — deploying
   the Studio uses the login from `sanity login`, not an API token.
4. **Requires Node.js 22.12 or newer** — this is a Sanity CLI
   requirement, unrelated to the main app (which runs fine on your
   current Node version). Run `node -v` to check; upgrade if needed.

## Deploy the hosted link

```
npx sanity login
npx sanity deploy
```

It'll ask for a studio hostname (e.g. `garden-cafe`) — the link will be
`https://garden-cafe.sanity.studio`. Re-run `npx sanity deploy` any time
you want to push an update to that hosted link.

## Keeping schemas in sync

`schemaTypes/` and `structure.ts` here are copies of
`/sanity/schemaTypes` and `/sanity/structure.ts` in the main app. If you
(or Claude) ever change a menu field there — add a field, rename
something — copy the same change here too, otherwise this standalone
Studio will drift out of sync with what the app actually uses.
