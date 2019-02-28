const mongoose = require("mongoose");

const User = require("../models/user");
const Articles = require("../models/article");
const ViewedArticles = require("../models/viewedArticles")
const jwt = require("jsonwebtoken");


exports.view_article = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const user = jwt.decode(token).userId
  const articleId = req.params.articleId

  console.log("14", articleId)
  Articles.findById(articleId)
    .then(article => {
      if (!article) {
        console.log('not found')
        return res.status(404).json({
          message: "Article not found"
        });
      }
      console.log('found')
      const viewedArticles = new ViewedArticles({
        _id: mongoose.Types.ObjectId(),
        user: user,
        article: articleId
      });

      return viewedArticles.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Article saved",
        viewedArticle: {
          _id: result._id,
          user: result.user,
          article: result.article
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

exports.viewed_articles_get_all = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const user = jwt.decode(token).userId

    ViewedArticles.find({ user: user, removed: false} )
    .select("article ViewedArticles user _id removed saved")
    .populate("article", "title source type summary department url date status") 
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        array: docs.map(doc => {
          return { 
            _id: doc._id,
            user: doc.user,
            removed: doc.removed,
            saved: doc.saved,
            article: doc.article,
            request: {
              type: "GET",
              url: "http://localhost:3000/test/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.view_article_detail = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const user = jwt.decode(token).userId
  const _id = req.params.articleId

  // console.log("id", _id, "user", user )
  ViewedArticles.findById(_id)
    .populate("article", "source title type department url summary date") 
    .exec()
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: "article not found"
        });
      }
      
      // retrieve the user from the article to compare
      let userDB = JSON.stringify(result.user)
      userDB = userDB.slice(1,userDB.length-1)
     
      if (user === userDB){
        return res.status(200).json({
          _id: result._id,
          user: result.user,
          saved: result.saved,
          removed: result.removed,
          article: result.article,
          request: {
            type: "GET",
            url: "http://localhost:3000/articles"
          }
        });
      } else {
        return res.status(404).json({
          message: "article not found"
        });
      }
  
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.update_article_flag = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  const user = jwt.decode(token).userId

  const id = req.params.articleId
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  ViewedArticles.update({ _id: id, user: user }, { $set: updateOps })
  .exec()
  .then(result => {
    res.status(200).json({
      message: "Article updated",
      request: {
        type: "GET",
        url: "http://localhost:3000/article/" + id
      }
    });
  })
  .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};