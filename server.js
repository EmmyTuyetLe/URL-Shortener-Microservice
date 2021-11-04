require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const dns = require("dns");
const urlparser = require("url");
const app = express();

app.use(express.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const schema = new mongoose.Schema({ url: "string" });
const Url = mongoose.model("Url", schema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  const bodyUrl= req.body.url;

  const stuff = dns.lookup(urlparser.parse(bodyUrl).hostname,
  (error, address) => {
    if(!address) {
      res.json({error: 'invalid url'})
    } else {
      const url = new Url ({ url: bodyUrl })
      url.save((err,data) => {
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      }
      )
    }
    console.log("dns", error);
    console.log("address", address);
  })
  console.log("stuff", stuff);
});


app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) =>{
    if(!data){
      res.json({error: 'invalid url'})
    } else{
      res.redirect(data.url)
    }
  })
})


app.listen(port, function(){
  console.log(`Listening on port ${port}`)
});
