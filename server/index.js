const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors")
 
const corsOrigin = {
  origin: ["https://s7b0t4-website-server.ru", "http://localhost:3000"],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOrigin));
app.use(bodyParser.json());

const PORT = 5000

app.get("/", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send("hello")
})

app.post('/', function(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  console.log(req.body)
});

app.listen(PORT, (err)=>{
  console.log(PORT)
})