# Iridium docs

Source for the Iridium documentation site. Markdown in `content/` is built to static HTML in
`dist/` by a small script (`scripts/build.mjs`, one dependency: `marked`).

```sh
npm ci
npm run build   # writes dist/
npm test        # every nav page builds, no broken links between pages
```

## Editing

- Add or edit a page in `content/`, then list it in `NAV` in `scripts/build.mjs`.
- `config-*`, `transport-*` and `utils-api` are copies of each package's own `docs/` folder.
  Update them from the package repos when those change; they are the reference of record.
- Raw HTML in Markdown is escaped on purpose.

## Deploying to Vercel

Either of these works; pick one.

**Vercel's GitHub integration (simplest).** Import this repo in Vercel. `vercel.json` already sets
the build command and output directory, so there is nothing else to configure. Every push to `main`
deploys to production and every pull request gets a preview.

**GitHub Actions.** `.github/workflows/deploy.yml` deploys with the Vercel CLI. It does nothing
until these repository secrets exist (Settings → Secrets and variables → Actions):

| Secret              | Where to find it                                                  |
| ------------------- | ----------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel → Account Settings → Tokens                                |
| `VERCEL_ORG_ID`     | `orgId` in `.vercel/project.json` after running `npx vercel link` |
| `VERCEL_PROJECT_ID` | `projectId` in the same file                                      |

Do not use both at once, or every push deploys twice.

This site needs no environment variables. If you add any, set them in the Vercel project
(Settings → Environment Variables); the CLI workflow pulls them with `vercel pull`.

## License

MIT
