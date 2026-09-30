const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const notesApi = require("./api/notes");
app.use("/api", notesApi);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "quick-note" });
});

app.get("/{*splat}", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Quick Note running at http://localhost:${PORT}`);
  });
}

module.exports = app;