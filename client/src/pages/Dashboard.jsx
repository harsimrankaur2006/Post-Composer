import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } catch {
      setError('Failed to load posts. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleOpenCreate = () => {
    setEditPost(null);
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditPost(post);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      showToast('Post deleted.');
    } catch {
      showToast('Failed to delete post.', 'error');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditPost(null);
    fetchPosts();
    showToast(editPost ? 'Post updated!' : 'Post created!');
  };

  return (
    <div style={styles.page}>
      <Navbar onCreatePost={handleOpenCreate} />

      <main style={styles.main}>
        {/* Hero banner */}
        <div style={styles.hero}>
          <div>
            <h1 style={{ marginBottom: 6 }}>
              Your <span className="gradient-text">Content Hub</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {posts.length > 0
                ? `${posts.length} post${posts.length !== 1 ? 's' : ''} ready to go`
                : 'Create your first post to get started'}
            </p>
          </div>
          <button
            id="create-post-hero-btn"
            className="btn btn-primary btn-lg"
            onClick={handleOpenCreate}
          >
            + Create Post
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Loading skeleton */}
        {loading && (
          <div style={styles.grid}>
            {[1,2,3].map((i) => (
              <div
                key={i}
                className="glass-card"
                style={{ ...styles.skeleton, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <div style={styles.grid}>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && !error && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✦</div>
            <h2 style={{ marginBottom: 8 }}>No posts yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Create your first post and start composing content for all your platforms.
            </p>
            <button
              id="empty-create-btn"
              className="btn btn-primary btn-lg"
              onClick={handleOpenCreate}
            >
              + Create Your First Post
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <CreatePostModal
          onClose={() => { setShowModal(false); setEditPost(null); }}
          onSaved={handleSaved}
          editPost={editPost}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`alert alert-${toast.type}`}
          style={styles.toast}
        >
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    padding: '32px 24px 64px',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 24,
  },
  skeleton: {
    height: 360,
    animation: 'pulse 1.5s ease infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72, height: 72,
    borderRadius: 20,
    background: 'var(--accent-grad)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', color: '#fff',
    boxShadow: '0 8px 30px rgba(124,58,237,0.35)',
    marginBottom: 24,
  },
  toast: {
    position: 'fixed',
    bottom: 24, right: 24,
    zIndex: 2000,
    minWidth: 240,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'slideUp 0.3s ease',
  },
};
