import React, { useState, useRef } from 'react';
import { createSubmission } from '../api/api';

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

const Submit = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const imgs = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    setFiles(prev => [...prev, ...imgs]);
    setPreviews(prev => [...prev, ...imgs.map(f => URL.createObjectURL(f))]);
    setResult(null);
    setError('');
  };

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await createSubmission(formData);
      setResult(res.data);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Screening failed. Check the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>SCREENING</p>
          <h1 style={styles.heading}>Submit images</h1>
          <p style={styles.sub}>Each image is screened independently across all active policy categories.</p>
        </div>

        {/* Dropzone */}
        <div
          style={{ ...styles.dropzone, borderColor: dragging ? C.text : C.border, backgroundColor: dragging ? 'rgba(30,30,30,0.6)' : C.surface }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <div style={styles.dropInner}>
            <div style={styles.dropMark}>+</div>
            <p style={styles.dropTitle}>Drop images here or click to browse</p>
            <p style={styles.dropHint}>PNG, JPG, GIF · one or several at a time</p>
          </div>
        </div>

        {/* Selected previews */}
        {previews.length > 0 && (
          <div style={styles.selectedBlock}>
            <div style={styles.selectedHead}>
              <span style={styles.selectedCount}>{previews.length} selected</span>
              <button style={styles.clearBtn} onClick={() => { setFiles([]); setPreviews([]); }}>Clear all</button>
            </div>
            <div style={styles.previewGrid}>
              {previews.map((src, i) => (
                <div key={i} style={styles.previewItem}>
                  <img src={src} alt={`preview ${i}`} style={styles.previewImg} />
                  <button style={styles.removeBtn} onClick={() => removeFile(i)}>×</button>
                </div>
              ))}
            </div>
            <button
              style={{ ...styles.screenBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'default' : 'pointer' }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Screening...' : `Screen ${files.length} image${files.length === 1 ? '' : 's'}`}
            </button>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorDot} />
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={styles.results}>
            <div style={styles.resultsHead}>
              <h2 style={styles.resultsTitle}>Verdict</h2>
              <div style={{ ...styles.overallBadge, color: outcomeColor(result.overallOutcome), borderColor: outcomeColor(result.overallOutcome) }}>
                <span style={{ ...styles.badgeDot, backgroundColor: outcomeColor(result.overallOutcome) }} />
                {result.overallOutcome}
              </div>
            </div>

            {result.verdicts.map((v, i) => (
              <div key={i} style={{ ...styles.verdictCard, borderLeftColor: outcomeColor(v.outcome) }}>
                <div style={styles.verdictTop}>
                  <img src={`${API_ORIGIN}${v.imageUrl}`} alt={`result ${i}`} style={styles.verdictImg} />
                  <div style={styles.verdictInfo}>
                    <span style={styles.verdictIndex}>IMAGE {String(i + 1).padStart(2, '0')}</span>
                    <span style={{ ...styles.verdictOutcome, color: outcomeColor(v.outcome) }}>{v.outcome}</span>
                  </div>
                </div>

                <div style={styles.breakdown}>
                  {v.categoryBreakdown.map((cat, ci) => {
                    const flagged = cat.result === 'unsafe';
                    const barColor = flagged ? C.blocked : C.approved;
                    return (
                      <div key={ci} style={styles.catRow}>
                        <div style={styles.catHead}>
                          <span style={styles.catName}>{cat.category}</span>
                          <span style={{ ...styles.catResult, color: barColor }}>
                            {cat.result} · {cat.confidence}%
                          </span>
                        </div>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.barFill, width: `${cat.confidence}%`, backgroundColor: barColor }} />
                        </div>
                        {cat.reasoning && <p style={styles.catReason}>{cat.reasoning}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
  sub: { fontSize: '13px', color: C.textDim, lineHeight: 1.7, maxWidth: '460px' },
  dropzone: {
    border: `1px dashed ${C.border}`, borderRadius: '12px', padding: '52px 24px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(8px)',
  },
  dropInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  dropMark: {
    width: '44px', height: '44px', borderRadius: '50%', border: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', color: C.textDim, fontWeight: 300,
  },
  dropTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', color: C.text, fontWeight: 500 },
  dropHint: { fontFamily: mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.03em' },
  selectedBlock: { marginTop: '28px' },
  selectedHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  selectedCount: { fontFamily: mono, fontSize: '11px', color: C.textDim, letterSpacing: '0.05em', textTransform: 'uppercase' },
  clearBtn: { background: 'none', border: 'none', color: C.textFaint, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginBottom: '24px' },
  previewItem: { position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  removeBtn: {
    position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  screenBtn: {
    width: '100%', backgroundColor: C.text, color: '#0a0a0a', border: 'none', borderRadius: '6px',
    padding: '14px', fontSize: '13px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px',
    backgroundColor: 'rgba(40,8,8,0.5)', border: `1px solid ${C.blocked}44`, borderLeft: `3px solid ${C.blocked}`,
    borderRadius: '6px', padding: '12px 16px', fontSize: '12px', color: '#ff8585',
  },
  errorDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.blocked, flexShrink: 0 },
  results: { marginTop: '44px' },
  resultsHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  resultsTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 600, color: C.text },
  overallBadge: {
    display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', borderRadius: '20px',
    padding: '6px 14px', fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em',
  },
  badgeDot: { width: '7px', height: '7px', borderRadius: '50%' },
  verdictCard: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: '3px solid #f0f0f0',
    borderRadius: '8px', padding: '20px', marginBottom: '14px', backdropFilter: 'blur(8px)',
  },
  verdictTop: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  verdictImg: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${C.border}` },
  verdictInfo: { display: 'flex', flexDirection: 'column', gap: '5px' },
  verdictIndex: { fontFamily: mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' },
  verdictOutcome: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' },
  breakdown: { display: 'flex', flexDirection: 'column', gap: '16px' },
  catRow: { display: 'flex', flexDirection: 'column', gap: '7px' },
  catHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  catName: { fontSize: '13px', color: C.text },
  catResult: { fontFamily: mono, fontSize: '11px', letterSpacing: '0.03em', textTransform: 'uppercase' },
  barTrack: { height: '4px', backgroundColor: '#1c1c1c', borderRadius: '2px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width 0.4s ease' },
  catReason: { fontSize: '12px', color: C.textDim, lineHeight: 1.6, marginTop: '2px' },
};

export default Submit;