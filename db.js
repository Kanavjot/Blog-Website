require("dotenv").config();
const{ Pool } = require("pg");

const pool = new Pool({
  connectionString:process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

console.log("Setting up database")

async function setup() {

//await pool.query("DROP TABLE IF EXISTS papers;"); Use if u gotta delete and re setup db

  await pool.query(`
    CREATE TABLE IF NOT EXISTS papers(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    tags TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    summary TEXT NOT NULL,
    read_time TEXT NOT NULL,
    date TEXT NOT NULL,
    link TEXT NOT NULL
    )`);

    await pool.query(`ALTER TABLE papers ADD COLUMN IF NOT EXISTS content_html TEXT DEFAULT ''`);

    await pool.query(
      `CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, paper_id))`
    );

   await pool.query(`
    CREATE TABLE IF NOT EXISTS notes(
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
      )`
    );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS preferences(
    user_id TEXT PRIMARY KEY,
    topics TEXT DEFAULT '')`
  );

    const {rows} = await pool.query("SELECT COUNT(*) AS total FROM papers");
    const count = parseInt(rows[0].total, 10);

    if (count === 0) {
      await pool.query(
        `INSERT INTO papers (title, tags, difficulty , summary , read_time, date , link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ["Attention Is All You Need", "ml,nlp,transformers" , "intermediate" , "Breaking down Vaswani et al.., 2017. That paper that introduced transformer architecture to the world.", "3 min read", "2026-07-18", "attention-is-all-you-need.html"]
      );
      await pool.query(
        `INSERT INTO papers ( title, tags, difficulty, summary, read_time, date, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ["Why the double slit experiment can break intuition", "physics, quantum" , "beginner","A walkthrough of wave-particle duality in quantam mechanics and the measurement problem.","","",""]
      );

      await pool.query(
        `INSERT INTO papers(title, tags, difficulty, summary, read_time, date, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ["CRISPR- Cas9: A revolutionary Gene Editing Tool", "biotech, genetics", "advanced", "An overview of the CRISPR-Cas9 gene editing techology and its applications in biotechnology", "", "", ""]
      );

    }
}

setup().catch(console.error);
module.exports = pool;