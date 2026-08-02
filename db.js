console.log("db.js is running, cwd is:", process.cwd());


const Database = require("better-sqlite3");
const db = new Database("papers.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    tags TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    summary TEXT NOT NULL,
    read_time TEXT NOT NULL,
    date TEXT NOT NULL,
    link TEXT NOT NULL
  )
`);

const count  =  db.prepare("SELECT COUNT(*) AS total FROM papers").get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO papers (title, tags, difficulty, summary, read_time, date, link)
    VALUES (@title, @tags, @difficulty, @summary, @read_time, @date, @link)
  `);
  insert.run({
    title: "Attention Is All You Need",
    summary: "Breaking down Vaswani et al., 2017. The paper that introduced transformer architecture to the world",
    date: "2026-07-18",
    read_time: "3 min read",
    difficulty: "intermediate",
    tags: "ml, nlp, transformers",
    link:"index.html"
  });
  insert.run({
    title: "Why the double slit experiment can break intuition",
    summary: "A walkthrough of wave-particle duality in quantum mechanics. Exploring the implications of quantum behavior and the measurement problem.",
    date: "",
    read_time: "",
    difficulty: "beginner",
    tags: "physics, quantum",
    link: ""
  });

  insert.run({
    title: "CRISPR-Cas9: A Revolutionary Gene Editing Tool",
    summary: "An overview of the CRISPR-Cas9 gene editing technology and its applications in biotechnology.",
    date: "",
    read_time: "",
    difficulty: "advanced",
    tags: "biotech, genetics",
    link: ""
  });
}

console.log("finished database setup");
  module.exports = db; 
