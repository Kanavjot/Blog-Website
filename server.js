const db = require('./db');
const cors = require("cors");
const express = require('express');
const session = require('express-session');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use(session({
  secret: 'smth-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 1000 * 60 * 60 * 4} // 4 hrs
}));

const ADMIN_PASSWORD = "Vanak@12345";
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(401).json({error: "Not logged in"});
  }
}

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Wrong password" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get("/api/session-check", (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn });
});


app.get("/api/papers", (req, res) => {
  const papers = db.prepare("SELECT * FROM papers ORDER BY id DESC").all();
  res.json(papers);
});

app.post("/api/papers", requireLogin, (req, res) => {
  const{title,tags,difficulty,summary,read_time,date,link} = req.body;

  if(!title|| !title.trim()){
    return res.status(400).json({ error: "Title is required" });
  }
  if(!tags|| !tags.trim()){
    return res.status(400).json({ error: "Tags are required" });
  }
  if(!["beginner","intermediate","advanced"].includes(difficulty)){
    return res.status(400).json({ error: "Difficulty must be one of: beginner, intermediate, advanced" });
  }

  const insert = db.prepare(`
    INSERT INTO papers (title, tags, difficulty, summary, read_time, date, link)
    VALUES (@title, @tags, @difficulty, @summary, @read_time, @date, @link)
  `);

  const result = insert.run({
    title:title.trim(),
    tags:tags.trim(),
    difficulty,
    summary:summary? summary.trim():"",
    read_time:read_time? read_time.trim():"",
    date:date? date.trim():"",
    link:link? link.trim():""


  })

  const newPaper = db.prepare("SELECT * FROM papers WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(newPaper);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


