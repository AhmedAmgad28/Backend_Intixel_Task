const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/', auth, commentController.createComment); // Create a comment
router.get('/event/:eventID', commentController.getCommentsByEventId); // Get comments by event ID
router.put('/:id', auth, commentController.updateComment); // Update comment
router.delete('/:id', auth, commentController.deleteComment); // Delete comment

module.exports = router;