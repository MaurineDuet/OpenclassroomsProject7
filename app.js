const express = require('express');

const app = express();

app.use(express.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.post('/api/books', (req, res, next) => {
    console.log(req.body)
    res.status(201).json({message: 'Objet créé'})
})

app.get('/api/books', (req, res, next) => {
    const books = [
      {
        _id: 'oeihfzpppeoi',
        userId: 'qsomihvqios',
        title: 'Mon premier objet',
        author: 'Charles',
        imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
        year: 2001,
        genre: 'Drame',
        ratings: [{
            userId: 'Paul',
            grade: 5,
        }],
        averageRating: 4,

      },
      {
        _id: 'oeihfzeoi',
        userId: 'bbb',
        title: 'Mon autre livre',
        author: 'Jean',
        imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
        year: 2001,
        genre: 'Crime',
        ratings: [{
            userId: 'Roger',
            grade: 5,
        }],
        averageRating: 4,
      },
    ];
    res.status(200).json(books);
  });

module.exports = app;