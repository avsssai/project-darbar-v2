# Local tooling recovery

Run these steps in a normal macOS Terminal in this project. They address the failures observed in the agent environment; authentication and browser execution can still differ between Terminal and a restricted agent session.

## GitHub CLI

Check authentication first:

```sh
gh auth status
```

If that fails, authenticate through the browser and check again:

```sh
gh auth login --hostname github.com --web
gh auth status
```

If Terminal succeeds but the agent still reports invalid credentials, the session may not have access to the macOS credential store. Fix the host/session permissions or connection rather than pasting tokens into chat. The agent's report alone does not establish that a stored token has expired.

Reference: [GitHub CLI authentication](https://cli.github.com/manual/gh_auth_login).

## Packages and browser

Rolldown, Satteri, the Astro compiler, and Lightning CSS had native binaries replaced by iCloud placeholders. Their exact versions were restored from the local pnpm cache with SHA-512 integrity checks, and `pnpm build` passed. Keep this project downloaded in Finder to prevent the binaries from being evicted again. Keep `pnpm-lock.yaml`; this project uses pnpm.

If the problem returns, choose **Download Now** for the project in Finder, or **Keep Downloaded** if that option is available, then run:

```sh
cd /Users/avsivaseshasai/Desktop/code2/project-darbar-astro
pnpm install --force --frozen-lockfile
pnpm add -D playwright
pnpm exec playwright install chromium
pnpm build
```

The Playwright installation changes `package.json` and the lockfile; review and commit those changes on the working branch. A system Chrome installation does not supply the matching Chromium binary used by `chromium.launch()` in this project's scripts.

In one Terminal, start the site:

```sh
pnpm dev
```

In another Terminal in this project, run:

```sh
node scripts/verify-hero.mjs
node scripts/verify-showcase.mjs
```

Reference: [Playwright browser installation](https://playwright.dev/docs/browsers).

## Agent execution permissions

Chrome launch failed with macOS sandbox permission errors. Installing packages does not remove that execution restriction. The app/host must permit browser execution and the needed network access; this cannot be granted through `AGENTS.md`. In the observed session, sandbox escalation requests were automatically rejected. Use the app's available project permission controls; an organization-managed policy may require its administrator to make the change.

Reference: [OpenAI permission controls](https://learn.chatgpt.com/docs/permissions).
