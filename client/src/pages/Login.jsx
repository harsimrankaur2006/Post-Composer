import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>✦</div>
          <span style={styles.logoText} className="gradient-text">Post Composer</span>
        </div>

        <div className="glass-card" style={styles.card}>
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Sign in to manage your posts
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginTop: 16 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', top: '-10%', left: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-15%', right: '-10%',
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
    position: 'relative', zIndex: 1,
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: 'var(--accent-grad)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: '#fff', fontWeight: 700,
    boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
  },
  logoText: {
    fontSize: '1.3rem', fontWeight: 800,
  },
  card: {
    width: '100%', padding: '32px',
  },
  heading: {
    fontSize: '1.6rem', fontWeight: 700,
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24,
  },
  footer: {
    marginTop: 20, textAlign: 'center', fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent-2)', textDecoration: 'none', fontWeight: 600,
  },
};
