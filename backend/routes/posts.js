const express = require('express');
const router = express.Router();

// Import the CRUD functions you need from the Canvas file
const {
  getAllPosts,
  getPostById,
  createPost
} = require('../db.js'); // Adjust path as needed

// GET /api/posts/
router.get('/', async (req, res, next) => {
  try {
    // Get the db connection from the app instance
    const db = req.app.get('db'); 
    const posts = await getAllPosts(db);
    res.json(posts);
  } catch (err) {
    next(err); // Pass errors to your error handler
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const post = await getPostById(db, req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
});
 
// POST /api/posts/
router.post('/', async (req, res, next) => {
  try {
    const { username, caption, thumbnail, url } = req.body;
    if (!username || !caption|| !thumbnail|| !url) {
      return res.status(400).json({ error: 'All parameters are required' });
    }
    const db = req.app.get('db');
    const newPostId = await createPost(db, username, caption, thumbnail, url);
    res.status(201).json({ id: newPostId, username, caption, thumbnail, url });
  } catch (err) {
    next(err);
  }
});

// Export the router
module.exports = router;