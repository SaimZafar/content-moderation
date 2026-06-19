import React, { useState, useEffect } from 'react';
import { getAppealsQueue, resolveAppeal } from '../api/api';

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

const outcomeColor = (o) =>
  o === 'Blocked' ? C.blocked : o === 'Flagged' ? C.flagged : o === 'Approved' ? C.approved : C.neutral;

const AdminAppeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await getAppealsQueue();
      setAppeals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id, status) => {
    setProcessing(id);
    setError('');
    try {
      await resolveAppeal(id, { status, adminResponse: responses[id] || '' });
      setAppeals(prev => prev.filter(a => a._id !== id));
      setResponses(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve appeal.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>ADMIN · QUEUE</p>
          <h1 style={styles.heading}>Appeal review</h1>
          <p style={styles.sub}>Pending appeals awaiting a decision. Accepting overrides the verdict to Approved.</p>
        </div>

        {error && (
          <div style={styles.errorBox}><span style={styles.errorDot} />{error}</div>
        )}

        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : appeals.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.empty}>The queue is clear. No appeals pending review.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {appeals.map((a) => {
              const sub = a.submissionId;
              const outcome = sub?.overallOutcome || 'Unknown';
              return (
                <div key={a._id} style={{ ...styles.card, borderLeftColor: outcomeColor(outcome) }}>
                  <div style={styles.cardTop}>
                    <div style={styles.userBlock}>
                      <div style={styles.avatar}>{a.userId?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                      <div>
                        <div style={styles.userName}>{a.userId?.name || 'Unknown user'}</div>
                        <div style={styles.userEmail}>{a.userId?.email || ''}</div>
                      </div>
                    </div>
                    <div style={{ ...styles.outcomeBadge, color: outcomeColor(outcome), borderColor: outcomeColor(outcome) }}>
                      <span style={{ ...styles.dot, backgroundColor: outcomeColor(outcome) }} />
                      {outcome}
                    </div>
                  </div>

                  {sub?.verdicts?.length > 0 && (
                    <div style={styles.thumbRow}>
                      {sub.verdicts.map((v, vi) => (
                        <img key={vi} src={`${API_ORIGIN}${v.imageUrl}`} alt={`v ${vi}`} style={styles.thumb} />
                      ))}
                    </div>
                  )}

                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>JUSTIFICATION</span>
                    <p style={styles.fieldText}>{a.justification}</p>
                  </div>

                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>RESPONSE (OPTIONAL)</span>
                    <textarea
                      style={styles.textarea}
                      rows={3}
                      placeholder="Add a note explaining your decision..."
                      value={responses[a._id] || ''}
                      onChange={(e) => setResponses(prev => ({ ...prev, [a._id]: e.target.value }))}
                    />
                  </div>

                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.acceptBtn, opacity: processing === a._id ? 0.5 : 1 }}
                      onClick={() => resolve(a._id, 'Accepted')}
                      disabled={processing === a._id}
                    >
                      {processing === a._id ? 'Working...' : 'Accept · override to Approved'}
                    </button>
                    <button
                      style={{ ...styles.rejectBtn, opacity: processing === a._id ? 0.5 : 1 }}
                      onClick={() => resolve(a._id, 'Rejected')}
                      disabled={processing === a._id}
                    >
                      Reject
                    </button>
                  </div>
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
  content: { position: 'relative', zIndex: 2, maxWidth: '760px', margin: '0 auto', padding: '56px 32px 80px' },
  header: { marginBottom: '36px' },
  eyebrow: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: C.textFaint, marginBottom: '14px' },
  heading: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '10px' },
  sub: { fontSize: '13px', color: C.textDim, lineHeight: 1.7, maxWidth: '480px' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: '3px solid #f0f0f0',
    borderRadius: '8px', padding: '22px', backdropFilter: 'blur(8px)',
    display: 'flex', flexDirection: 'column', gap: '18px',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  userBlock: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1c1c1c',
    border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: C.text,
  },
  userName: { fontSize: '14px', color: C.text, fontWeight: 500 },
  userEmail: { fontFamily: mono, fontSize: '11px', color: C.textFaint, marginTop: '2px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  outcomeBadge: {
    display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', borderRadius: '20px',
    padding: '5px 13px', fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em',
  },
  thumbRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb: { width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${C.border}` },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  fieldLabel: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.1em', color: C.textFaint },
  fieldText: { fontSize: '13px', color: C.text, lineHeight: 1.7, margin: 0 },
  textarea: {
    backgroundColor: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '6px',
    padding: '12px 14px', color: C.text, fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", resize: 'vertical', lineHeight: 1.6,
  },
  actions: { display: 'flex', gap: '10px' },
  acceptBtn: {
    backgroundColor: `${C.approved}1a`, border: `1px solid ${C.approved}`, color: C.approved,
    padding: '11px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em', cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: `${C.blocked}14`, border: `1px solid ${C.blocked}`, color: C.blocked,
    padding: '11px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em', cursor: 'pointer',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
    backgroundColor: 'rgba(40,8,8,0.5)', border: `1px solid ${C.blocked}44`, borderLeft: `3px solid ${C.blocked}`,
    borderRadius: '6px', padding: '12px 16px', fontSize: '12px', color: '#ff8585',
  },
  errorDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.blocked, flexShrink: 0 },
  empty: { fontSize: '13px', color: C.textDim },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    padding: '52px', border: `1px dashed ${C.border}`, borderRadius: '10px', backgroundColor: 'rgba(15,15,15,0.4)',
  },
};

export default AdminAppeals;