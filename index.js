const express = require("express");
const cors = require("cors")
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan')
const routes = require("./routes")
const db = require("./models")

const app = express();
app.use(morgan('tiny'));
app.use(cors());

// environment variable PORT or 3000 if unset
const port = process.env.PORT || 3000;

// Add middleware for parsing the body to req.body
// middlewares are executed in the order added, so add before routes
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }
  console.error(error)
  res.status(error.statusCode || error.status || 500).send({ error: error })
})

app.use((req, res, next) => {
  req.models = db.models
  next()
})

var options = {
  explorer: true,
  editor: true,
  swaggerOptions: {
    urls: [
      {
        url: '/swagger.yaml',
        name: 'Spec1'
      }
    ]
  }
}

app.use('/', express.static(__dirname + '/swagger'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(null, options));
app.use('/', routes)


// Start up the database, then the server and begin listen to requests
if (process.env.NODE_ENV != "test") {
  db.connectDb().then(() => {
    const listener = app.listen(port, () => {
      console.info(`Server is listening on port ${listener.address().port}.`);
    })
  }).catch((error) => {
    console.error(error)
  })
}

module.exports = app