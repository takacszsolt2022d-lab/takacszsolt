import express from 'express';
import 'dotenv/config';
import mysql from 'mysql2/promise';


const PORT = process.env.PORT || 3000;


const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5175');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());

const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}


const pool = mysql.createPool(poolConfig);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});



app.get('/api/termekek', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM termekek'); 
        res.json(rows);
    } catch (error) {
        console.error('Error fetching termekek:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/termekek/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM termekek WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Termék nem található' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching termekek:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.post('/api/termekek', async (req, res) => {
    const { nev, ar, keszlet } = req.body;

    if (!nev || !ar || !keszlet) {
        return res.status(400).json({ error: 'Bad request: A név, ár és készlet megadása kötelező!' });
    }

    try {
        const [result] = await pool.query('INSERT INTO termekek (nev, ar, keszlet) VALUES (?, ?, ?)', [nev, ar, keszlet]);

        res.status(201).json({
            id: result.insertId,
            nev,
            ar,
            keszlet
        });
    }
    catch (error) {
        console.error('Error creating termekek:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.put('/api/termekek/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { nev, ar, keszlet } = req.body;

    if (!nev || !ar || !keszlet) {
        return res.status(400).json({ error: 'Bad request: A név, ár és készlet megadása kötelező!' });
    }
    try {
        const [result] = await pool.query('UPDATE termekek SET nev = ?, ar = ?, keszlet = ? WHERE id = ?', [nev, ar, keszlet, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Termék nem található' });
            }
            res.status(200).json({ message: 'Termék adatai sikeresen frissítve' });
        }
        catch (error) {
            console.error('Error updating termekek:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
});




app.get('/api/vevok/:id/rendelesek', async (req, res) => {
  const { id } = req.params;
  try {
    const [vevoCheck] = await pool.query('SELECT * FROM vevok WHERE id = ?', [id]);
    if (vevoCheck.length === 0) {
      return res.status(404).json({ error: 'A vevő nem található.' });
    }
    const query = `
      SELECT 
        rendelesek.*, 
        termekek.nev AS termek_neve, 
        termekek.ar AS termek_ara
      FROM rendelesek
      JOIN termekek ON rendelesek.termek_id = termekek.id
      WHERE rendelesek.vevo_id = ?
    `;
    const [rendelesek] = await pool.query(query, [id]);
    return res.status(200).json(rendelesek);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(PORT, () => {
  console.log(`dolgozat_tzs Server is running on port ${PORT}`);
});   
