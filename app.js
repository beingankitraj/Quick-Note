const form = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesContainer = document.getElementById("notes");
const emptyState = document.getElementById("emptyState");
const noteCount = document.getElementById("noteCount");
const status = document.getElementById("status");
const saveButton = document.getElementById("saveButton");
const refreshButton = document.getElementById("refreshButton");
const template = document.getElementById("noteTemplate");

function setStatus(message) {
  status.textContent = message;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function renderNotes(notes) {
  notesContainer.innerHTML = "";
  noteCount.textContent = notes.length;
  emptyState.classList.toggle("hidden", notes.length > 0);

  for (const note of notes) {
    const element = template.content.cloneNode(true);
    element.querySelector(".note-title").textContent = note.title;
    element.querySelector(".note-content").textContent = note.content;
    element.querySelector(".note-date").textContent = formatDate(note.createdAt);

    element.querySelector(".delete-button").addEventListener("click", () => {
      deleteNote(note.id);
    });

    notesContainer.appendChild(element);
  }
}

async function loadNotes() {
  setStatus("Loading...");
  try {
    const response = await fetch("/api/notes");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load notes");
    }

    renderNotes(data);
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return;

  saveButton.disabled = true;
  setStatus("Saving...");

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to create note");
    }

    form.reset();
    await loadNotes();
    titleInput.focus();
    setStatus("Note saved");
    setTimeout(() => setStatus(""), 1200);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteNote(id) {
  setStatus("Deleting...");

  try {
    const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to delete note");
    }

    await loadNotes();
    setStatus("Note deleted");
    setTimeout(() => setStatus(""), 1200);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

form.addEventListener("submit", createNote);
refreshButton.addEventListener("click", loadNotes);

loadNotes();