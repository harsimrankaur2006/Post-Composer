import { useNavigate } from 'react-router-dom';

const PLATFORM_ICONS = {
  'Twitter/X': '𝕏',
  'Instagram': '📸',
  'LinkedIn':  '💼',
  'Facebook':  '👥',
  'TikTok':    '🎵',
  'YouTube':   '▶',
};

const PLATFORM_KEYS = {
  'Twitter/X': 'twitter',
  'Instagram': 'instagram',
  'LinkedIn':  'linkedin',
  'Facebook':  'facebook',
  'TikTok':    'tiktok',
  'YouTube':   'youtube',
};

export default function Navbar({ onCreatePost }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>✦</div>
          <span className="gradient-text" style={styles.logoText}>Post Composer</span>
        </div>

        {/* Right side */}
        <div style={styles.right}>
          <span style={styles.greeting}>Hi, <strong>{user.username || 'there'}</strong> 👋</span>
          <button
            id="create-post-nav-btn"
            className="btn btn-primary"
            onClick={onCreatePost}
          >
            + New Post
          </button>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,10,18,0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--glass-border)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--accent-grad)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, color: '#fff', fontWeight: 700,
    boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
  },
  logoText: { fontSize: '1.1rem', fontWeight: 800 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  greeting: { fontSize: '0.875rem', color: 'var(--text-secondary)' },
};
