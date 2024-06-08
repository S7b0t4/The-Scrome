const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
require('dotenv').config();

const corsOrigin = {
  origin: ["https://s7b0t4-website-server.ru", "http://localhost:3000"],
  credentials: true,
  optionSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: 'Слишком много запросов с вашего IP, попробуйте позже.'
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  }
});

app.use(limiter);
app.use(cors(corsOrigin));
app.use(bodyParser.json());

const PORT = 5000;

const generateRandomString = (length) => 
    Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))).join('')


const db = new sqlite3.Database('users.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    token TEXT NOT NULL
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
  const { name, password, email } = req.body;
  console.log(req.body);

  if (!name || !password || !email) {
    return res.status(400).send({ message: 'Имя пользователя, пароль и email обязательны' });
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

      const token = jwt.sign({ name }, 'секретный_ключ');

      const randomString = generateRandomString(10)
      /* res.send(randomString) */


      db.run('INSERT INTO users (name, password, token) VALUES (?, ?, ?)', [name, hashedPassword, token], async function(err) {
        if (err) {
          console.error('Ошибка при регистрации пользователя:', err);
          return res.status(500).send({ message: 'Ошибка при регистрации пользователя' });
        }


        const mailOptions = {
          from: 'anthony.pan.00@gmail.com',
          to: email,
          subject: 'Email Verification',
          text: `Please verify your email by clicking on the link`
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent:', info.response);
          if (!res.headersSent) {
            res.status(201).send({ message: 'Пользователь успешно зарегистрирован и письмо отправлено', token });
          }
        } catch (error) {
          console.error('Error sending email:', error);
          if (!res.headersSent) {
            res.status(500).send('Ошибка при отправке email');
          }
        }
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
  
      const token = jwt.sign({ name }, 'секретный_ключ');
  
      db.run('UPDATE users SET token = ? WHERE name = ?', [token, name], function(err) {
        if (err) {
          console.error('Ошибка при обновлении токена в базе данных:', err);
          return res.status(500).send({ message: 'Ошибка при обновлении токена в базе данных' });
        }
        
        res.status(200).send({ token });
      });
    });
  } catch (err) {
    console.error('Ошибка при аутентификации пользователя:', err);
    return res.status(500).send({ message: 'Ошибка при аутентификации пользователя' });
  }
  
});

app.post('/verify', (req, res) => {
  const { name, token } = req.body;

  db.get('SELECT * FROM users WHERE name = ? AND token = ?', [name, token], (err, user) => {
    console.log(user)
    if (err) {
      console.error('Ошибка при поиске пользователя:', err);
      return res.status(500).send({ message: 'Ошибка при проверке пользователя' });
    }

    if (!user) {
      return res.status(401).send({ verified: false, message: 'Пользователь не найден или токен недействителен' });
    }

    res.status(200).send({ verified: true });
  });
});

app.post('/api/sendMessage', async (req, res) => {
  console.log("MESSAGE:" ,req.body);
  const { message, selectedChat } = req.body;

  const botToken = process.env.API_TOKEN;
  const chatId = selectedChat.id;

  const sendMessageUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка при отправке сообщения: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Ошибка при запуске сервера:', err);
  } else {
    console.log(`Server is running on port`, PORT);
  }
});
