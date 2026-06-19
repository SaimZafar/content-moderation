import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { getAnalytics } from '../api/api';

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

const DarkTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: '#8a8a8a' }}>{label}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#ededed', fontWeight: 600 }}>
        {payload[0].value} submission{payload[0].value === 1 ? '' : 's'}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.content}><p style={styles.empty}>Loading analytics...</p></div>
      </div>
    );
  }

  const verdicts = toMap(data?.verdictDistribution);
  const appeals = toMap(data?.appealStats);
  const totalSubs = data?.totalSubmissions || 0;
  const totalAppeals = Object.values(appeals).reduce((a, b) => a + b, 0);
  const approved = verdicts.Approved || 0;
  const approvalRate = totalSubs ? Math.round((approved / totalSubs) * 100) : 0;

  const verdictData = [
    { name: 'Approved', value: verdicts.Approved || 0, color: C.approved },
    { name: 'Flagged', value: verdicts.Flagged || 0, color: C.flagged },
    { name: 'Blocked', value: verdicts.Blocked || 0, color: C.blocked },
  ].filter(d => d.value > 0);

  const appealRows = [
    { name: 'Pending', value: appeals.Pending || 0, color: C.flagged },
    { name: 'Accepted', value: appeals.Accepted || 0, color: C.approved },
    { name: 'Rejected', value: appeals.Rejected || 0, color: C.blocked },
  ];
  const maxAppeal = Math.max(1, ...appealRows.map(r => r.value));

  const topUsers = data?.topUsers || [];

  const volume = (data?.volumeOverTime || []).map(v => ({
    date: new Date(v._id).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    count: v.count,
  }));

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>ADMIN · INSIGHTS</p>
          <h1 style={styles.heading}>Analytics</h1>
          <p style={styles.sub}>Platform-wide moderation activity and outcomes.</p>
        </div>

        {/* Top stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total submissions', value: totalSubs, color: C.neutral },
            { label: 'Total appeals', value: totalAppeals, color: C.flagged },
            { label: 'Approval rate', value: `${approvalRate}%`, color: C.approved },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.statCard, borderTop: `2px solid ${s.color}` }}>
              <div style={styles.statTop}>
                <span style={{ ...styles.statDot, backgroundColor: s.color }} />
                <span style={styles.statLabel}>{s.label}</span>
              </div>
              <span style={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Submission volume */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Submission volume</h2>
          {volume.length === 0 ? (
            <p style={styles.empty}>No submissions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volume} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8a8a8a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8a8a8a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c1c1c" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#5e5e5e', fontSize: 11 }} stroke="#242424" />
                <YAxis allowDecimals={false} tick={{ fill: '#5e5e5e', fontSize: 11 }} stroke="#242424" />
                <Tooltip content={<DarkTip />} cursor={{ stroke: '#333' }} />
                <Area type="monotone" dataKey="count" stroke="#ededed" strokeWidth={2} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.twoCol}>
          {/* Verdict distribution */}
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Verdict distribution</h2>
            {verdictData.length === 0 ? (
              <p style={styles.empty}>No submissions yet.</p>
            ) : (
              <div style={styles.donutWrap}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={verdictData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {verdictData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={styles.legend}>
                  {verdictData.map((d, i) => (
                    <div key={i} style={styles.legendRow}>
                      <span style={{ ...styles.legendDot, backgroundColor: d.color }} />
                      <span style={styles.legendName}>{d.name}</span>
                      <span style={styles.legendVal}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Appeal stats */}
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Appeal outcomes</h2>
            {totalAppeals === 0 ? (
              <p style={styles.empty}>No appeals filed yet.</p>
            ) : (
              <div style={styles.barList}>
                {appealRows.map((r, i) => (
                  <div key={i} style={styles.barRow}>
                    <div style={styles.barLabelRow}>
                      <span style={styles.barName}>{r.name}</span>
                      <span style={{ ...styles.barVal, color: r.color }}>{r.value}</span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${(r.value / maxAppeal) * 100}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top users */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Top users by submission volume</h2>
          {topUsers.length === 0 ? (
            <p style={styles.empty}>No user activity yet.</p>
          ) : (
            <div style={styles.userList}>
              {topUsers.map((u, i) => (
                <div key={i} style={styles.userRow}>
                  <div style={styles.userLeft}>
                    <span style={styles.rank}>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div style={styles.uName}>{u.user?.name || 'Unknown'}</div>
                      <div style={styles.uEmail}>{u.user?.email || ''}</div>
                    </div>
                  </div>
                  <span style={styles.uCount}>{u.submissionCount}</span>
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
  content: { position: 'relative', zIndex: 2, maxWidth: '860px', margin: '0 auto', padding: '56px 32px 80px' },
  header: { marginBottom: '36px' },
  eyebrow: { fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: C.textFaint, marginBottom: '14px' },
  heading: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '34px', fontWeight: 700, letterSpacing: '-0.03em', color: C.text, marginBottom: '10px' },
  sub: { fontSize: '13px', color: C.textDim, lineHeight: 1.7 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' },
  statCard: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
    padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: '20px', backdropFilter: 'blur(8px)',
  },
  statTop: { display: 'flex', alignItems: 'center', gap: '9px' },
  statDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  statLabel: { fontSize: '11px', color: C.textDim, letterSpacing: '0.05em', textTransform: 'uppercase' },
  statValue: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '38px', fontWeight: 700, color: C.text, letterSpacing: '-0.03em', lineHeight: 1 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  panel: {
    backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
    padding: '24px', backdropFilter: 'blur(8px)', marginBottom: '14px',
  },
  panelTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '20px' },
  donutWrap: { display: 'flex', flexDirection: 'column', gap: '16px' },
  legend: { display: 'flex', flexDirection: 'column', gap: '8px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%' },
  legendName: { fontSize: '13px', color: C.textDim, flex: 1 },
  legendVal: { fontFamily: mono, fontSize: '13px', color: C.text, fontWeight: 600 },
  barList: { display: 'flex', flexDirection: 'column', gap: '18px' },
  barRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  barLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  barName: { fontSize: '13px', color: C.textDim },
  barVal: { fontFamily: mono, fontSize: '13px', fontWeight: 600 },
  barTrack: { height: '6px', backgroundColor: '#1c1c1c', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  userList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  userRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: `1px solid #181818`,
  },
  userLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  rank: { fontFamily: mono, fontSize: '12px', color: C.textFaint },
  uName: { fontSize: '14px', color: C.text, fontWeight: 500 },
  uEmail: { fontFamily: mono, fontSize: '11px', color: C.textFaint, marginTop: '2px' },
  uCount: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: C.text },
  empty: { fontSize: '13px', color: C.textDim },
};

export default AdminAnalytics;