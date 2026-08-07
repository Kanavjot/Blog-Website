require("dotenv").config();
console.log("URL:", process.env.DATABASE_URL);
const {Pool} = require("pg");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});

pool.query("SELECT NOW()")
.then((res) => console.log("Connected. Server time:", res.rows[0]))
.catch((err) => console.error("Connection failed:",err));
