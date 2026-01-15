// Import the sqlite3 module. 
// Use .verbose() to get more detailed stack traces for debugging.
const sqlite3 = require('sqlite3').verbose();

/**
 * Creates and initializes the database.
 * @param {string} dbPath - The file path for the database (e.g., './mydb.db').
 * @returns {object} The sqlite3 database object.
 */
function createDb(dbPath = './main.db') {
  // Open the database connection.
  // :memory: can be used for an in-memory database.
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log(`Connected to the SQLite database at ${dbPath}`);
      // Run the setup query to create the table if it doesn't exist.
      setupDatabase(db);
    }
  });
  return db;
}

/**
 * Sets up the database schema (creates tables).
 * @param {object} db - The sqlite3 database object.
 */
function setupDatabase(db) {
  // db.serialize ensures that the commands run in sequence.
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        caption TEXT NOT NULL,
        thumbnail TEXT NOT NULL,
        url TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table "posts" is ready.');
      }
    });
  });
}

/**
 * Closes the database connection.
 * @param {object} db - The sqlite3 database object.
 * @returns {Promise<void>}
 */
function closeDb(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        reject(err);
      } else {
        console.log('Database connection closed.');
        resolve();
      }
    });
  });
}

// --- Asynchronous CRUD Functions ---

/**
 * CREATE: Adds a new user to the database.
 * @param {object} db - The sqlite3 database object.
 * @param {string} username - Org's username
 * @param {string} caption - The post's caption.
 * @param {string} thumbnail - The post's thumbnail.
 * @param {string} url - The postsa's url.
 * @returns {Promise<number>} The ID of the newly inserted row.
 */
function createPost(db, username, caption, thumbnail, url) {
  const sql = `INSERT INTO posts (username, caption, thumbnail, url) VALUES (?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    // 'this' context in the callback function refers to the statement object,
    // which contains 'lastID' (the ID of the new row).
    db.run(sql, [username, caption, thumbnail, url], function(err) {
      if (err) {
        console.error('Error in createPost:', err.message);
        reject(err);
      } else {
        console.log(`Created user with ID: ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * READ (All): Retrieves all posts from the database.
 * @param {object} db - The sqlite3 database object.
 * @returns {Promise<Array<object>>} A list of user objects.
 */
function getAllPosts(db) {
  const sql = `SELECT * FROM posts`;
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error in getAllUsers:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * READ (One): Retrieves a single user by their ID.
 * @param {object} db - The sqlite3 database object.
 * @param {number} id - The user's ID.
 * @returns {Promise<object>} The user object, or undefined if not found.
 */
function getPostById(db, id) {
  const sql = `SELECT * FROM posts WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('Error in getPostById:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * UPDATE: Updates an existing user's information.
 * @param {object} db - The sqlite3 database object.
 * @param {number} id - The ID of the user to update.
 * @param {string} username - Org's username
 * @param {string} caption - The post's caption.
 * @param {string} thumbnail - The post's thumbnail.
 * @param {string} url - The postsa's url.
 * @returns {Promise<number>} The number of rows changed.
 */
function updatePost(db, id, username, caption, thumbnail, url) {
  const sql = `UPDATE posts SET username = ?, caption = ?, thumbnail = ?, url = ? WHERE id = ?`;
  return new Promise((resolve, reject) => {
    // 'this.changes' contains the number of rows affected.
    db.run(sql, [username, caption, thumbnail, url, id], function(err) {
      if (err) {
        console.error('Error in updatePost:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
          console.warn(`No post found with ID: ${id}. Nothing updated.`);
        } else {
          console.log(`Updated post with ID: ${id}. Rows affected: ${this.changes}`);
        }
        resolve(this.changes);
      }
    });
  });
}

/**
 * DELETE: Removes a user from the database by their ID.
 * @param {object} db - The sqlite3 database object.
 * @param {number} id - The ID of the user to delete.
 * @returns {Promise<number>} The number of rows changed.
 */
function deletePost(db, id) {
  const sql = `DELETE FROM posts WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.run(sql, [id], function(err) {
      if (err) {
        console.error('Error in deleteUser:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
          console.warn(`No post found with ID: ${id}. Nothing deleted.`);
        } else {
          console.log(`Deleted post with ID: ${id}. Rows affected: ${this.changes}`);
        }
        resolve(this.changes);
      }
    });
  });
}


// Export functions for use in other modules
module.exports = {
  createDb,
  closeDb,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
};

// If this file is run directly (node sqlite_crud.js), execute the example.
if (require.main === module) {
  createDb('./posts.db');
}
