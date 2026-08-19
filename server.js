require('dotenv').config();
const db = require('./db');
const cors= require("cors");
const express = require('express');
const {createClient} = require('@supabase/supabase-js');
const jwt = require("jsonwebtoken");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {auth: {persistSession:false}}
);



/* old functions


function getUserId (req) {
  
  const authhead = req.headers.authorization || ""
  console.log("Auth Header:", authhead ? "Header is there" : "Header is not there");
  
  const token = authhead.replace("Bearer ", "");

 

  console.log("JWT Secret:" , process.env.SUPABASE_JWT_SECRET ? "Secret is loaded" : "Secret is undefined");

  const pd = jwt.verify(token ,process.env.SUPABASE_JWT_SECRET);
  return pd.sub;
} 



function requireReader(req , res ,next) {
  try {
    req.userId = getUserId(req);
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({error:"Not logged in"});
  }
}
async function requireAdmin(req ,res , next) {
  try{
    const userId = getUserId(req);
    const {rows} =await db.query("SELECT role FROM profiles WHERE id = $1" , [userId]);
    if (rows[0]?.role !== "admin") return res.status(403).json({error: "Admin only"});
    req.userId = userId;
    next();
  } catch (err) {
    console.error("err.message");
    res.status(401).json({error: "Not logged in"});
  }
}

*/

/* new (debug) functions */

async function getUserId(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  
  if (!token) {
    throw new Error("No Token")
  }



  const {data: {user}, error} = await supabase.auth.getUser(token);

  if(error ||!user){
    throw new Error(error?.message || "Invalid or expired token");
  }
  return user.id
}



async function requireReader(req, res,next) {
  try {
    req.userId = await getUserId(req);
    next();

  } catch (err) { 
    console.error("Auth failed", err.message)
    res.status(401).json({error: "Not logged in"});
  }
}





async function requireAdmin(req,res , next) {
  try {
    const userId = await getUserId(req);
    const {rows} = await db.query("SELECT role FROM profiles WHERE id = $1", [userId]);
    const role = rows[0]?.role ? rows[0].role.trim() : "";
    if (role !== "admin") {
      return res.status(403).json({error: "Admin only"});
    }

    req.userId = userId;
    next();
  } catch (err) {
    console.error("Admin auth failed", err.message);
    res.status(401).json({error: "Not logged in"})
  }
}



//profiles


app.post("/api/ensure-profile" , requireReader , async(req , res) => {
    const name = req.body?.displayName || "";
    await db.query(`INSERT INTO profiles (id, display_name) VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET display_name = COALESCE(NULLIF($2, ''), )`, [req.userId , name]);

    res.json({success :true});
});

app.get("/api/is-admin" , requireReader , async(req, res) => {
  const { rows } = await db.query("SELECT role FROM profiles WHERE id = $1", [req.userId]);
  const role = rows[0]?.role ? rows[0].role.trim() : "";
  res.json({ isAdmin: role === "admin" });

});



/* papers*/

app.get("/api/papers", async(req,res) => {
  try{
    const result = await db.query("SELECT * FROM papers ORDER BY id DESC");
    res.json(result.rows);
  }catch(err) {
    console.error("GET /api/papers error:", err);
    res.status(500).json({error: "Database error"}); 
  }
})

app.get("/api/papers/:id" , async(req, res) => {
  try {
    const {rows} = await db.query("SELECT * FROM papers WHERE id = $1" , [req.params.id]);
    if (rows.length === 0) return res.status(404).json({error: "Paper not found"});
    await db.query("UPDATE papers SET views = views + 1 WHERE id = $1",[req.params.id]);
    res.json(rows[0]);
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Database Error"});
  }
});


app.put("/api/papers/:id", requireAdmin, async(req, res) => {
  const { title, tags,difficulty, summary ,read_time,date , content_html ,citations, published} = req.body;
  if(!title || !title.trim()) return res.status(400).json({error: "Title is required"});

  try {
    const {rows} = await db.query(`UPDATE papers SET title=$1 , tag=$2 , difficulty=$3 , summary=$4 , read_time=$5, date=$6, content_html=$7, citations=$8 ,publlications=$9 WHERE id =$10 RETURNING *`,
      [title.trim(), tags.trim(), difficulty, summary || "" ,read_time || "", date || "", content_html || "",  citations || "" ,  published !== false, req.params.id] 
    );
    if (!rows.length) return res.status(404).json({error:"Couldn't find the paper"});
      res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error:"Couldn't update paper"})
  }
})

app.post("/api/papers", requireAdmin, async(req, res) => {
  const{title, tags, difficulty , summary , read_time, date , link, content_html , citations} = req.body;
  if (!title || !title.trim()) return res.status(400).json({error: "Title is required"});
  if(!tags || !tags.trim()) return res.status(400).json({error : "Tags are required"})
  if(!["beginner", "intermediate", "advanced"].includes(difficulty)) {
    return res.status(400).json({error: "Invalid Difficulty"});
  }

  try{
    const query = `INSERT INTO papers (title, tags, difficulty , summary, read_time , date , link , content_html, citations)
    VALUES ($1, $2, $3 , $4 , $5 , $6 , $7 , $8 , $9)
    RETURNING *`;

    const values = [
      title.trim(),
      tags.trim(),
      difficulty,
      summary ? summary.trim() : "",
      read_time ? read_time.trim() : "",
      date ? date.trim() : "",
      link ? link.trim() : "",
      content_html || "",
      citations ? citations.trim() : ""
    ];

    

    const {rows} = await db.query(query, values);
    res.status(201).json(rows[0])
  } catch(err){
    console.error(err);
    res.status(500).json({error: "Failed to create paper"});
  }
});

app.delete("/api/papers/:id" ,requireAdmin,  async(req,res) => {
  try{
    const {rows} = await db.query("DELETE FROM papers WHERE id = $1 RETURNING *" , [req.params.id]);
    if (rows.length === 0) return res.status(404).json({error:"Paper not found"});
    res.json ({success:true, deleted:rows[0]});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Couldn't delete paper"});
  }
});


/*bookmarking routes*/



app.get("/api/bookmarks" , requireReader, async(req , res) => {
  try {
    const {rows} = await db.query(
      `SELECT p.*FROM bookmarks b JOIN papers p ON b.paper_id = p.id WHERE b.user_id = $1 ORDER BY b.created_at DESC`, 
      [req.userId]
    );
    res.json(rows)
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Couldn't get your bookmarks"})
  }
});

app.post("/api/bookmarks" ,requireReader , async(req , res) => {
  const {paper_id} = req.body;
  try {
    await db.query(
      `INSERT INTO bookmarks (user_id , paper_id) VALUES ($1 , $2) ON CONFLICT DO NOTHING`,
      [req.userId, paper_id]
    );
    res.status(201).json({success:true});
  } catch (err){
    res.status(500).json({error: "Failed to bookmark"})
  }
});

app.delete("/api/bookmarks/:paperId",requireReader, async (req, res) => {
  await db.query(`DELETE FROM bookmarks WHERE user_id= $1 AND paper_id =$2`, [req.userId, req.params.paperId]);
  res.json({success:true});
});

/* notes' routes*/

app.get("/api/notes",requireReader, async(req,res) => {
  const {rows} = await db.query(
    `SELECT n.*, p.title AS paper_title FROM notes n LEFT JOIN papers p ON n.paper_id = p.id WHERE n.user_id = $1 ORDER BY n.created_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

app.post("/api/notes" , requireReader, async(req, res) => {
  const {paper_id , content} = req.body;
  if (!content || !content.trim()) 
    return res.status(400).json({error:"Note can't be empty"});

  const {rows} = await db.query(`INSERT INTO notes (user_id,paper_id,content) VALUES ($1 , $2,$3) RETURNING *` , [req.userId , paper_id || null, content.trim()]);
  res.status(201).json(rows[0])
});

app.delete("/api/notes/:id",requireReader,async(req,res) => {
  await db.query(`DELETE FROM notes WHERE id = $1 and user_id = $2`, [req.params.id,req.userId]);
  res.json({success: true});
});

app.get("/api/preferences", requireReader,async(req,res) => {
  const {rows} = await db.query(`SELECT * FROM preferences WHERE user_id = $1` , [req.userId]);
  res.json(rows[0] || {topics: ""});
});

app.put("/api/preferences", requireReader, async(req, res) => {
  const {topics} = req.body;
  await db.query(
    `INSERT INTO preferences (user_id,topics) VALUES ($1 , $2)
    ON CONFLICT (user_id) DO UPDATE SET topics = $2`,
    [req.userId, topics || ""]
  );
  res.json({success:true});
});

/* admin dash stats */
app.get("/api/admin/stats" , requireAdmin , async(req ,res) => {
    const papers = await db.query("SELECT COUNT(*) FROM papers");
    const byDiff = await db.query("SELECT difficulty, COUNT(*) FROM papers GROUP BY difficulty");
    const readers = await db.query("SELECT COUNT(*) FROM profiles WHERE role = 'reader'");
    const bookmarks = await db.query("SELECT COUNT(*) FROM bookmarks");
    const notes = await db.query("SELECT COUNT(*) FROM notes");
    const topPapers = await db.query ("SELECT title, views FROM papers ORDER BY views DESC LIMIT 5");

    res.json({
      totalPapers: parseInt(papers.rows[0].count),
      byDifficulty: byDiff.rows,
      totalReaders: parseInt(readers.rows[0].count),
      totalBookmarks : parseInt(bookmarks.rows[0].count),
      totalNotes: parseInt(notes.rows[0].count),
      topPapers: topPapers.rows
    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})



