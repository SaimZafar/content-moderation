import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMySubmissions } from '../api/api';
import { useAuth } from '../context/AuthContext';

const C = {
  bg: '#080808',
  surface: 'rgba(20,20,20,0.7)',
  border: '#242424',
  text: '#ededed',
  textDim: '#8a8a8a',
  textFaint: '#5e5e5e',
  approved: '#3fb950',
  flagged: '#d29922',
  blocked: '#f85149',
  neutral: '#6e7681',
};

const NodeCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(150,150,150,${(1 - d / 130) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,180,180,0.35)';
        ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

const AnimatedNumber = ({ value, duration = 850 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMySubmissions();
        setSubmissions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const counts = submissions.reduce(
    (acc, s) => {
      acc.total += 1;
      if (s.overallOutcome === 'Approved') acc.approved += 1;
      if (s.overallOutcome === 'Flagged') acc.flagged += 1;
      if (s.overallOutcome === 'Blocked') acc.blocked += 1;
      return acc;
    },
    { total: 0, approved: 0, flagged: 0, blocked: 0 }
  );

  const recent = submissions.slice(0, 5);

  const outcomeColor = (o) =>
    o === 'Blocked' ? C.blocked : o === 'Flagged' ? C.flagged : o === 'Approved' ? C.approved : C.neutral;

  const stats = [
    { label: 'Total', value: counts.total, color: C.neutral },
    { label: 'Approved', value: counts.approved, color: C.approved },
    { label: 'Flagged', value: counts.flagged, color: C.flagged },
    { label: 'Blocked', value: counts.blocked, color: C.blocked },
  ];

  const cardEnter = (e, color) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.borderColor = color;
    e.currentTarget.style.boxShadow = `0 8px 30px -12px ${color}55`;
  };
  const cardLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderColor = C.border;
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={styles.page}>
      <NodeCanvas />
      <div style={styles.glow} />

      <div style={styles.content}>
        <div style={styles.statusBar}>
          <div style={styles.statusLeft}>
            <span style={styles.liveDot} />
            <span style={styles.statusText}>Session active</span>
          </div>
          <span style={styles.statusTime}>
            {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
            {'  /  '}
            {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div style={styles.header}>
          <p style={styles.eyebrow}>WORKSPACE</p>
          <h1 style={styles.heading}>
            Welcome back,<br />
            <span style={styles.headingName}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={styles.sub}>Your moderation activity at a glance</p>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{ ...styles.statCard, borderTop: `2px solid ${s.color}` }}
              onMouseEnter={(e) => cardEnter(e, s.color)}
              onMouseLeave={cardLeave}
            >
              <div style={styles.statTop}>
                <span style={{ ...styles.statDot, backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                <span style={styles.statLabel}>{s.label}</span>
              </div>
              <span style={styles.statValue}>
                {loading ? '·' : <AnimatedNumber value={s.value} />}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.actionsRow}>
          <Link
            to="/submit"
            style={styles.primaryAction}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.text; }}
          >
            Submit images
          </Link>
          <Link
            to="/history"
            style={styles.secondaryAction}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
          >
            View history
          </Link>
          <Link
            to="/appeals"
            style={styles.secondaryAction}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
          >
            My appeals
          </Link>
        </div>

        <div style={styles.recentBlock}>
          <div style={styles.recentHeader}>
            <h2 style={styles.recentTitle}>Recent submissions</h2>
            <Link to="/history" style={styles.viewAll}>View all</Link>
          </div>

          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : recent.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.empty}>No submissions yet.</p>
              <Link to="/submit" style={styles.emptyLink}>Submit your first image</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {recent.map((s, idx) => (
                <div
                  key={s._id}
                  style={{ ...styles.listItem, borderLeftColor: outcomeColor(s.overallOutcome) }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.7)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.surface; }}
                >
                  <div style={styles.listLeft}>
                    <span style={styles.listIndex}>{String(idx + 1).padStart(2, '0')}</span>
                    <span style={{ ...styles.listDot, backgroundColor: outcomeColor(s.overallOutcome) }} />
                    <div style={styles.listText}>
                      <span style={{ ...styles.listOutcome, color: outcomeColor(s.overallOutcome) }}>
                        {s.overallOutcome}
                      </span>
                      <span style={styles.listMeta}>
                        {s.verdicts?.length || 0} image{(s.verdicts?.length || 0) === 1 ? '' : 's'} screened
                      </span>
                    </div>
                  </div>
                  <span style={styles.listDate}>
                    {new Date(s.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mono = "'SF Mono','Roboto Mono','Courier New',monospace";

const styles = {
  page: {
    position: 'relative',
    minHeight: 'calc(100vh - 56px)',
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '700px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(60,60,60,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '920px',
    margin: '0 auto',
    padding: '32px 32px 80px',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '40px',
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: C.approved,
    boxShadow: `0 0 8px ${C.approved}`,
  },
  statusText: {
    fontFamily: mono,
    fontSize: '11px',
    color: C.textDim,
    letterSpacing: '0.04em',
  },
  statusTime: {
    fontFamily: mono,
    fontSize: '11px',
    color: C.textFaint,
    letterSpacing: '0.06em',
  },
  header: {
    marginBottom: '44px',
  },
  eyebrow: {
    fontFamily: mono,
    fontSize: '10px',
    letterSpacing: '0.18em',
    color: C.textFaint,
    marginBottom: '16px',
  },
  heading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '44px',
    fontWeight: 700,
    letterSpacing: '-0.035em',
    color: C.text,
    lineHeight: 1.05,
    marginBottom: '14px',
  },
  headingName: {
    color: C.textFaint,
  },
  sub: {
    fontSize: '13px',
    color: C.textDim,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '20px 22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
    cursor: 'default',
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },
  statDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '11px',
    color: C.textDim,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '40px',
    fontWeight: 700,
    color: C.text,
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  actionsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '56px',
  },
  primaryAction: {
    backgroundColor: C.text,
    color: '#0a0a0a',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.03em',
    transition: 'background-color 0.15s',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    color: C.textDim,
    padding: '12px 24px',
    borderRadius: '6px',
    border: `1px solid ${C.border}`,
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.03em',
    transition: 'all 0.15s',
  },
  recentBlock: {},
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '20px',
  },
  recentTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: C.text,
    letterSpacing: '-0.01em',
  },
  viewAll: {
    fontSize: '12px',
    color: C.textDim,
    textDecoration: 'none',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderLeft: '3px solid #f0f0f0',
    borderRadius: '6px',
    padding: '16px 20px',
    backdropFilter: 'blur(8px)',
    transition: 'background-color 0.15s',
  },
  listLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  listIndex: {
    fontFamily: mono,
    fontSize: '11px',
    color: C.textFaint,
  },
  listDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  listText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  listOutcome: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
  },
  listMeta: {
    fontSize: '12px',
    color: C.textDim,
  },
  listDate: {
    fontFamily: mono,
    fontSize: '11px',
    color: C.textFaint,
    letterSpacing: '0.04em',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '52px',
    border: `1px dashed ${C.border}`,
    borderRadius: '10px',
    backgroundColor: 'rgba(15,15,15,0.4)',
  },
  empty: {
    fontSize: '13px',
    color: C.textDim,
  },
  emptyLink: {
    fontSize: '13px',
    color: C.text,
    textDecoration: 'none',
    borderBottom: `1px solid ${C.neutral}`,
    paddingBottom: '2px',
  },
};

export default Dashboard;