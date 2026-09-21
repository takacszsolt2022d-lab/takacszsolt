import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import 'mysql2/promise';
import mysql from "mysql2/promise";



const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Books API!");
});


const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}


app.get("/api/books", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM books");
        res.json({ data: rows, count: rows.length });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Failed to fetch books" });
    }
});


app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);

        if (rows.length === 0) {
            console.log('>>> A tömb üres, nem található ilyen könyv.');
            return res.status(404).json({ error: 'book not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const pool = mysql.createPool(poolConfig);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


