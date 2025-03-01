// index.js

const express = require('express');
const app = express();
const db = require('./persistence'); // This will load persistence/index.js

const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

// Middleware
app.use(express.json());
app.use(express.static(__dirname + '/static'));

// Routes
app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// ---------------------------------------------
// The important part: we call db.init() here:
db.init()
  .then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = () => {
  db.teardown()
    .catch(() => {})
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // e.g., nodemon restarts
