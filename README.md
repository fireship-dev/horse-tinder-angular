# HorseTinder

Find your stable relationship.

A small working AngularJS 1.5.8 app with horse profiles, discovery filters,
likes, passes, mutual matches, and browser-local persistence. Photos and the
vendored AngularJS runtime come from the existing Fireship legacy app.

## Run

Requires Node.js 22.13 or newer and pnpm 11.1.1.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:5173. Use `PORT=5174 pnpm dev` for another port.

```sh
pnpm test
pnpm build
pnpm preview
```

The build copies the self-contained app into `dist/`. All runtime assets are
local. The development server uses Node's standard library.

## Application

- Discover profiles by distance and breed, then choose Pass, Super like, or Like.
- One super like is available per local calendar day. It counts as a like for
  matching. Resetting discovery does not restore a super like already used today.
- Profiles that super liked the current horse show a star in the deck.
- A match is created only when a liked profile also likes the current horse.
- Decisions survive reloads in localStorage. Reset discovery clears them.
- Profiles and reciprocal likes are fictional fixture data, not live users.
- There is no authentication, remote database, messaging, or external API.

## Structure

- `js/profiles.js`: horse fixtures and reciprocal likes.
- `js/matching.js`: discovery, input validation, decisions, and mutual matches.
- `js/services.js`: AngularJS service and browser storage boundary.
- `js/controllers.js`: discovery and matches UI.
- `index.html` and `css/style.css`: responsive application interface.
- `tests/`: behavior tests using Node's test runner.

The browser framework intentionally remains AngularJS. Node scripts replace
the old Gulp/Bower toolchain so this small legacy app runs on current machines.

Photo credits and dependency notices: [CREDITS.md](CREDITS.md).
