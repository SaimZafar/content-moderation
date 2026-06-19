import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMySubmissions } from '../api/api';

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

const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
const mono = "'SF Mono','Roboto Mono','Courier New',monospace";

const CATEGORIES = [
  'Graphic Violence', 'Hate Symbols', 'Self-Harm',
  'Extremist Propaganda', 'Weapons & Contraband', 'Harassment & Humiliation',
];

const outcomeColor = (o) =>
  o === 'Blocked' ? C.blocked : o === 'Flagged' ? C.flagged : o === 'Approved' ? C.approved : C.neutral;

const History = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState('All');
  const [category, setCategory] = useState('All');
  const [range, setRange] = useState('All');
  const [expanded, setExpanded] = useState(null);

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

  const inRange = (dateStr) => {
    if (range === 'All') return true;
    const d = new Date(dateStr);
    const now = new Date();
    const days = (now - d) / (1000 * 60 * 60 * 24);
    if (range === 'Today') return d.toDateString() === now.toDateString();
    if (range === '7d') return days <= 7;
    if (range === '30d') return days <= 30;
    return true;
  };

  const hasCategory = (s) =>
    category === 'All' ||
    s.verdicts?.some(v => v.categoryBreakdown?.some(c => c.category === category && c.result === 'unsafe'));

  const filtered = submissions.filter(s =>
    (outcome === 'All' || s.overallOutcome === outcome) &&
    hasCategory(s) &&
    inRange(s.createdAt)
  );

  const Pill = ({ active, label, onClick, color }) => (
    <button
      onClick={onClick}
      style={{
        ...styles.pill,
        backgroundColor: active ? (color ? `${color}22` : '#222') : 'transparent',
        borderColor: active ? (color || '#3a3a3a') : C.border,
        color: active ? (color || C.text) : C.textDim,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>AUDIT TRAIL</p>
          <h1 style={styles.heading}>History</h1>
          <p style={styles.sub}>Every submission you have made, with full verdict records.</p>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>OUTCOME</span>
            <div style={styles.pillRow}>
              {['All', 'Approved', 'Flagged', 'Blocked'].map(o => (
                <Pill key={o} label={o} active={outcome === o} onClick={() => setOutcome(o)}
                  color={o === 'All' ? null : outcomeColor(o)} />
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>PERIOD</span>
            <div style={styles.pillRow}>
              {[['All', 'All time'], ['Today', 'Today'], ['7d', 'Last 7d'], ['30d', 'Last 30d']].map(([v, l]) => (
                <Pill key={v} label={l} active={range === v} onClick={() => setRange(v)} />
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>FLAGGED CATEGORY</span>
            <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={styles.resultMeta}>
          {loading ? 'Loading...' : `${filtered.length} submission${filtered.length === 1 ? '' : 's'}`}
        </div>

        {/* List */}
        {!loading && filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.empty}>No submissions match these filters.</p>
            <Link to="/submit" style={styles.emptyLink}>Submit an image</Link>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map((s, idx) => {
              const open = expanded === s._id;
              return (
                <div key={s._id} style={{ ...styles.row, borderLeftColor: outcomeColor(s.overallOutcome) }}>
                  <div style={styles.rowHead} onClick={() => setExpanded(open ? null : s._id)}>
                    <div style={styles.rowLeft}>
                      <span style={styles.rowIndex}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{ ...styles.rowDot, backgroundColor: outcomeColor(s.overallOutcome) }} />
                      <div style={styles.rowText}>
                        <span style={{ ...styles.rowOutcome, color: outcomeColor(s.overallOutcome) }}>{s.overallOutcome}</span>
                        <span style={styles.rowMeta}>{s.verdicts?.length || 0} image{(s.verdicts?.length || 0) === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                    <div style={styles.rowRight}>
                      <span style={styles.rowDate}>
                        {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ ...styles.chevron, transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                    </div>
                  </div>

                  {open && (
                    <div style={styles.expand}>
                      {s.verdicts.map((v, vi) => (
                        <div key={vi} style={styles.verdict}>
                          <div style={styles.verdictHead}>
                            <img src={`${API_ORIGIN}${v.imageUrl}`} alt={`v ${vi}`} style={styles.thumb} />
                            <div>
                              <span style={styles.vIndex}>IMAGE {String(vi + 1).padStart(2, '0')}</span>
                              <div style={{ ...styles.vOutcome, color: outcomeColor(v.outcome) }}>{v.outcome}</div>
                            </div>
                          </div>
                          <div style={styles.catList}>
                            {v.categoryBreakdown.map((c, ci) => {
                              const unsafe = c.result === 'unsafe';
                              return (
                                <div key={ci} style={styles.catItem}>
                                  <span style={styles.catName}>{c.category}</span>
                                  <span style={{ ...styles.catVal, color: unsafe ? C.blocked : C.textDim }}>
                                    {c.result} · {c.confidence}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
  content: { position: 'relative', zIndex: 2, maxWidth: '820px', margin: '0 auto', padding: '56px 32px 80px' },
  header: { marginBottom: '32px' },
  eyebrow: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: C.textFaint, marginBottom: '14px' },
  heading: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '10px' },
  sub: { fontSize: '13px', color: C.textDim, lineHeight: 1.7 },
  filters: {
    display: 'flex', flexWrap: 'wrap', gap: '24px',
    padding: '22px', backgroundColor: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '10px', backdropFilter: 'blur(8px)', marginBottom: '20px',
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  filterLabel: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.1em', color: C.textFaint },
  pillRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  pill: {
    border: '1px solid', borderRadius: '20px', padding: '6px 13px', fontSize: '12px',
    cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
  },
  select: {
    backgroundColor: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '6px',
    padding: '8px 12px', color: C.text, fontSize: '13px', outline: 'none', minWidth: '200px',
  },
  resultMeta: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: '3px solid #f0f0f0',
    borderRadius: '6px', overflow: 'hidden', backdropFilter: 'blur(8px)',
  },
  rowHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  rowIndex: { fontFamily: mono, fontSize: '11px', color: C.textFaint },
  rowDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  rowText: { display: 'flex', flexDirection: 'column', gap: '3px' },
  rowOutcome: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600 },
  rowMeta: { fontSize: '12px', color: C.textDim },
  rowRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  rowDate: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.04em' },
  chevron: { color: C.textDim, fontSize: '18px', transition: 'transform 0.2s', display: 'inline-block' },
  expand: { borderTop: `1px solid ${C.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  verdict: { display: 'flex', flexDirection: 'column', gap: '14px' },
  verdictHead: { display: 'flex', alignItems: 'center', gap: '14px' },
  thumb: { width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${C.border}` },
  vIndex: { fontFamily: mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' },
  vOutcome: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, marginTop: '3px' },
  catList: { display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' },
  catItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid #181818`, paddingBottom: '8px' },
  catName: { fontSize: '13px', color: C.text },
  catVal: { fontFamily: mono, fontSize: '11px', letterSpacing: '0.03em', textTransform: 'uppercase' },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    padding: '52px', border: `1px dashed ${C.border}`, borderRadius: '10px', backgroundColor: 'rgba(15,15,15,0.4)',
  },
  empty: { fontSize: '13px', color: C.textDim },
  emptyLink: { fontSize: '13px', color: C.text, textDecoration: 'none', borderBottom: `1px solid ${C.neutral}`, paddingBottom: '2px' },
};

export default History;