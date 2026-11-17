# Contributing

## Branches and pull requests

Work on a branch off `main` named after the kind of change: `feat/`, `fix/`, `docs/`, `ci/` or `chore/`, followed by a short name. Open a pull request and fill in the template's sections.

Pull requests land as **merge commits**, so every commit on the branch stays in `main`'s history. Before asking for review, make sure each commit is clean and follows the format below: no "wip" or "fix typo" commits.

The pull request title follows the same commit format and is at most **44 characters**. It becomes the merge commit's subject with ` (#123)` appended, and the result has to stay within 50.

`main` only changes through pull requests, and a pull request can merge once CI passes. The first commits, which built the app, are the one exception: an empty repository has no `main` to open a pull request against.

## Dependency updates

Dependabot opens one pull request a month for minor and patch bumps and one for each major bump. It opens security fixes right away for GitHub Actions, but it can't for Bun packages. Shorten its title to 44 characters before merging if it runs over. Its commits keep GitHub's own message format, the one exception to the rules below.

Two majors are held back in `.github/dependabot.yml`, each with its reason next to it: VueUse stays on the major Reka UI uses, and TypeScript stays on 6 until typescript-eslint accepts 7.

GitHub's security alerts only see the packages listed in `package.json`, because its dependency graph doesn't read `bun.lock`. CI runs `bun audit` on the whole lockfile for every pull request and once a week, and fails on a high or critical advisory. When it does, `bun update` moves the packages you list. To refresh the ones underneath them too, delete `bun.lock`, run `bun install`, then run the checks below.

New releases have to age before they come in. Dependabot waits a week before proposing one, and `bunfig.toml` keeps installs from taking a version less than three days old. Most malicious releases are pulled within that time. To take an urgent fix sooner, run `bun add <package> --minimum-release-age=0`.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org):

```
type(scope): summary in the imperative

Optional body: what changed and why, wrapped at 72 characters.

Refs: #12
```

- **Subject:** at most 50 characters, imperative ("add", not "added"), lowercase after the colon, no full stop.
- **Body:** optional, after a blank line, with lines of at most 72 characters. Explain why, not how.
- **Types:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`.
- **Scopes** (optional): `domain`, `mocks`, `ui`, `app`, `orders`, `dashboard`, `hotels`, `auth`, `simulator`, `deps`.
- **Breaking changes:** add `!` after the type (`feat(orders)!: …`) and a `BREAKING CHANGE:` footer.

Examples:

```
fix(orders): keep trailing space while searching
build(deps): bump vite to 8.2
docs: explain the hotel switcher
```

The repo's VS Code settings flag a subject over 50 characters or a body line over 72 while you type.

## Code conventions

The short version; [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) has the reasoning.

- A component is one `PascalCase.vue` file with a multi-word name, written as `<script setup lang="ts">` followed by `<template>`. Everything else is a `kebab-case.ts` file, and a composable's file starts with `use-`.
- Props and events are declared with types: `defineProps<{ … }>()` and `defineEmits<{ … }>()`.
- Business rules go in `src/domain` with a test. Components don't call `fetch`; they use a feature's `queries.ts` or `mutations.ts`.
- `src/components/ui` holds the shadcn-vue primitives. Add one with `bunx shadcn-vue@latest add <name>`, then give it the theme's classes.
- Comments explain why, not what.

## Tests

`bun run test` runs the whole suite once, and `bun run test:watch` re-runs the tests a change touches. Use `bun run test`, not `bun test`: the tests run on Vitest, which compiles `.vue` files, and Bun's own runner can't.

A test file sits next to what it tests and is named `<file>.test.ts`. Component tests find elements the way a person would, by role and label, through Vue Testing Library.

## Screenshots

The README images in `docs/images/` are captures of the production build, served locally. Retake them when the UI they show changes, with Playwright's CLI driving your installed Chrome. Nothing gets added to the project.

Build and serve the app:

```bash
bun run build && bun run preview   # http://localhost:4173
```

Save this outside the repo, for example as `/tmp/roomflow-state.json`. It signs you in and turns off the automatic orders, so no toast lands in a shot:

```json
{
  "cookies": [],
  "origins": [
    {
      "origin": "http://localhost:4173",
      "localStorage": [
        {
          "name": "roomflow.session",
          "value": "{\"email\":\"staff@roomflow.example\"}"
        },
        { "name": "roomflow.demo-settings", "value": "{\"autoOrders\":false}" }
      ]
    }
  ]
}
```

Then take each image from the repo root:

```bash
bunx playwright@1.64.1 screenshot --channel chrome \
  --load-storage /tmp/roomflow-state.json --wait-for-timeout 3000 \
  --device "Desktop Chrome HiDPI" --viewport-size "1280, 800" \
  --color-scheme light \
  http://localhost:4173/hotels/harborline \
  docs/images/dashboard-light.jpg
```

| File                  | Path                                | Change to the command above                     |
| --------------------- | ----------------------------------- | ----------------------------------------------- |
| `dashboard-light.jpg` | `/hotels/harborline`                | none                                            |
| `dashboard-dark.jpg`  | `/hotels/harborline`                | `--color-scheme dark`                           |
| `order-drawer.jpg`    | `/hotels/harborline/orders/HL-1311` | none                                            |
| `mobile.jpg`          | `/hotels/harborline/orders`         | `--device "Pixel 7" --viewport-size "412, 720"` |

`public/og.jpg` is the 1280×640 card that link previews show. It's a designed card built around the light dashboard shot, and the same file is the repository's social preview (Settings → General → Social preview). Upload it there again whenever it changes.

## Before pushing

Run the same checks CI runs:

```bash
bun run format:check && bun run lint && bun run spell && bun run typecheck && bun run test && bun run build && bun audit --audit-level=high
```
