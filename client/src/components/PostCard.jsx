const PLATFORM_KEYS = {
  'Twitter/X': 'twitter',
  'Instagram': 'instagram',
  'LinkedIn':  'linkedin',
  'Facebook':  'facebook',
  'TikTok':    'tiktok',
  'YouTube':   'youtube',
};

const PLATFORM_ICONS = {
  'Twitter/X': '𝕏',
  'Instagram': '📸',
  'LinkedIn':  '💼',
  'Facebook':  '👥',
  'TikTok':    '🎵',
  'YouTube':   '▶',
};

export default function PostCard({ post, onEdit, onDelete }) {
  const isVideo = post.media?.resourceType === 'video';

  const formattedDate = post.scheduleDate
    ? new Date(post.scheduleDate).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  const createdAt = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="glass-card" style={styles.card}>
      {/* Media */}
      <div style={styles.mediaWrap}>
        {isVideo ? (
          <video
            src={post.media?.url}
            style={styles.media}
            controls
            preload="metadata"
          />
        ) : (
          <img
            src={post.media?.url}
            alt={post.title}
            style={styles.media}
            loading="lazy"
          />
        )}
        {/* Type pill */}
        <div style={styles.typePill}>
          {isVideo ? '🎬 Video' : '🖼 Image'}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.title}>{post.title}</h3>

        {post.description && (
          <p style={styles.description}>{post.description}</p>
        )}

        {/* Platforms */}
        <div style={styles.platforms}>
          {post.platforms?.map((p) => (
            <span
              key={p}
              className={`platform-badge ${PLATFORM_KEYS[p] || ''}`}
            >
              {PLATFORM_ICONS[p] || '📌'} {p}
            </span>
          ))}
        </div>

        {/* Schedule / Created */}
        <div style={styles.meta}>
          {formattedDate ? (
            <span style={styles.schedulePill}>
              🕐 {formattedDate}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Created {createdAt}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          id={`edit-post-${post._id}`}
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(post)}
          style={{ flex: 1 }}
        >
          ✏ Edit
        </button>
        <button
          id={`delete-post-${post._id}`}
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(post._id)}
          style={{ flex: 1 }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  mediaWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    borderRadius: '16px 16px 0 0',
    background: 'var(--bg-elevated)',
  },
  media: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  typePill: {
    position: 'absolute', top: 10, right: 10,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  content: {
    padding: '16px 16px 12px',
    display: 'flex', flexDirection: 'column', gap: 10, flex: 1,
  },
  title: {
    fontSize: '1rem', fontWeight: 700,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  description: {
    fontSize: '0.83rem',
    color: 'var(--text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.5,
  },
  platforms: {
    display: 'flex', flexWrap: 'wrap', gap: 6,
  },
  meta: {
    marginTop: 4,
  },
  schedulePill: {
    display: 'inline-block',
    fontSize: '0.78rem',
    color: 'var(--accent-2)',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 20,
    padding: '2px 10px',
    fontWeight: 500,
  },
  actions: {
    display: 'flex', gap: 8, padding: '0 16px 16px',
  },
};
