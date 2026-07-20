import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const ALL_PLATFORMS = ['Twitter/X', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'];

const PLATFORM_KEYS = {
  'Twitter/X': 'twitter',
  'Instagram': 'instagram',
  'LinkedIn':  'linkedin',
  'Facebook':  'facebook',
  'TikTok':    'tiktok',
  'YouTube':   'youtube',
};

export default function CreatePostModal({ onClose, onSaved, editPost }) {
  const isEdit = Boolean(editPost);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    platforms: [],
    description: '',
    scheduleDate: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editPost) {
      setForm({
        title: editPost.title || '',
        platforms: editPost.platforms || [],
        description: editPost.description || '',
        scheduleDate: editPost.scheduleDate
          ? new Date(editPost.scheduleDate).toISOString().slice(0, 16)
          : '',
      });
      if (editPost.media?.url) {
        setPreview({ url: editPost.media.url, type: editPost.media.resourceType });
      }
    }
  }, [editPost]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const togglePlatform = (platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    const type = f.type.startsWith('video') ? 'video' : 'image';
    setPreview({ url, type });
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview({ url, type: f.type.startsWith('video') ? 'video' : 'image' });
    }
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!isEdit && !file) return 'Please upload a media file.';
    if (form.platforms.length === 0) return 'Select at least one platform.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('platforms', JSON.stringify(form.platforms));
      formData.append('description', form.description);
      if (form.scheduleDate) formData.append('scheduleDate', form.scheduleDate);
      if (file) formData.append('media', file);

      if (isEdit) {
        await api.put(`/posts/${editPost._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>{isEdit ? '✏ Edit Post' : '✦ New Post'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 2 }}>
              {isEdit ? 'Update your post details' : 'Fill in the details for your post'}
            </p>
          </div>
          <button
            id="close-modal-btn"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠ {error}</div>}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="post-title">
                Title <span className="required">*</span>
              </label>
              <input
                id="post-title"
                className="form-input"
                name="title"
                placeholder="Your post headline…"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Media Upload */}
            <div className="form-group">
              <label className="form-label">
                Media {!isEdit && <span className="required">*</span>}
                {isEdit && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (leave empty to keep existing)</span>}
              </label>

              {/* Drop zone */}
              <div
                id="media-dropzone"
                style={{
                  ...styles.dropzone,
                  borderColor: preview ? 'var(--accent-2)' : 'var(--glass-border)',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {preview ? (
                  preview.type === 'video' ? (
                    <video src={preview.url} style={styles.previewMedia} controls />
                  ) : (
                    <img src={preview.url} alt="preview" style={styles.previewMedia} />
                  )
                ) : (
                  <div style={styles.dropPlaceholder}>
                    <div style={styles.dropIcon}>☁</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                      Click or drag & drop to upload
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                      JPEG, PNG, GIF, WEBP, MP4, MOV — max 50MB
                    </p>
                  </div>
                )}
              </div>
              <input
                id="media-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Platforms */}
            <div className="form-group">
              <label className="form-label">
                Platforms <span className="required">*</span>
              </label>
              <div style={styles.platformGrid}>
                {ALL_PLATFORMS.map((p) => {
                  const selected = form.platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      id={`platform-${p.toLowerCase().replace('/', '-')}`}
                      onClick={() => togglePlatform(p)}
                      style={{
                        ...styles.platformBtn,
                        background: selected
                          ? 'rgba(124,58,237,0.2)'
                          : 'rgba(255,255,255,0.03)',
                        borderColor: selected
                          ? 'var(--accent-2)'
                          : 'var(--glass-border)',
                        color: selected ? 'var(--accent-2)' : 'var(--text-secondary)',
                      }}
                    >
                      {selected ? '✓ ' : ''}{p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="post-description">Description</label>
              <textarea
                id="post-description"
                className="form-textarea"
                name="description"
                placeholder="Add caption or context for this post…"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Schedule */}
            <div className="form-group">
              <label className="form-label" htmlFor="post-schedule">Post Schedule</label>
              <input
                id="post-schedule"
                className="form-input"
                type="datetime-local"
                name="scheduleDate"
                value={form.scheduleDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              id="cancel-post-btn"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-post-btn"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : null}
              {loading
                ? isEdit ? 'Saving…' : 'Publishing…'
                : isEdit ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  dropzone: {
    border: '2px dashed',
    borderRadius: 'var(--radius-md)',
    padding: 16,
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease',
    minHeight: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dropPlaceholder: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  dropIcon: {
    fontSize: '2rem',
    lineHeight: 1,
    marginBottom: 4,
    color: 'var(--text-muted)',
  },
  previewMedia: {
    width: '100%',
    maxHeight: 220,
    objectFit: 'contain',
    borderRadius: 8,
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  platformBtn: {
    padding: '8px 4px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
};
