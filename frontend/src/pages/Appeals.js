import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppeals, getMySubmissions, createAppeal } from '../api/api';

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

const outcomeColor = (o) =>
  o === 'Blocked' ? C.blocked : o === 'Flagged' ? C.flagged : o === 'Approved' ? C.approved : C.neutral;

const statusColor = (s) =>
  s === 'Accepted' ? C.approved : s === 'Rejected' ? C.blocked : C.flagged;

const Appeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [a, s] = await Promise.all([getMyAppeals(), getMySubmissions()]);
      setAppeals(a.data);
      setSubmissions(s.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const appealedIds = appeals.map(a => a.submissionId?._id || a.submissionId);
  const eligible = submissions.filter(
    s => s.overallOutcome !== 'Approved' && !appealedIds.includes(s._id)
  );

  const submitAppeal = async () => {
    if (!selected || !justification.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createAppeal({ submissionId: selected, justification: justification.trim() });
      setSelected(null);
      setJustification('');
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not file appeal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>APPEALS</p>
          <h1 style={styles.heading}>Appeals</h1>
          <p style={styles.sub}>Contest a flagged or blocked verdict. An admin will review your justification.</p>
        </div>

        {/* File an appeal */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Eligible for appeal</h2>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : eligible.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.empty}>Nothing to appeal. Only flagged or blocked submissions can be contested.</p>
              <Link to="/history" style={styles.emptyLink}>View history</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {eligible.map((s) => (
                <div key={s._id} style={{ ...styles.eligRow, borderLeftColor: outcomeColor(s.overallOutcome) }}>
                  <div style={styles.eligHead}>
                    <div style={styles.eligLeft}>
                      <span style={{ ...styles.dot, backgroundColor: outcomeColor(s.overallOutcome) }} />
                      <div style={styles.eligText}>
                        <span style={{ ...styles.eligOutcome, color: outcomeColor(s.overallOutcome) }}>{s.overallOutcome}</span>
                        <span style={styles.eligMeta}>
                          {s.verdicts?.length || 0} image{(s.verdicts?.length || 0) === 1 ? '' : 's'} ·{' '}
                          {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      style={styles.appealBtn}
                      onClick={() => { setSelected(selected === s._id ? null : s._id); setJustification(''); setError(''); }}
                    >
                      {selected === s._id ? 'Cancel' : 'Appeal'}
                    </button>
                  </div>

                  {selected === s._id && (
                    <div style={styles.appealForm}>
                      <textarea
                        style={styles.textarea}
                        placeholder="Explain why this verdict should be reconsidered..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        rows={4}
                      />
                      {error && <p style={styles.formError}>{error}</p>}
                      <button
                        style={{ ...styles.submitBtn, opacity: (!justification.trim() || submitting) ? 0.5 : 1 }}
                        onClick={submitAppeal}
                        disabled={!justification.trim() || submitting}
                      >
                        {submitting ? 'Filing...' : 'Submit appeal'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing appeals */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Your appeals</h2>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : appeals.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.empty}>You have not filed any appeals yet.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {appeals.map((a) => (
                <div key={a._id} style={{ ...styles.appealCard, borderLeftColor: statusColor(a.status) }}>
                  <div style={styles.appealTop}>
                    <div style={{ ...styles.statusBadge, color: statusColor(a.status), borderColor: statusColor(a.status) }}>
                      <span style={{ ...styles.dot, backgroundColor: statusColor(a.status) }} />
                      {a.status}
                    </div>
                    <span style={styles.appealDate}>
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>YOUR JUSTIFICATION</span>
                    <p style={styles.fieldText}>{a.justification}</p>
                  </div>

                  {a.adminResponse ? (
                    <div style={styles.field}>
                      <span style={styles.fieldLabel}>ADMIN RESPONSE</span>
                      <p style={styles.fieldText}>{a.adminResponse}</p>
                    </div>
                  ) : a.status === 'Pending' ? (
                    <p style={styles.pendingNote}>Awaiting admin review.</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
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
  content: { position: 'relative', zIndex: 2, maxWidth: '760px', margin: '0 auto', padding: '56px 32px 80px' },
  header: { marginBottom: '40px' },
  eyebrow: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: C.textFaint, marginBottom: '14px' },
  heading: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '10px' },
  sub: { fontSize: '13px', color: C.textDim, lineHeight: 1.7, maxWidth: '480px' },
  section: { marginBottom: '44px' },
  sectionTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '18px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  eligRow: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: '3px solid #f0f0f0',
    borderRadius: '6px', overflow: 'hidden', backdropFilter: 'blur(8px)',
  },
  eligHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' },
  eligLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  eligText: { display: 'flex', flexDirection: 'column', gap: '3px' },
  eligOutcome: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600 },
  eligMeta: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.03em' },
  appealBtn: {
    background: 'transparent', border: `1px solid ${C.border}`, color: C.textDim,
    padding: '7px 16px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em',
  },
  appealForm: { borderTop: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  textarea: {
    backgroundColor: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '6px',
    padding: '12px 14px', color: C.text, fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", resize: 'vertical', lineHeight: 1.6,
  },
  formError: { color: '#ff8585', fontSize: '12px', margin: 0 },
  submitBtn: {
    alignSelf: 'flex-start', backgroundColor: C.text, color: '#0a0a0a', border: 'none',
    borderRadius: '6px', padding: '10px 22px', fontSize: '13px', fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em', cursor: 'pointer',
  },
  appealCard: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: '3px solid #f0f0f0',
    borderRadius: '6px', padding: '20px', backdropFilter: 'blur(8px)',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  appealTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', borderRadius: '20px',
    padding: '5px 13px', fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em',
  },
  appealDate: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.04em' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.1em', color: C.textFaint },
  fieldText: { fontSize: '13px', color: C.text, lineHeight: 1.7, margin: 0 },
  pendingNote: { fontSize: '12px', color: C.flagged, margin: 0, fontStyle: 'italic' },
  empty: { fontSize: '13px', color: C.textDim },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    padding: '44px', border: `1px dashed ${C.border}`, borderRadius: '10px', backgroundColor: 'rgba(15,15,15,0.4)',
  },
  emptyLink: { fontSize: '13px', color: C.text, textDecoration: 'none', borderBottom: `1px solid ${C.neutral}`, paddingBottom: '2px' },
};

export default Appeals;