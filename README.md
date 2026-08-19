# Calibrate labelling job sign-up

A one-page site where an annotator picks their name and a task, and gets a
labelling job assigned to them in Calibrate.

- `index.html` is the whole app. No framework, no build step.
- `config.js` holds one thing: the address of the proxy below.
- `api/` is a small proxy that runs on Vercel. It holds the API key and the
  Calibrate addresses, so none of them appear in this repository or in the
  published page.
- `check.js` checks the proxy's list of allowed calls. Run `node check.js`.

## Why the proxy exists

A page served from `agency-fund.github.io` is not on Calibrate's list of
allowed page addresses, so browsers refuse to make the call. The proxy is not
a browser, so it can call Calibrate freely, and it allows this page.

The proxy will only pass on five calls: read annotators, add an annotator,
read tasks, read one task, and create a job. Everything else is refused.

## Settings

All three live on the server, never in this repository.

| Name | What it is |
|---|---|
| `CALIBRATE_API_KEY` | An API key from the Calibrate you are pointing at. |
| `CALIBRATE_API_URL` | The Calibrate **API** address. Not the web app: those are two different addresses and two different ports when running locally. |
| `CALIBRATE_APP_URL` | The Calibrate **web app** address, where annotators label. The app adds `/annotate-job/` and the job's token. |

The page asks the proxy for the labelling address when it loads, so the
address is never published in the page itself.

## Trying it on your own machine first

Write the three settings into `.env`, then start it. Nothing is deployed by
this.

```bash
npx vercel dev
```

`vercel dev` runs the proxy in `api/` and serves the page together on
`http://localhost:3000`. The name of the file matters: `vercel dev` reads
`.env` and ignores `.env.local`. The page notices it is running on localhost
and talks to the proxy at the same address, so `config.js` does not need
editing yet.

Open the address it prints. Both dropdowns should fill in. Pick a name, pick a
task, press the button, then open the "Start labelling" link and check the
task's items are there.

To check the proxy on its own:

```bash
curl -s http://localhost:3000/api/annotators
```

Your annotators come back as text.

- `Not set on the server` names the settings you have missed.
- `Could not reach Calibrate` means `CALIBRATE_API_URL` points at something
  that is not the Calibrate API, most often the web app.
- `Invalid or revoked API key` means the key is not from the Calibrate that
  `CALIBRATE_API_URL` points at. A key made on one Calibrate never works on
  another.

## Setting it up for real

**1. Deploy the proxy.** In Vercel: Add New, then Project, then import this
repository. Framework preset "Other". Before deploying, add the three settings
under Environment Variables, ticked for all environments. Deploy, and copy the
address it gives you.

**2. Put that address in `config.js`**, replacing `REPLACE-ME` and keeping the
`/api` on the end. Commit and push.

**3. Turn on GitHub Pages.** Repository Settings, then Pages. Source: Deploy
from a branch. Branch `main`, folder `/ (root)`. Save.

The site is then at
`https://agency-fund.github.io/calibrate-l3-labelling-job/`.

## Notes

- If someone picks a name that already has a job for that task, they get the
  link to that same job. A second job is never created.
- Typing a name that already exists selects the existing annotator instead of
  failing.
- Every item in the task is assigned, so all annotators label the same set.
- Anyone who finds the proxy address can make those five calls without a key.
  At worst that means junk annotators or jobs. Nothing can be read beyond
  annotators and tasks, and nothing can be deleted.
- The existing-job check reads the task itself, because reading a task's job
  list on its own needs a signed-in user, while reading the task does not.
