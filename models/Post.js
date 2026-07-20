const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    media: {
      url: {
        type: String,
        required: [true, 'Media is required'],
      },
      publicId: {
        type: String, // Cloudinary public_id (for deletion)
        default: '',
      },
      resourceType: {
        type: String,
        default: 'image',
      },
    },
    platforms: {
      type: [String],
      required: [true, 'At least one platform is required'],
      enum: ['Twitter/X', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'],
    },
    description: {
      type: String,
      default: '',
    },
    scheduleDate: {
      type: Date,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
