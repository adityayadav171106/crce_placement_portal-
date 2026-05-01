import ScrollReveal from '../components/ScrollReveal.jsx';
import { departmentStats, placementStats, recruiters } from '../data/siteData.js';

function Header({ navigate }) {
  return (
    <header className="site-header">
      <button className="brand-link" onClick={() => navigate('/')} aria-label="Go to home">
        <img src="/HEADER_LOGO.png" alt="CRCE Logo" />
        <span>Fr. CRCE Placement Cell</span>
      </button>
      <nav className="header-nav" aria-label="Primary">
        <a href="#recruiters">Recruiters</a>
        <a href="#statistics">Statistics</a>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
      </nav>
    </header>
  );
}

export default function LandingPage({ navigate }) {
  return (
    <div className="page-shell landing-page">
      <Header navigate={navigate} />

      <main>
        <section className="hero-section">
          <div className="hero-backdrop" />
          <div className="hero-copy">
            <span className="eyebrow">Training and Placement Office</span>
            <h1>Turn preparation into offers with a smarter placement cockpit.</h1>
            <p>
              Track opportunities, polish resumes, follow deadlines, and move through every stage of campus hiring with calm clarity.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Enter Portal</button>
              <a className="btn btn-secondary" href="#statistics">View Outcomes</a>
            </div>
          </div>
          <div className="hero-panel" aria-label="Placement snapshot">
            <div className="orbit-badge">Live</div>
            <div className="metric-large">
              <span>148</span>
              <small>students placed</small>
            </div>
            <div className="signal-bars">
              <span style={{ height: '48%' }} />
              <span style={{ height: '72%' }} />
              <span style={{ height: '58%' }} />
              <span style={{ height: '86%' }} />
              <span style={{ height: '64%' }} />
              <span style={{ height: '94%' }} />
            </div>
            <div className="panel-row">
              <strong>Next Deadline</strong>
              <span>JP Morgan, 5 PM</span>
            </div>
          </div>
        </section>

        <section className="reveal-band">
          <ScrollReveal baseOpacity={0.08} baseRotation={4} blurStrength={8} textClassName="landing-reveal-text">
            Profiles become sharper, interviews become calmer, and every application becomes easier to track.
          </ScrollReveal>
        </section>

        <section className="feature-grid" aria-label="Portal features">
          {[
            ['travel_explore', 'Placement Tracking', 'Know where every application stands, from opening to offer.'],
            ['description', 'Resume Studio', 'Build a clean resume and keep uploads ready for drives.'],
            ['work_history', 'Internship Manager', 'Filter live internship roles by department, duration, and skill.'],
            ['insights', 'Outcome Analytics', 'Scan department performance and hiring momentum at a glance.']
          ].map(([icon, title, copy]) => (
            <article className="feature-card" key={title}>
              <span className="material-icons-outlined">{icon}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>

        <section className="content-section" id="recruiters">
          <div className="section-heading">
            <span className="eyebrow">Recruiter Network</span>
            <h2>Companies students prepare for.</h2>
          </div>
          <div className="recruiter-grid">
            {recruiters.map(recruiter => (
              <article className="recruiter-card" key={recruiter.name}>
                <img src={recruiter.logo} alt={`${recruiter.name} logo`} />
                <div>
                  <h3>{recruiter.name}</h3>
                  <p>{recruiter.roles}</p>
                  <strong>{recruiter.package}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section stats-section" id="statistics">
          <div className="section-heading">
            <span className="eyebrow">Placement Statistics</span>
            <h2>Performance that is easy to read.</h2>
          </div>
          <div className="stats-card-grid">
            {placementStats.map(stat => (
              <article className="stat-card" key={stat.label}>
                <span className="material-icons-outlined">{stat.icon}</span>
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3>Department-wise Placement</h3>
              <span>2025-26</span>
            </div>
            <div className="bar-list">
              {departmentStats.map(item => (
                <div className="bar-row" key={item.label}>
                  <span>{item.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.value}%` }} />
                  </div>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
