const mongoose = require('mongoose');

const articleNote = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    viewedArticles: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ViewedArticles',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String,
    }
});

module.exports = mongoose.model('ArticleNote', articleNote);