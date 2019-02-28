const express = require("express");
const router = express.Router();
const ArticlesController = require("../controllers/articles")
const ViewedArticlesController = require("../controllers/viewedArticles")
const NotesController = require("../controllers/articleNotes")

// const UserController = require('../controllers/user');
// const checkAuth = require('../middleware/check-auth');

router.post("/", ArticlesController.articles_scrape);

router.get("/", ArticlesController.articles_get_all);

// router.get("/:articleId", ViewedArticles.view_article);

router.get("/view/", ViewedArticlesController.viewed_articles_get_all);

router.get("/view/:articleId", ViewedArticlesController.view_article_detail);

router.patch("/view/:articleId", ViewedArticlesController.update_article_flag);

router.post("/view/:articleId/notes", NotesController.notes_add);

// router.post("/login", UserController.user_login);

// router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;