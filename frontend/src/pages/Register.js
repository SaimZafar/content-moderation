import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const NodeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(180, 180, 180, ${(1 - dist / 140) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.fill();
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerAPI(form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focused === name ? '#f0f0f0' : '#2a2a2a',
    boxShadow: focused === name ? '0 0 0 1px rgba(240,240,240,0.1)' : 'none',
  });

  return (
    <div style={styles.container}>
      <NodeCanvas />

      <div style={styles.topBar}>
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>MODGUARD</span>
        </div>
        <div style={styles.statusRow}>
          <div style={styles.statusDot} />
          <span style={styles.statusText}>System operational</span>
        </div>
      </div>

      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <p style={styles.eyebrow}>NEW ACCOUNT</p>
            <h1 style={styles.heading}>Create account</h1>
            <p style={styles.sub}>Start moderating in minutes</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('name')}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onFocus={() => setFocused('role')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('role')}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                style={inputStyle('email')}
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                style={inputStyle('password')}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorDot} />
                {error}
              </div>
            )}

            <button
              type="submit"
              style={styles.btn}
              disabled={loading}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d0d0d0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>have an account?</span>
            <div style={styles.dividerLine} />
          </div>

          <Link
            to="/login"
            style={styles.loginBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.color = '#f0f0f0'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666'; }}
          >
            Sign in instead
          </Link>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statNum}>6</span>
            <span style={styles.statLabel}>Categories</span>
          </div>
          <div style={styles.statDiv} />
          <div style={styles.stat}>
            <span style={styles.statNum}>AI</span>
            <span style={styles.statLabel}>Powered</span>
          </div>
          <div style={styles.statDiv} />
          <div style={styles.stat}>
            <span style={styles.statNum}>RT</span>
            <span style={styles.statLabel}>Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #1a1a1a',
    backgroundColor: 'rgba(10,10,10,0.8)',
    backdropFilter: 'blur(10px)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#f0f0f0',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    boxShadow: '0 0 8px #f0f0f0',
  },
  statusText: {
    fontSize: '11px',
    color: '#444',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  center: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  card: {
    width: '440px',
    backgroundColor: 'rgba(12,12,12,0.85)',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
  },
  cardTop: {
    marginBottom: '28px',
  },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '0.14em',
    color: '#444',
    marginBottom: '10px',
  },
  heading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '30px',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: '#f0f0f0',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '13px',
    color: '#555',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    flex: 1,
  },
  label: {
    fontSize: '11px',
    color: '#555',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '4px',
    padding: '11px 14px',
    color: '#f0f0f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    width: '100%',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#1a0000',
    border: '1px solid #3a0000',
    borderLeft: '3px solid #ff3333',
    borderRadius: '4px',
    padding: '10px 14px',
    fontSize: '12px',
    color: '#ff6666',
  },
  errorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ff3333',
    flexShrink: 0,
  },
  btn: {
    backgroundColor: '#f0f0f0',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '4px',
    padding: '13px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.04em',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'background-color 0.15s',
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#1e1e1e',
  },
  dividerText: {
    fontSize: '11px',
    color: '#333',
    letterSpacing: '0.06em',
  },
  loginBtn: {
    display: 'block',
    textAlign: 'center',
    border: '1px solid #2a2a2a',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '13px',
    color: '#666',
    textDecoration: 'none',
    transition: 'all 0.15s',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    backgroundColor: 'rgba(12,12,12,0.7)',
    border: '1px solid #1a1a1a',
    borderRadius: '6px',
    padding: '16px 32px',
    backdropFilter: 'blur(10px)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: '#f0f0f0',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '10px',
    color: '#444',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  statDiv: {
    width: '1px',
    height: '28px',
    backgroundColor: '#2a2a2a',
  },
};

export default Register;