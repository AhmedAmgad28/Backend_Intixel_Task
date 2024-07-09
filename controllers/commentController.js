// controllers/commentController.js
const Comment = require('../models/comment');

// Create a comment
exports.createComment = async (req, res) => {
  const { eventID, commentText } = req.body;

  try {
    const newComment = new Comment({
      userID: req.user.id,
      eventID,
      commentText
    });

    const comment = await newComment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get comments by event ID
exports.getCommentsByEventId = async (req, res) => {
  try {
    const comments = await Comment.find({ eventID: req.params.eventID }).populate('userID', 'name');

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  const { commentText } = req.body;

  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.userID.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    comment.commentText = commentText || comment.commentText;

    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.userID.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.remove();
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
