const Book = require('../models/Book')
const fs = require('fs');

exports.createBook = (req, res, next) => {
  /* delete bookObject.id */
  const bookObject = JSON.parse(req.body.book)
  console.log(bookObject)
  delete bookObject.userId
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/${req.file.filePath}`
  })

  book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })

  /*       delete req.body._id;
        const book = new Book({
          ...req.body
        });
        book.save()
          .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
          .catch(error => res.status(400).json({ error })); */
}

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });

  /*     Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre mis à jour !'}))
        .catch(error => res.status(400).json({ error })); */
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });

  /*   Book.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
      .catch(error => res.status(400).json({ error })); */
}

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      books.sort((a, b) => b.averageRating - a.averageRatingrating);

      // Get the top three books
      const bestRatedBooks = books.slice(0, 3);
      console.log(bestRatedBooks)

      res.status(200).json(bestRatedBooks)
    })
    .catch((error) => {
      res.status(500).json({ error: 'An error occurred while retrieving books.' });
    })
}

exports.getOneBook = (req, res, next) => {
  const { id } = req.params
  if (id === 'bestrating') {
    return exports.getBestRatedBooks(req, res, next)

      // Return the best rated books in the response
      res.status(200).json(bestRatedBooks);
  } else {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
  }
}

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const newRatings = book.ratings
      if (book.userId !== req.auth.userId) {
        const newRating = {
          userId: req.body.userId,
          grade: req.body.rating
        }
        newRatings.push(newRating)
        console.log(newRating)
        console.log(newRatings)

        const totalRatings = newRatings.length
        const sumOfGrades = newRatings.reduce((sum, rating) => sum + rating.grade, 0)

        // Calculate the average rating
        const newAverageRating = totalRatings > 0 ? sumOfGrades / totalRatings : 0

        // Update the averageRating field in the book document
        book.averageRating = newAverageRating
        console.log(newAverageRating)

        Book.updateOne(
          { _id: req.params.id },

          {
            $set: {
            ratings: newRatings,
            averageRating: newAverageRating,
            _id: req.params.id
          }

          }
        )
          .then(() => {
            console.log({ _id: req.params.id })
            res.status(200).json({ _id: req.params.id, message: 'Nouvelle moyenne calculée' })
          })
          .catch(error => res.status(401).json({ error }))

      }

      else {
        res.status(401).json({ error: 'Unauthorized' });
      }

    })

    .catch(error => res.status(400).json({ error }))
}

