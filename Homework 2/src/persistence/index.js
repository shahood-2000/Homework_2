// persistence/index.js

// This file decides whether to load postgres.js or something else.
// We assume you're now using DB_ environment variables in Kubernetes.

if (process.env.DB_HOST) {
    // If DB_HOST is defined, load the Postgres code:
    module.exports = require('./postgres');
  } else {
    // If DB_HOST is not set, you could either load sqlite,
    // or export an empty object if there's no DB fallback.
    console.log('DB_HOST not set; no database configured.');
    module.exports = {};
  }
  