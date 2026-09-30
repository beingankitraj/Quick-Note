# Quick Note

A single-page full-stack CRUD note-taking application built with:

- Node.js
- Express
- HTML/CSS/JavaScript
- REST API
- `fetch()` asynchronous frontend requests
- Vercel Blob for persistent production storage
- Local JSON storage for local development
- No MongoDB

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/health` | Health check |

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Without a Vercel Blob environment variable, the app automatically uses `data/notes.json`.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Create a Vercel Blob store from the Vercel project dashboard.
4. Connect the Blob store to this project so Vercel provides the Blob credentials.
5. Deploy.

The production app uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is available. This avoids relying on Vercel's ephemeral serverless filesystem for persistent notes.

## Important

The local JSON file is intentionally only a local-development fallback. On Vercel, use Vercel Blob for persistence.

## Project structure

```text
quick-note/
├── api/
│   └── notes.js
├── data/
│   └── notes.json
├── app.js
├── index.html
├── package.json
├── server.js
├── styles.css
├── vercel.json
├── .gitignore
└── README.md
```
