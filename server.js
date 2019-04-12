var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
axios.get("https://www.youtube.com").then(function(response) {
    var $ = cheerio.load(response.data);

    $("h3").each(function(i, element) {
        var title = $(element).children("a").text();
        var link = $(element).children("a").attr("href");
        
        if (title && link) {
        db.Video.create({
            title: title,
            link: link  
        },
        function(err, inserted){
            if(err) {
            console.log(err);
            } else {
            console.log(inserted);
            }
        })
        }

        });
        res.send("Scrape Complete");
    });
});

app.get("/videos", function(req, res) {
    db.Video.find({})
      .then(function(dbVideo) {
          res.json(dbVideo)
      })
      .catch(function(err) {
          res.json(err);
      })
})

app.get("/videos/:id", function(req, res) {
    db.Video.findone({_id: req.params.id })
    .populate("note")
    .then(function(dbVideo) {
        res.json(dbVideo)
    })
    .catch(function(err) {
        res.json(err)
    });
});

app.post("/videos/:id", function(req, res) {
    
})

app.listen(PORT, function() {
    console.log("App running on port" + PORT + "!");
});