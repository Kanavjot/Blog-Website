const db = require('./db');
const cors = require("cors");
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/papers", (req, res) => {
  const papers = db.prepare("SELECT * FROM papers ORDER BY id DESC").all();
  res.json(papers);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


