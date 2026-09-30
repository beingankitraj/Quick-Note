const express = require("express");
const fs = require("fs/promises");
const { randomUUID } = require("node:crypto");
const path = require("path");
const { put, get } = require("@vercel/blob");

const router = express.Router();

const LOCAL_FILE = path.join(__dirname, "..", "data", "notes.json");
const BLOB_PATH = "quick-note/notes.json";

async function readLocalNotes() {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalNotes(notes) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(notes, null, 2), "utf8");
}

async function readNotes() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return readLocalNotes();
  }

  const result = await get(BLOB_PATH, {
    access: "private",
    useCache: false
  });

  if (!result) return [];

  if (result.statusCode !== 200 || !result.stream) {
    return [];
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text);
}

async function writeNotes(notes) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return writeLocalNotes(notes);
  }

  await put(BLOB_PATH, JSON.stringify(notes, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}

function validateText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    return `${field} is required`;
  }
  if (value.trim().length > 5000) {
    return `${field} must be 5000 characters or less`;
  }
  return null;
}

// GET /api/notes
router.get("/notes", async (req, res) => {
  try {
    const notes = await readNotes();
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load notes" });
  }
});

// POST /api/notes
router.post("/notes", async (req, res) => {
  try {
    const titleError = validateText(req.body.title, "Title");
    const contentError = validateText(req.body.content, "Content");

    if (titleError || contentError) {
      return res.status(400).json({
        error: titleError || contentError
      });
    }

    const notes = await readNotes();

    const note = {
      id: randomUUID(),
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      createdAt: new Date().toISOString()
    };

    notes.push(note);
    await writeNotes(notes);

    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// DELETE /api/notes/:id
router.delete("/notes/:id", async (req, res) => {
  try {
    const notes = await readNotes();
    const index = notes.findIndex((note) => note.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Note not found" });
    }

    const [deleted] = notes.splice(index, 1);
    await writeNotes(notes);

    res.json({ message: "Note deleted", note: deleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

module.exports = router;