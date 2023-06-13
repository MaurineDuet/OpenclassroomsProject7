const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true},
    genre: { type: String, required: true},
    ratings: [{
        userId: { type: String, required: true },
        grade: { type: Number, required: true },
     }],
     averageRating: { type: Number, required: true},
});

/* // Calculate the average rating based on the ratings array
bookSchema.statics.calculateAverageRating = async function(bookId) {
    const Book = this

    // Find the book by its ID
    const book = await Book.findById(bookId)

    if (!book) {
        throw new Error('Book not found')
    }

    // Calculate the sum of all grades
    const totalRatings = book.ratings.length
    const sumOfGrades = book.ratings.reduce((sum, rating) => sum + rating.grade, 0)

    // Calculate the average rating
    const averageRating = totalRatings > 0 ? sumOfGrades / totalRatings : 0

    // Update the averageRating field in the book document
    book.averageRating = averageRating
    await book.save()

    return averageRating
} */

module.exports = mongoose.model('Book', bookSchema);