const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const bodyParser = require("body-parser");

const app = express();
app.use(cors());

/* app.use((req, res, next) => {
  //res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  req.append('Access-Control-Request-Headers', 'app_name');
  req.append('Access-Control-Request-Headers', 'api_path');
  next();
}); */

app.use(bodyParser())
dotenv.config({path:'./.env'});
// parse requests of content-type - application/json
app.use(express.json({ limit: '20mb' }));
app.use((error, req, res, next) => {
  console.log('This is the rejected field ->', error.field);
});

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


const db = require("./app/models");

db.sequelize.sync()
  .then(() => {
    console.log("Synced Local db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Microtek APIs." });
});


require("./app/routes/routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
