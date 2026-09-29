import express from 'express';
import 'dotenv/config';
import mysql from 'mysql2/promise';


const PORT = process.env.PORT || 3000;


const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
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


app.get('/vevok', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vevok');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching vevok:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/vevok/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        const [sorok] = await pool.query('SELECT * FROM vevok WHERE id = ?', [id]);  
        if (sorok.length === 0) {
            return res.status(404).json({ error: 'Vevő not found' });
        }  
        res.json(sorok[0]);
    } catch (error) {
        console.error('Error fetching vevő:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/vevok', async (req, res) => {
    const { nev, email, reg_datuma } = req.body;

    if (!nev || !email || !reg_datuma) {
        return res.status(400).json({ error: 'Bad request: A név, email és reg_datuma megadása kötelező!' });
    }

    try {
        const [result] = await pool.query('INSERT INTO vevok (nev, email, reg_datuma) VALUES (?, ?, ?)', [nev, email, reg_datuma]);

        res.status(201).json({
            id: result.insertId,
            nev,
            email,
            reg_datuma
        });
    }
    catch (error) {
        console.error('Error creating vevő:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/vevok/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { nev, email, reg_datuma } = req.body;

    if (!nev || !email || !reg_datuma) {
        return res.status(400).json({ error: 'Bad request: A név, email és reg_datuma megadása kötelező!' });
    }
    try {
        const [result] = await pool.query('UPDATE vevok SET nev = ?, email = ?, reg_datuma = ?', [nev, email, reg_datuma]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Vevő nem található' });
            }
            res.status(200).json({ message: 'Vevő adatai sikeresen frissítve' });
        }
        catch (error) {
            console.error('Error updating vevő:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
});



app.delete('/api/vevok/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [result] = await pool.query('DELETE FROM vevok WHERE id = ?', [id]);
        if(result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vevő nem található' });
        }   
        res.json({ message: 'Vevő sikeresen törölve' });
    } catch (error) {
        console.error('Error deleting vevő:', error);
        res.status(500).json({ error: 'Internal Server Error' });   
    }});


/*
app.get('/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }   });



app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


*/

app.listen(PORT, () => {
  console.log(`Express2 Server is running on port ${PORT}`);
});   
