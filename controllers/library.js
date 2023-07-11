const Book = require('../models/Book')
const fs = require('fs');

//Controller pour la création d'un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book)

  //Enlève le userId pour ajouter le nouveau créé de manière plus sécurisée
  delete bookObject.userId

  //Création d'un objet book correspondant au livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/${req.file.filePath}`
  })

  //Sauvegarde du livre dans la database
  book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
}

//Controller pour modifier un livre
exports.modifyBook = (req, res, next) => {
  const { id } = req.params;
  const bookObject = { ...req.body };
  const userId = req.auth.userId;

  if (req.file) {
    // Update de l'url de l'image si l'image est modifiée
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/${req.file.filePath}`;
  }

  //Recherche des données d'un livre
  Book.findOne({ _id: id })
    .then((book) => {

      //Vérification de l'identité de l'utilisateur pour autoriser ou non la modification du livre
      if (book.userId != userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        Book.updateOne({ _id: id }, { ...bookObject })
          .then(() => {
            //Update les données du livre dans la database
            Book.findOne({ _id: id })
              .then((updatedBook) => {
                res.status(200).json({
                  message: 'Livre modifié!',
                  book: updatedBook,
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

//Controller de suppression d'un livre
exports.deleteBook = (req, res, next) => {
  const { id } = req.params

  //Recherche des données d'un livre
  Book.findOne({ _id: id })
    .then(book => {
      //Vérification de l'identité de l'utilisateur pour autoriser ou non la suppression du livre
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        const imagePath = `images/${filename}`;

        //Supression de l'image du livre dans le dossier local
        fs.unlink(imagePath, (error) => {
          if (error) {
            console.log('Error deleting image:', error);
          }

          //Supression du livre dans la database
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
}

//Controller permettant d'obtenir le top 3 des livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      //Comparaison des notes des livres entre eux puis classement en fonction des résultats
      books.sort((a, b) => b.averageRating - a.averageRating);
      //Liste des 3 livres les mieux notés
      const bestRatedBooks = books.slice(0, 3);
      res.status(200).json(bestRatedBooks);
    })
    .catch((error) => {
      res.status(500).json({ error: 'An error occurred while retrieving books.' });
    });
};

//Controller pour obtenir les informations d'un livre
exports.getOneBook = (req, res, next) => {
  const { id } = req.params;

  //Création de l'espace aside des livres les mieux notés
  if (id === 'bestrating') {
    exports.getBestRatedBooks(req, res, next);
  } else {

    //Récupération des données du livre ciblé
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

//Controller pour obtenir tous les livres enregistrés 
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

//Controller pour noter un livre
exports.rateBook = (req, res, next) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  // Vérification que le rating est bien entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating. Rating must be between 0 and 5.' });
  }

  Book.findOne({ _id: id })
    .then((book) => {
      const newRatings = book.ratings || [];
      //Vérification de l'identité de l'utilisateur pour autoriser ou non la notation
      if (book.userId !== req.auth.userId) {
        const newRating = {
          userId: userId,
          grade: rating
        }
        //Ajout de la nouvelle note aux ratings du livre
        newRatings.push(newRating)

        // Calcul de la note moyenne
        const totalRatings = newRatings.length
        const sumOfGrades = newRatings.reduce((sum, rating) => sum + rating.grade, 0)
        const newAverageRating = totalRatings > 0 ? sumOfGrades / totalRatings : 0

        // Update de la note moyenne du livre
        book.averageRating = newAverageRating

        //Update des datas du livre dans la database
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

