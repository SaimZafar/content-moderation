import React, { useState, useEffect } from 'react';
import { getPolicies, updatePolicy } from '../api/api';

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

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await getPolicies();
      setPolicies(res.data);
      const d = {};
      res.data.forEach(p => {
        d[p._id] = {
          enabled: p.enabled,
          confidenceThreshold: p.confidenceThreshold,
          enforcementBehavior: p.enforcementBehavior,
        };
      });
      setDrafts(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setDraft = (id, key, value) =>
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const isDirty = (p) => {
    const d = drafts[p._id];
    if (!d) return false;
    return d.enabled !== p.enabled ||
      d.confidenceThreshold !== p.confidenceThreshold ||
      d.enforcementBehavior !== p.enforcementBehavior;
  };

  const save = async (p) => {
    setSaving(p._id);
    setError('');
    try {
      const res = await updatePolicy(p._id, drafts[p._id]);
      setPolicies(prev => prev.map(x => x._id === p._id ? res.data : x));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save policy.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>ADMIN · CONFIG</p>
          <h1 style={styles.heading}>Policy configuration</h1>
          <p style={styles.sub}>Tune each moderation category. Changes apply to future submissions only.</p>
        </div>

        {error && <div style={styles.errorBox}><span style={styles.errorDot} />{error}</div>}

        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : (
          <div style={styles.list}>
            {policies.map((p) => {
              const d = drafts[p._id] || {};
              const dirty = isDirty(p);
              const off = !d.enabled;
              return (
                <div key={p._id} style={{ ...styles.card, opacity: off ? 0.62 : 1 }}>
                  <div style={styles.cardTop}>
                    <div style={styles.catBlock}>
                      <span style={{ ...styles.catDot, backgroundColor: off ? C.textFaint : C.text }} />
                      <span style={styles.catName}>{p.category}</span>
                    </div>
                    <Toggle on={!!d.enabled} onChange={() => setDraft(p._id, 'enabled', !d.enabled)} />
                  </div>

                  <div style={styles.controls}>
                    <div style={styles.controlRow}>
                      <div style={styles.controlLabelRow}>
                        <span style={styles.controlLabel}>Confidence threshold</span>
                        <span style={styles.thresholdVal}>{d.confidenceThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={d.confidenceThreshold}
                        disabled={off}
                        onChange={(e) => setDraft(p._id, 'confidenceThreshold', Number(e.target.value))}
                        style={styles.slider}
                      />
                    </div>

                    <div style={styles.controlRow}>
                      <span style={styles.controlLabel}>Enforcement</span>
                      <div style={styles.segmented}>
                        {['Flag for Review', 'Auto-Block'].map(opt => {
                          const active = d.enforcementBehavior === opt;
                          const col = opt === 'Auto-Block' ? C.blocked : C.flagged;
                          return (
                            <button
                              key={opt}
                              disabled={off}
                              onClick={() => setDraft(p._id, 'enforcementBehavior', opt)}
                              style={{
                                ...styles.segBtn,
                                backgroundColor: active ? `${col}1f` : 'transparent',
                                borderColor: active ? col : C.border,
                                color: active ? col : C.textDim,
                                cursor: off ? 'default' : 'pointer',
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {dirty && (
                    <div style={styles.saveRow}>
                      <button
                        style={{ ...styles.saveBtn, opacity: saving === p._id ? 0.5 : 1 }}
                        onClick={() => save(p)}
                        disabled={saving === p._id}
                      >
                        {saving === p._id ? 'Saving...' : 'Save changes'}
                      </button>
                      <button style={styles.discardBtn} onClick={() => setDraft(p._id, '__reset', null) || setDrafts(prev => ({
                        ...prev,
                        [p._id]: { enabled: p.enabled, confidenceThreshold: p.confidenceThreshold, enforcementBehavior: p.enforcementBehavior }
                      }))}>
                        Discard
                      </button>
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

const Toggle = ({ on, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: '42px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      backgroundColor: on ? '#3fb950' : '#2a2a2a', position: 'relative', transition: 'background-color 0.2s', padding: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '18px', height: '18px',
      borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s',
    }} />
  </button>
);

const styles = {
  page: { position: 'relative', minHeight: 'calc(100vh - 56px)', backgroundColor: C.bg, overflow: 'hidden' },
  glow: {
    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
    width: '700px', height: '500px',
    background: 'radial-gradient(circle, rgba(60,60,60,0.18) 0%, transparent 70%)', pointerEvents: 'none',
  },
  content: { position: 'relative', zIndex: 2, maxWidth: '720px', margin: '0 auto', padding: '56px 32px 80px' },
  header: { marginBottom: '36px' },
  eyebrow: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: C.textFaint, marginBottom: '14px' },
  heading: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '10px' },
  sub: { fontSize: '13px', color: C.textDim, lineHeight: 1.7, maxWidth: '480px' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
    padding: '22px', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', gap: '20px',
    transition: 'opacity 0.2s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBlock: { display: 'flex', alignItems: 'center', gap: '12px' },
  catDot: { width: '8px', height: '8px', borderRadius: '50%' },
  catName: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600, color: C.text, letterSpacing: '-0.01em' },
  controls: { display: 'flex', flexDirection: 'column', gap: '22px' },
  controlRow: { display: 'flex', flexDirection: 'column', gap: '12px' },
  controlLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  controlLabel: { fontSize: '12px', color: C.textDim, letterSpacing: '0.03em', textTransform: 'uppercase' },
  thresholdVal: { fontFamily: mono, fontSize: '14px', color: C.text, fontWeight: 600 },
  slider: { width: '100%', accentColor: '#8a8a8a', cursor: 'pointer' },
  segmented: { display: 'flex', gap: '8px' },
  segBtn: {
    flex: 1, border: '1px solid', borderRadius: '6px', padding: '10px', fontSize: '12px',
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em', transition: 'all 0.15s',
  },
  saveRow: { display: 'flex', gap: '10px', borderTop: `1px solid ${C.border}`, paddingTop: '18px' },
  saveBtn: {
    backgroundColor: C.text, color: '#0a0a0a', border: 'none', borderRadius: '6px',
    padding: '10px 20px', fontSize: '13px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.03em', cursor: 'pointer',
  },
  discardBtn: {
    background: 'transparent', border: `1px solid ${C.border}`, color: C.textDim,
    borderRadius: '6px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
    backgroundColor: 'rgba(40,8,8,0.5)', border: `1px solid ${C.blocked}44`, borderLeft: `3px solid ${C.blocked}`,
    borderRadius: '6px', padding: '12px 16px', fontSize: '12px', color: '#ff8585',
  },
  errorDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.blocked, flexShrink: 0 },
  empty: { fontSize: '13px', color: C.textDim },
};

export default AdminPolicies;