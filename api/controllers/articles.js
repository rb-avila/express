const mongoose = require("mongoose");
const Articles = require("../models/article");
var axios = require("axios");
var cheerio = require("cheerio");

function filterIt(arr, searchKey) {
  return arr.filter(function(obj) {
    return Object.keys(obj).some(function(key) {
      return obj[key] === searchKey;
    });
  });
}

function getSearchUrl(req) {
  const source = req.body.source;
  const category = "departmentofcitizenshipandimmigration";
  const startDate = "2019-01-01";
  const endDate = "2019-02-28";
  const index = 0;

  switch (source) {
    case "canada":
      //Build the news URL
      let domain =
        "https://www.canada.ca/en/news/advanced-news-search/news-results.html?";
      let key = "_=1551119106311";

      let params = {
        typ: "newsreleases",
        idx: index * 10,
        dprtmnt: category,
        start: startDate,
        end: endDate
      };

      var scrappingUrl = domain + key;

      for (key in params) {
        scrappingUrl += "&" + key + "=" + params[key];
      }
      break;

    default:
      res.status(404).json({
        message: "not found"
      });
  }

  return {
    url: scrappingUrl,
    source: source
  };
}

exports.articles_scrape = (req, res, next) => {
  var scraped = getSearchUrl(req);
  var counter = 0;
  var alreadyInDB;

  Articles.find()
    .select()
    //add source filter
    .exec()
    .then(docs => {
      // Get saved URLs from DB
      const urlFromDB = docs.map(doc => doc.url);

      //  Scrape the website
      axios.get(scraped.url).then(function(response) {
        //   Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);

        //   For each article class
        $("article").each(function(i, element) {
          var title = $(element)
            .children("h3")
            .text();
          var url = $(element)
            .children("h3")
            .children("a")
            .attr("href");
          var date = $(element)
            .children("p")
            .first()
            .children("time")
            .attr("datetime");
          var line = $(element)
            .children("p")
            .first()
            .text()
          var summary = $(element)
            .children("p")
            .last()
            .text();

          var splittedline = line.split("|", 3)
          var department = splittedline[2].trim()
          var type = splittedline[1].trim()

          
          // Proceed if the article has an url
          if (url) {
            const newsUrl = urlFromDB.filter(searchNews => searchNews === url);
            alreadyInDB = newsUrl.length > 0 ? true : false;

            // Check if the urls already exists in the database
            if (!alreadyInDB) {
              const news = new Articles({
                _id: new mongoose.Types.ObjectId(),
                source: scraped.source,
                title: title,
                type: type,
                department: department,
                url: url,
                summary: summary,
                date: date,
                status: "new"
              });
              news
                .save()
                .then(counter++)
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
          }
        });

        if (counter === 0) {
          message = "You're up to date. There is no news to review.";
        } else if ((counter === 1)) {
          message = "1 new article found";
        } else {
          message = counter + " new articles found";
        }

        res.status(200).json({
          message: message
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.articles_get_all = (req, res, next) => {
  Articles.find()
    .select("source title type department status category url summary")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        articles: docs.map(doc => {
          return {
            _id: doc._id,
            title: doc.title,
            source: doc.source,
            department: doc.department,
            type: doc.type,
            url: doc.url,
            summary: doc.summary,
            date: doc.date,
            status: doc.status,
            request: {
              type: "GET",
              url: "http://localhost:3000/articles/" + doc._id
            }
          };
        })
      };

      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.save_news = (req,res, next) => {
  SavedArticles.find()
}