const Book = require('../models/Book')
const fs = require('fs');

exports.createBook = (req, res, next) => {
  /* delete bookObject.id */
  const bookObject = JSON.parse(req.body.book)
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
  const { id } = req.params;
  const bookObject = { ...req.body };
  const userId = req.auth.userId;

  if (req.file) {
    // If a new image is provided, update the imageUrl in bookObject
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/${req.file.filePath}`;
  }

Book.findOne({ _id: id })
  .then((book) => {
    if (book.userId != userId) {
      res.status(401).json({ message: 'Non-autorisé' });
    } else {
      Book.updateOne({ _id: id }, { ...bookObject })
        .then(() => {
          // Fetch the updated book again and send it as part of the response

          Book.findOne({ _id: id })
            .then((updatedBook) => {
              res.status(200).json({
                message: 'Livre modifié!',
                book: updatedBook,
                ...book._doc
              });
            })
            .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    }
  })
  .catch((error) => {
    res.status(400).json({ error });
  });

};



  /*     Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre mis à jour !'}))
        .catch(error => res.status(400).json({ error })); */


exports.deleteBook = (req, res, next) => {
  const { id } = req.params

  Book.findOne({ _id: id })
  .then(book => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: 'Non-autorisé' });
    } else {
      const filename = book.imageUrl.split('/images/')[1];
      const imagePath = `images/${filename}`;

      fs.unlink(imagePath, (error) => {
        if (error) {
          // If there's an error deleting the image file, you can choose to handle it here
          console.log('Error deleting image:', error);
        }

        Book.deleteOne({ _id: id })
          .then(() => {
            res.status(200).json({ message: 'Livre supprimé !' });
          })
          .catch(error => {
            res.status(401).json({ error });
          });
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
      books.sort((a, b) => b.averageRating - a.averageRating);
      const bestRatedBooks = books.slice(0, 3);
      console.log(bestRatedBooks);
      res.status(200).json(bestRatedBooks);
    })
    .catch((error) => {
      res.status(500).json({ error: 'An error occurred while retrieving books.' });
    });
};


exports.getOneBook = (req, res, next) => {
  const { id } = req.params;

  if (id === 'bestrating') {
    exports.getBestRatedBooks(req, res, next);
  } else {
    Book.findOne({ _id: id })
      .then((book) => {
        if (book) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ error: 'Book not found' });
        }
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.rateBook = (req, res, next) => {
  const { id } = req.params;

  const { userId, rating } = req.body;

  // Vérifie que le rating est bien entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating. Rating must be between 0 and 5.' });
  }

  Book.findOne({ _id: id })
    .then((book) => {
      const newRatings = book.ratings || [];
      if (book.userId !== req.auth.userId) {
        const newRating = {
          userId: userId,
          grade: rating
        }
        newRatings.push(newRating)

        const totalRatings = newRatings.length
        const sumOfGrades = newRatings.reduce((sum, rating) => sum + rating.grade, 0)

        // Calculate the average rating
        const newAverageRating = totalRatings > 0 ? sumOfGrades / totalRatings : 0

        // Update the averageRating field in the book document
        book.averageRating = newAverageRating
        console.log(newAverageRating)

        Book.updateOne(
          { _id: id },

          {
            $set: {
              ratings: newRatings,
              averageRating: newAverageRating,
              _id: id
            }

          }
        )
          .then(() => {
            console.log({ _id: id })
            res.status(200).json({ _id: id, message: 'Nouvelle moyenne calculée', ...book._doc })
          })
          .catch(error => res.status(401).json({ error }))

      }

      else {
        res.status(401).json({ error: 'Unauthorized' });
      }

    })

    .catch(error => res.status(400).json({ error }))
}

