// persistence/postgres.js

const { Pool } = require('pg');

// Pull environment variables named DB_*
const {
  DB_HOST: HOST,
  DB_USER: USER,
  DB_PASSWORD: PASSWORD,
  DB_NAME: DATABASE,
} = process.env;

let pool;

// init() is the function index.js calls: db.init()
async function init() {
  // Create a new Pool using the DB_ environment variables:
  pool = new Pool({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
  });

  // Test the connection by actually connecting:
  await pool.connect();

  // Create the todo_items table if it doesn't exist:
  return new Promise((resolve, reject) => {
    pool.query(
      'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
      (err) => {
        if (err) return reject(err);

        console.log(`Connected to Postgres DB at host: ${HOST}`);
        resolve();
      }
    );
  });
}

// Gracefully close the pool (called by index.js -> gracefulShutdown)
async function teardown() {
  return new Promise((resolve, reject) => {
    if (!pool) return resolve();
    pool.end((err) => {
      if (err) return reject(err);
      console.log('Postgres connection closed.');
      resolve();
    });
  });
}

// The rest are DB helper methods to get/store/update items.

async function getItems() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM todo_items', (err, result) => {
      if (err) return reject(err);
      const items = result.rows.map(item => ({
        ...item,
        completed: item.completed === true || item.completed === 1,
      }));
      resolve(items);
    });
  });
}

async function getItem(id) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM todo_items WHERE id=$1', [id], (err, result) => {
      if (err) return reject(err);
      const rows = result.rows.map(row => ({
        ...row,
        completed: row.completed === true || row.completed === 1,
      }));
      resolve(rows[0]);
    });
  });
}

async function storeItem(item) {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO todo_items (id, name, completed) VALUES ($1, $2, $3)',
      [item.id, item.name, item.completed ? 1 : 0],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

async function updateItem(id, item) {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE todo_items SET name=$1, completed=$2 WHERE id=$3',
      [item.name, item.completed ? 1 : 0, id],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

async function removeItem(id) {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM todo_items WHERE id=$1', [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Export everything for index.js and route handlers
module.exports = {
  init,
  teardown,
  getItems,
  getItem,
  storeItem,
  updateItem,
  removeItem,
};
