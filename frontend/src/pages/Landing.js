import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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

    const nodes = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(180,180,180,${(1 - dist / 150) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,200,200,0.4)';
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
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  );
};

const Landing = () => {
  return (
    <div style={styles.container}>
      <NodeCanvas />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logoRow}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>MODGUARD</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.statusRow}>
            <div style={styles.statusDot} />
            <span style={styles.statusText}>System operational</span>
          </div>
          <Link to="/login" style={styles.navLogin}>Sign in</Link>
          <Link to="/register" style={styles.navRegister}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.badgeDot} />
          AI-POWERED CONTENT MODERATION
        </div>

        <h1 style={styles.heroHeading}>
          Moderate content.<br />
          Enforce policy.<br />
          <span style={styles.heroAccent}>At scale.</span>
        </h1>

        <p style={styles.heroSub}>
          MODGUARD screens every image against your active policies using AI, delivers instant verdicts, and gives users a fair appeal process — all in one platform.
        </p>

        <div style={styles.heroBtns}>
          <Link
            to="/register"
            style={styles.btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d0d0d0'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
          >
            Get started free
          </Link>
          <Link
            to="/login"
            style={styles.btnSecondary}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.color = '#f0f0f0'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888'; }}
          >
            Sign in
          </Link>
        </div>

        {/* Stats bar */}
        <div style={styles.statsBar}>
          {[
            { num: '6', label: 'Moderation Categories' },
            { num: 'AI', label: 'Powered Screening' },
            { num: 'RT', label: 'Real Time Analysis' },
            { num: '100%', label: 'Policy Driven' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div style={styles.stat}>
                <span style={styles.statNum}>{s.num}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
              {i < 3 && <div style={styles.statDiv} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={styles.features}>
        <div style={styles.featuresHeader}>
          <p style={styles.featuresEyebrow}>WHAT IT DOES</p>
          <h2 style={styles.featuresHeading}>Everything you need to moderate content</h2>
        </div>

        <div style={styles.featuresGrid}>
          {[
            {
              title: 'AI Image Screening',
              desc: 'Every submitted image is analyzed across 6 policy categories with confidence scoring and detailed reasoning.'
            },
            {
              title: 'Verdict System',
              desc: 'Images are automatically classified as Approved, Flagged, or Blocked based on your configured enforcement rules.'
            },
            {
              title: 'Appeal Workflow',
              desc: 'Users can appeal flagged or blocked decisions with written justification. Admins review and override verdicts.'
            },
            {
              title: 'Policy Control',
              desc: 'Admins configure per-category thresholds, enable or disable categories, and set enforcement behavior in real time.'
            },
            {
              title: 'Submission History',
              desc: 'Full audit trail of every submission with filters by outcome, category, and date range.'
            },
            {
              title: 'Analytics Dashboard',
              desc: 'Submission volume, verdict distribution, appeal stats, and top user rankings all in one view.'
            },
          ].map((f, i) => (
            <div
              key={i}
              style={styles.featureCard}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.backgroundColor = '#111'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.backgroundColor = 'rgba(12,12,12,0.8)'; }}
            >
              <div style={styles.featureNum}>0{i + 1}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={styles.categories}>
        <p style={styles.catEyebrow}>MODERATION CATEGORIES</p>
        <div style={styles.catGrid}>
          {[
            'Graphic Violence',
            'Hate Symbols',
            'Self-Harm',
            'Extremist Propaganda',
            'Weapons and Contraband',
            'Harassment and Humiliation',
          ].map((cat, i) => (
            <div key={i} style={styles.catItem}>
              <div style={styles.catIndex}>{String(i + 1).padStart(2, '0')}</div>
              <span style={styles.catName}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaHeading}>Ready to start moderating?</h2>
          <p style={styles.ctaSub}>Create your account and begin screening content in minutes.</p>
          <Link
            to="/register"
            style={styles.ctaBtn}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d0d0d0'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
          >
            Create free account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <div style={styles.logoRow}>
            <div style={styles.logoDot} />
            <span style={styles.logoText}>MODGUARD</span>
          </div>
          <p style={styles.footerSub}>AI-powered content moderation platform</p>
        </div>
        <p style={styles.footerRight}>Built with Node.js, React, MongoDB</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    position: 'relative',
    overflowX: 'hidden',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    borderBottom: '1px solid #1a1a1a',
    backgroundColor: 'rgba(10,10,10,0.85)',
    backdropFilter: 'blur(12px)',
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
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
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
  navLogin: {
    fontSize: '13px',
    color: '#888',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  navRegister: {
    fontSize: '13px',
    color: '#0a0a0a',
    backgroundColor: '#f0f0f0',
    padding: '8px 18px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.03em',
    transition: 'background-color 0.15s',
  },
  hero: {
    position: 'relative',
    zIndex: 2,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '120px 60px 80px',
  },
  heroBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    letterSpacing: '0.12em',
    color: '#555',
    border: '1px solid #2a2a2a',
    padding: '6px 14px',
    borderRadius: '2px',
    marginBottom: '40px',
  },
  badgeDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    boxShadow: '0 0 6px #f0f0f0',
  },
  heroHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '72px',
    fontWeight: 700,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
    color: '#f0f0f0',
    marginBottom: '28px',
    maxWidth: '800px',
  },
  heroAccent: {
    color: '#555',
  },
  heroSub: {
    fontSize: '16px',
    color: '#555',
    lineHeight: 1.8,
    maxWidth: '520px',
    marginBottom: '48px',
  },
  heroBtns: {
    display: 'flex',
    gap: '14px',
    marginBottom: '72px',
  },
  btnPrimary: {
    backgroundColor: '#f0f0f0',
    color: '#0a0a0a',
    padding: '14px 28px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.04em',
    transition: 'background-color 0.15s',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#888',
    padding: '14px 28px',
    borderRadius: '4px',
    border: '1px solid #2a2a2a',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.04em',
    transition: 'all 0.15s',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    backgroundColor: 'rgba(12,12,12,0.8)',
    border: '1px solid #1a1a1a',
    borderRadius: '6px',
    padding: '20px 48px',
    backdropFilter: 'blur(12px)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '22px',
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
    height: '32px',
    backgroundColor: '#2a2a2a',
  },
  features: {
    position: 'relative',
    zIndex: 2,
    padding: '100px 60px',
    borderTop: '1px solid #1a1a1a',
  },
  featuresHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  featuresEyebrow: {
    fontSize: '10px',
    letterSpacing: '0.14em',
    color: '#444',
    marginBottom: '14px',
  },
  featuresHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '36px',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: '#f0f0f0',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'rgba(12,12,12,0.8)',
    padding: '36px 32px',
    border: '1px solid #1a1a1a',
    transition: 'all 0.2s',
    cursor: 'default',
  },
  featureNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '11px',
    color: '#333',
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  featureTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: '#f0f0f0',
    marginBottom: '10px',
    letterSpacing: '-0.01em',
  },
  featureDesc: {
    fontSize: '13px',
    color: '#555',
    lineHeight: 1.7,
  },
  categories: {
    position: 'relative',
    zIndex: 2,
    padding: '80px 60px',
    borderTop: '1px solid #1a1a1a',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  catEyebrow: {
    fontSize: '10px',
    letterSpacing: '0.14em',
    color: '#444',
    marginBottom: '32px',
    textAlign: 'center',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0px',
  },
  catItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: '1px solid #1a1a1a',
    borderRight: '1px solid #1a1a1a',
  },
  catIndex: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '11px',
    color: '#333',
    letterSpacing: '0.06em',
    minWidth: '24px',
  },
  catName: {
    fontSize: '13px',
    color: '#888',
    letterSpacing: '0.02em',
  },
  cta: {
    position: 'relative',
    zIndex: 2,
    padding: '100px 60px',
    borderTop: '1px solid #1a1a1a',
    textAlign: 'center',
  },
  ctaInner: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  ctaHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '40px',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: '#f0f0f0',
    marginBottom: '16px',
  },
  ctaSub: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '36px',
    lineHeight: 1.7,
  },
  ctaBtn: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    color: '#0a0a0a',
    padding: '14px 32px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.04em',
    transition: 'background-color 0.15s',
  },
  footer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28px 60px',
    borderTop: '1px solid #1a1a1a',
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  footerSub: {
    fontSize: '11px',
    color: '#333',
    letterSpacing: '0.04em',
  },
  footerRight: {
    fontSize: '11px',
    color: '#333',
    letterSpacing: '0.04em',
  },
};

export default Landing;