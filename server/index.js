const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors")
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3')
const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
 
const corsOrigin = {
  origin: ["https://s7b0t4-website-server.ru", "http://localhost:3000"],
  credentials: true,
  optionSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Слишком много запросов с вашего IP, попробуйте позже.'
});

app.use(limiter);

app.use(cors(corsOrigin));
app.use(bodyParser.json());

const PORT = 5000

const db = new sqlite3.Database('users.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password TEXT NOT NULL
  )`);
});

app.get('/users', function(req, res) {
  db.all(`SELECT * FROM users`, function(err, rows) {
    if (err) {
      console.error('Ошибка при получении пользователей:', err);
      return res.status(500).send({ message: 'Ошибка при получении пользователей' });
    }
    res.send(rows);
  });
});

app.post('/register', async function(req, res) {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send({ message: 'Имя пользователя и пароль обязательны' });
  }

  try {
    db.get('SELECT * FROM users WHERE name = ?', [name], async function(err, user) {
      if (err) {
        console.error('Ошибка при поиске пользователя:', err);
        return res.status(500).send({ message: 'Ошибка при регистрации пользователя' });
      }

      if (user) {
        return res.status(409).send({ message: 'Пользователь с таким именем уже существует' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.run('INSERT INTO users (name, password) VALUES (?, ?)', [name, hashedPassword], function(err) {
        if (err) {
          console.error('Ошибка при регистрации пользователя:', err);
          return res.status(500).send({ message: 'Ошибка при регистрации пользователя' });
        }

        const token = jwt.sign({ name }, 'секретный_ключ', { expiresIn: '1h' });

        res.status(201).send({ message: 'Пользователь успешно зарегистрирован', token });
      });
    });
  } catch (err) {
    console.error('Ошибка при хешировании пароля:', err);
    res.status(500).send({ message: 'Ошибка при регистрации пользователя' });
  }
});

app.post('/login', async function(req, res) {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send({ message: 'Имя пользователя и пароль обязательны' });
  }

  try {
    db.get('SELECT * FROM users WHERE name = ?', [name], async function(err, user) {
      if (err) {
        console.error('Ошибка при поиске пользователя:', err);
        return res.status(500).send({ message: 'Ошибка при аутентификации пользователя' });
      }

      if (!user) {
        return res.status(401).send({ message: 'Неверное имя пользователя или пароль' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send({ message: 'Неверное имя пользователя или пароль' });
      }

      const token = jwt.sign({ name }, 'секретный_ключ', { expiresIn: '1h' });

      res.status(200).send({ token });
    });
  } catch (err) {
    console.error('Ошибка при аутентификации пользователя:', err);
    res.status(500).send({ message: 'Ошибка при аутентификации пользователя' });
  }
});



app.listen(PORT, (err)=>{
  console.log(PORT)
})