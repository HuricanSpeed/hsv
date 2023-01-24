const express = require('express');
var mysql = require('mysql')
var bodyParser = require('body-parser')
const https = require('https');
const fs = require('fs');
const cors = require('cors')
const port = 4000;

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/gphub.fun/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/gphub.fun/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/gphub.fun/chain.pem')
};

var connection  = mysql.createPool({
  connectionLimit : 10,
  acquireTimeout  : 10000,
  host            : 'localhost',
  user            : 'main',
  password        : 'bublinkyoriginal',
  database        : 'test'
});

const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cors());

var currentjoke = {};

app.get("/joke", (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    try{
      if(!currentjoke == {}){
        connection.query(`SELECT * FROM jokes WHERE <> ${currentjoke.id} ORDER BY RAND() LIMIT 1;`, function (err, rows) {
            if (err) {
                res.json(err)
            } else {
                res.json(rows)
                currentjoke = rows;
            }
        })
      } else {
        connection.query(`SELECT * FROM jokes ORDER BY RAND() LIMIT 1;`, function (err, rows) {
          if (err) {
              res.json(err)
          } else {
              res.json(rows)
              currentjoke = rows;
          }
      })
      }
    } catch (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Re-connecting lost connection: ' + err.stack);
        connection = mysql.createConnection(connection.config);
        connection.connect();
      } else {
        console.error('Database error: ' + err.stack);
        throw err;
      }
    }
})

app.post("/addjoke", (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  let response = {"message": "", "status": true};
  if(req.body){
    req.body.year = Number(req.body.year);
    if(req.body.header && !req.body.header == ""){
      console.log(req.body.header)
    } else {
      response.message += "name";
      response.status = false;
    }
    if(req.body.joke && !req.body.joke == ""){
      console.log(req.body.joke)
    } else {
      response.message += " joke";
      response.status = false;
    }
    if(req.body.answer && !req.body.answer == ""){
      console.log(req.body.answer)
    } else {
      response.message += " answer";
      response.status = false;
    }
    if(req.body.author && !req.body.author == ""){
      console.log(req.body.author)
    } else {
      response.message += " author";
      response.status = false;
    }
    if(req.body.year && !isNaN(req.body.year)){
      console.log(req.body.year)
    } else {
      response.message += " year";
      response.status = false;
    }
  }

  if(!response.status){
    console.log("Request denied");
    console.log(response.message);
    res.statusCode = 500;
    res.send("Request denied");
    return;
  }

  if(response.status){
    response.message = "Joke created"
    try{
      connection.query(`INSERT INTO jokes (header, joke, answer, author, year) VALUES ('${req.body.header}', '${req.body.joke}', '${req.body.answer}', '${req.body.author}', ${req.body.year})`, function (err, result) {
        if(err) throw err;
      })
    } catch (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Re-connecting lost connection: ' + err.stack);
        connection = mysql.createConnection(connection.config);
        connection.connect();
      } else {
        console.error('Database error: ' + err.stack);
        throw err;
      }
    }
  }

  res.json(response)
})

var server = https.createServer(options, app);

server.listen(port, () => {
  console.log("server starting on port : " + port)
});