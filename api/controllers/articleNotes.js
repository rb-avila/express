const mongoose = require("mongoose");

const User = require("../models/user");
const ArticleNotes = require("../models/articleNote");
const ViewedArticles = require("../models/viewedArticles")
const jwt = require("jsonwebtoken");

exports.notes_add = (req, res, next) => {
    // console.log('start')
    const token = req.headers.authorization.split(" ")[1]
    const user = jwt.decode(token).userId
    const articleId = req.params.articleId
  
    // console.log(articleId)
    ViewedArticles.findById(articleId)
      .then(article => {
        if (!article) {
          return res.status(404).json({
            message: "Article not found"
          });
        }
        console.log('found')
        const articleNotes = new ArticleNotes({
          _id: mongoose.Types.ObjectId(),
          note: req.body.note,
         });
  
         console.log(articleNotes)
        return articleNotes.save();
      })
      .then(result => {
        res.status(201).json({
          message: "Note created",
          Note: {
            _id: result._id,
            note: result.note,
          },
          request: {
            type: "GET",
            url: "http://localhost:3000/viewed/" + result._id
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  };