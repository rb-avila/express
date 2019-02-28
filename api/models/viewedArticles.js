const mongoose = require('mongoose');

const viewedArticles = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    
    saved: {
        type: Boolean,
        default: false
    },
    removed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ViewedArticles', viewedArticles);