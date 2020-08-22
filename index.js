require('dotenv').config();

const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const multer = require('multer');
const mysql = require('mysql');
const { v4: uuid } = require('uuid');

const app = express();
const port = 3000;
const upload = multer({
  storage: multer.diskStorage({
    destination: function (_, _, cb) {
      cb(null, 'uploads/');
    },
    filename: function (_, file, cb) {
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];
      cb(null, `${uuid()}.${ext}`);
    },
  }),
  fileFilter: (_, file, callback) => callback(null, file.mimetype.startsWith('video')),
});

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect();

app.get('/initdb', (_, res) => {
  connection.query(`drop table if exists videos`, err => {
    if (err) return res.json(err);

    connection.query(
      `create table if not exists videos (
        id varchar(32) primary key,
        title varchar(100) not null,
        description text not null,
        file_path varchar(100) not null
      )`,
      err => {
        if (err) return res.json(err);
        res.send('success');
      }
    );
  });
});

app.get('/videos', (_, res) => {
  const sql = `select * from videos`;
  const cb = (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  };

  connection.query(sql, cb);
});

app.get('/video/:id', (req, res) => {
  const { id } = req.params;

  const sql = `select * from videos where id = ?`;
  const data = [id];
  const cb = (err, rows) => {
    if (err) return res.status(400).send(err);
    if (rows.length === 0) return res.status(404).send(`Video doesn't exists.`);
    res.download(rows[0].file_path);
  };

  connection.query(sql, data, cb);
});

app.post('/video/create', upload.single('file'), (req, res) => {
  const fileIsRejected = !req?.file;
  if (fileIsRejected) return res.status(415).send('File must be a video.');

  const { title, description } = req.body;
  const { path } = req.file;

  const sql = `insert into videos (id, title, description, file_path) values (?, ?, ?, ?)`;
  const data = [uuid(), title, description, path];
  const cb = err => {
    if (err) return res.status(400).send(err);
    res.status(201).send();
  };

  connection.query(sql, data, cb);
});

app.delete('/video/:id', (req, res) => {
  const { id } = req.params;

  const sql = `select file_path from videos where id = ?`;
  const data = [id];
  const cb = (err, rows) => {
    if (err) return res.status(400).send(err);
    
    const path = rows[0].file_path;

    const sql = `delete from videos where id = ?`;
    const data = [id];
    const cb = (err, rows) => {
      if (err) return res.status(400).send(err);
      if (rows.affectedRows === 0) return res.status(404).send(`Video doesn't exists.`);
      res.sendStatus(204);
    };

    fs.unlink(path, () => connection.query(sql, data, cb));
  };

  connection.query(sql, data, cb);
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
