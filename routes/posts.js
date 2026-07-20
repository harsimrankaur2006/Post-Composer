const express = require('express');
const multer = require('multer');
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer: store file in memory, then stream to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF, WEBP) and videos (MP4, MOV) are allowed'));
    }
  },
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video') ? 'video' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'post-composer', resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @route   GET /api/posts
// @desc    Get all posts for the logged-in user
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a new post (with Cloudinary media upload)
// @access  Protected
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { title, platforms, description, scheduleDate } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!req.file) return res.status(400).json({ message: 'Media file is required' });
    if (!platforms) return res.status(400).json({ message: 'At least one platform is required' });

    // Parse platforms (sent as JSON string or comma-separated from FormData)
    let platformsArray;
    try {
      platformsArray = JSON.parse(platforms);
    } catch {
      platformsArray = platforms.split(',').map((p) => p.trim());
    }

    if (!platformsArray.length) {
      return res.status(400).json({ message: 'At least one platform is required' });
    }

    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    const post = await Post.create({
      title,
      media: {
        url: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        resourceType: cloudResult.resource_type,
      },
      platforms: platformsArray,
      description: description || '',
      scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
      author: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post (optionally replace media)
// @access  Protected
router.put('/:id', protect, upload.single('media'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, platforms, description, scheduleDate } = req.body;

    if (title) post.title = title;
    if (description !== undefined) post.description = description;
    if (scheduleDate !== undefined) post.scheduleDate = scheduleDate ? new Date(scheduleDate) : null;

    if (platforms) {
      let platformsArray;
      try {
        platformsArray = JSON.parse(platforms);
      } catch {
        platformsArray = platforms.split(',').map((p) => p.trim());
      }
      post.platforms = platformsArray;
    }

    // If a new media file is uploaded, delete old one from Cloudinary and upload new
    if (req.file) {
      if (post.media.publicId) {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.resourceType,
        });
      }
      const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      post.media = {
        url: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        resourceType: cloudResult.resource_type,
      };
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post and remove its media from Cloudinary
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete media from Cloudinary
    if (post.media.publicId) {
      await cloudinary.uploader.destroy(post.media.publicId, {
        resource_type: post.media.resourceType,
      });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
