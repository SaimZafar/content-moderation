import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics } from '../api/api';
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

const mono = "'SF Mono','Roboto Mono','Courier New',monospace";
const toMap = (arr) => (arr || []).reduce((acc, x) => { acc[x._id] = x.count; return acc; }, {});

const AnimatedNumber = ({ value, duration = 850 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const verdicts = toMap(data?.verdictDistribution);
  const appeals = toMap(data?.appealStats);
  const totalSubs = data?.totalSubmissions || 0;
  const pending = appeals.Pending || 0;
  const totalAppeals = Object.values(appeals).reduce((a, b) => a + b, 0);
  const approvalRate = totalSubs ? Math.round(((verdicts.Approved || 0) / totalSubs) * 100) : 0;

  const stats = [
    { label: 'Pending appeals', value: pending, color: C.flagged },
    { label: 'Total submissions', value: totalSubs, color: C.neutral },
    { label: 'Total appeals', value: totalAppeals, color: C.approved },
    { label: 'Approval rate', value: approvalRate, suffix: '%', color: C.approved },
  ];

  const actions = [
    { to: '/admin/appeals', title: 'Review appeals', desc: 'Work through the pending queue and resolve disputes.', badge: pending > 0 ? pending : null, color: C.flagged },
    { to: '/admin/policies', title: 'Configure policies', desc: 'Tune thresholds and enforcement per category.', color: C.neutral },
    { to: '/admin/analytics', title: 'View analytics', desc: 'Volume trends, verdict split, and top users.', color: C.approved },
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
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.statusBar}>
          <div style={styles.statusLeft}>
            <span style={styles.liveDot} />
            <span style={styles.statusText}>Admin session active</span>
          </div>
          <span style={styles.statusRole}>{user?.email}</span>
        </div>

        <div style={styles.header}>
          <p style={styles.eyebrow}>CONTROL CENTER</p>
          <h1 style={styles.heading}>Admin overview</h1>
          <p style={styles.sub}>Platform health and everything that needs your attention.</p>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...styles.statCard, borderTop: `2px solid ${s.color}` }}>
              <div style={styles.statTop}>
                <span style={{ ...styles.statDot, backgroundColor: s.color }} />
                <span style={styles.statLabel}>{s.label}</span>
              </div>
              <span style={styles.statValue}>
                {loading ? '·' : <><AnimatedNumber value={s.value} />{s.suffix || ''}</>}
              </span>
            </div>
          ))}
        </div>

        {pending > 0 && (
          <Link to="/admin/appeals" style={styles.alert}>
            <span style={styles.alertDot} />
            <span style={styles.alertText}>
              {pending} appeal{pending === 1 ? '' : 's'} waiting for review
            </span>
            <span style={styles.alertArrow}>›</span>
          </Link>
        )}

        <h2 style={styles.sectionTitle}>Quick actions</h2>
        <div style={styles.actionGrid}>
          {actions.map((a, i) => (
            <Link
              key={i}
              to={a.to}
              style={styles.actionCard}
              onMouseEnter={(e) => cardEnter(e, a.color)}
              onMouseLeave={cardLeave}
            >
              <div style={styles.actionTop}>
                <span style={{ ...styles.actionDot, backgroundColor: a.color }} />
                {a.badge != null && <span style={styles.actionBadge}>{a.badge}</span>}
              </div>
              <div style={styles.actionTitle}>{a.title}</div>
              <div style={styles.actionDesc}>{a.desc}</div>
              <div style={styles.actionGo}>Open →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { position: 'relative', minHeight: 'calc(100vh - 56px)', backgroundColor: C.bg, overflow: 'hidden' },
  glow: {
    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
    width: '700px', height: '500px',
    background: 'radial-gradient(circle, rgba(60,60,60,0.18) 0%, transparent 70%)', pointerEvents: 'none',
  },
  content: { position: 'relative', zIndex: 2, maxWidth: '920px', margin: '0 auto', padding: '32px 32px 80px' },
  statusBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '40px' },
  statusLeft: { display: 'flex', alignItems: 'center', gap: '9px' },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.approved, boxShadow: `0 0 8px ${C.approved}` },
  statusText: { fontFamily: mono, fontSize: '11px', color: C.textDim, letterSpacing: '0.04em' },
  statusRole: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.04em' },
  header: { marginBottom: '40px' },
  eyebrow: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: C.textFaint, marginBottom: '16px' },
  heading: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '40px', fontWeight: 700, letterSpacing: '-0.035em', color: C.text, lineHeight: 1.05, marginBottom: '12px' },
  sub: { fontSize: '13px', color: C.textDim },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
    padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: '20px', backdropFilter: 'blur(8px)',
  },
  statTop: { display: 'flex', alignItems: 'center', gap: '9px' },
  statDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  statLabel: { fontSize: '11px', color: C.textDim, letterSpacing: '0.05em', textTransform: 'uppercase' },
  statValue: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '38px', fontWeight: 700, color: C.text, letterSpacing: '-0.03em', lineHeight: 1 },
  alert: {
    display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none',
    backgroundColor: `${C.flagged}14`, border: `1px solid ${C.flagged}55`, borderRadius: '8px',
    padding: '14px 18px', marginBottom: '40px',
  },
  alertDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.flagged, boxShadow: `0 0 8px ${C.flagged}` },
  alertText: { flex: 1, fontSize: '13px', color: C.flagged, fontWeight: 500 },
  alertArrow: { color: C.flagged, fontSize: '18px' },
  sectionTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '18px' },
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
  actionCard: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
    padding: '22px', textDecoration: 'none', backdropFilter: 'blur(8px)',
    display: 'flex', flexDirection: 'column', gap: '12px',
    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
  },
  actionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px' },
  actionDot: { width: '8px', height: '8px', borderRadius: '50%' },
  actionBadge: {
    fontFamily: mono, fontSize: '11px', fontWeight: 600, color: C.flagged,
    backgroundColor: `${C.flagged}1f`, border: `1px solid ${C.flagged}55`,
    borderRadius: '12px', padding: '2px 9px',
  },
  actionTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600, color: C.text },
  actionDesc: { fontSize: '12px', color: C.textDim, lineHeight: 1.6, flex: 1 },
  actionGo: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.04em' },
};

export default AdminDashboard;