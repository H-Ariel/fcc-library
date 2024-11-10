/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  app.route('/api/books')
    .get(function (req, res) {
      const { _id } = req.query;
      let book = _id == undefined ? Book.find({}) : Book.find({ _id });
      book.then(data => res.json(data.map(obj => ({
        _id: obj._id,
        title: obj.title,
        comments: obj.comments,
        commentcount: obj.comments.length
      })))
      ).catch(err => res.json({ error: err.message }));
    })
    .post(function (req, res) {
      const title = req.body.title;
      if (title === undefined)
        res.json('missing required field title');
      else
        new Book({ title })
          .save()
          .then(data => res.json(data))
          .catch(err => res.json({ error: err.message }));
    })
    .delete(function (req, res) {
      Book.deleteMany({})
        .then(() => res.json('complete delete successful'))
        .catch(err => res.json({ error: err.message }));
    });

  app.route('/api/books/:id')
    .get(function (req, res) {
      Book.findOne({ _id: req.params.id })
        .then(data => res.json(data ? data : 'no book exists'))
        .catch(err => res.json('no book exists'));
    })
    .post(function (req, res) {
      const comment = req.body.comment;
      if (comment === undefined)
        return res.json('missing required field comment');

      Book.findOne({ _id: req.params.id })
        .then(book => {
          if (book) {
            book.comments.push(comment);
            book.save()
              .then(data => res.json(data))
              .catch(err => res.json({ error: err.message }));
          }
          else {
            res.json('no book exists');
          }
        })
        .catch(err => res.json('no book exists'));
    })
    .delete(function (req, res) {
      Book.deleteOne({ _id: req.params.id })
        .then(data => res.json(data.deletedCount ? 'delete successful' : 'no book exists'))
        .catch(err => res.json('no book exists'));
    });
};
