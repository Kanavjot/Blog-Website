const db = require('./db');
const cors = require("cors");
const express = require('express');
const session = require('express-session');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 1000 * 60 * 60 * 4} // 4 hrs
}));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(401).json({error: "Not logged in"});
  }
}

app.get("/api/papers/:id" , async(req, res) => {
  try {
    const {rows} = await db.query("SELECT * FROM papers WHERE id = $1" , [req.params.id]);
    if (rows.length === 0) return res.status(404).json({error: "Paper not found"});
    res.json(rows[0]);
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Databse Error"});
  }
});

/* login routes*/

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

/*papers' routes*/

app.get("/api/papers", async(req,res) => {
  try{
    const result = await db.query("SELECT * FROM papers ORDER BY id DESC");
    res.json(result.rows);
  }catch(err) {
    console.error("GET /api/papers error:", err);
    res.status(500).json({error: "Database error"}); 
  }
})


app.post("/api/papers", requireLogin, async(req, res) => {
  const{title, tags, difficulty , summary , read_time, date , link, content_html} = req.body;
  if (!title || !title.trim()) return res.status(400).json({error: "Title is required"});
  if(!tags || !tags.trim()) return res.status(400).json({error : "Tags are required"})
  if(!["beginner", "intermediate", "advanced"].includes(difficulty)) {
    return res.status(400).json({error: "Invalid Difficulty"});
  }

  try{
    const query = `INSERT INTO papers (title, tags, difficulty , summary, read_time , date , link , content_html)
    VALUES ($1, $2, $3 , $4 , $5 , $6 , $7 , $8)
    RETURNING *`;

    const values = [
      title.trim(),
      tags.trim(),
      difficulty,
      summary ? summary.trim() : "",
      read_time ? read_time.trim() : "",
      date ? date.trim() : "",
      link ? link.trim() : "",
      content_html || ""
    ];

    const {rows} = await db.query(query, values);
    res.status(201).json(rows[0])
  } catch(err){
    console.error(err);
    res.status(500).json({error: "Failed to create paper"});
  }
});

app.delete("/api/papers/:id" , requireLogin, async(req,res) => {
  try{
    const {rows} = await db.query("DELETE FROM papers WHERE id = $1 RETURNING *", [req.params.id]);
    if (rows.length === 0){
      return res.status(404).json({error : "Paper not found"});
    }
  res.json({success : true , deleted : rows[0]});
  } catch(err) {
    console.error(err);
    res.status(500).json({error: "Failed to delete paper"});
  }
});

/*bookmarking routes*/

const jwt = require("jsonwebtoken");
function requireReader(req , res ,next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer" , "");

  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.userId = payload.sub; // the reader's unique supabase user id
    next();
  } catch(err) {
    res.status(401).json({error : "Not logged in"});
  }
}

app.get("/api/bookmarks" , requireReader, async(req , res) => {
  const {rows} = await db.query(
    `SELECT p.* FROM bookmarks b JOIN papers p ON b.paper_id =p.id WHERE b.user_id =$1 ORDER BY b.created_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

app.post("/api/bookmarks" ,requireReader , async(req , res) => {
  const {paper_id} = req.body;
  try {
    await db.query(
      `INSERT INTO bookmarks (user_id , paper_id) VALUES ($1 , $2) ON CONFLICT DO NOTHING`
      [req.userId, paper_id]
    );
    res.status(201).json({success:true});
  } catch (err){
    res.status(500).json({error: "Failed to bookmark"})
  }
});

app.delete("/api/bookmarks:paperId",requireReader, async (req, res) => {
  await db.query(`DELETE FROM bookmarks WHERE user_id= $1 AND paper_id =$2`, [req.userId, req.params.paperId]);
  res.json({success:true});
});

/* notes' routes*/

app.get("/api/notes",requireReader, async(req,res) => {
  const {rows} = await db.query(
    `INSERT INTO preferences (user_id , topics) VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET topics =$2`,
    [req.userId , topics || ""]
  );
  res.json({success:true})
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{
  console.log(`Server running on port ${PORT}`);
})



