import { useEffect, useMemo, useState } from 'react';
import { departmentStats, facultySeedStudents, internships, placements, placementStats } from '../data/siteData.js';
import {
  addInternshipApplication,
  addPlacementApplication,
  addResumeRequest,
  getInternshipApplications,
  getPostedInternships,
  getPostedPlacements,
  getPlacementApplications,
  getResumeRequests,
  upsertStudentRecord
} from '../data/portalStorage.js';

const emptyProfile = {
  name: '',
  email: '',
  department: '',
  year: '',
  roll: '',
  phone: '',
  skills: '',
  linkedin: ''
};

function getApplicationState(status) {
  if (status === 'pending') return { locked: true, label: 'Pending Approval' };
  if (status === 'approved') return { locked: true, label: 'Approved' };
  if (status === 'rejected') return { locked: false, label: 'Reapply' };
  return { locked: false, label: 'Apply' };
}

export default function PortalPage({ navigate }) {
  const [activePage, setActivePage] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [photo, setPhoto] = useState('');
  const [resume, setResume] = useState(() => ({
    education: localStorage.getItem('crce_resume_education') || '',
    experience: localStorage.getItem('crce_resume_experience') || '',
    projects: localStorage.getItem('crce_resume_projects') || '',
    skills: localStorage.getItem('crce_resume_skills') || ''
  }));
  const [resumeRequests, setResumeRequests] = useState([]);
  const [internshipApplications, setInternshipApplications] = useState([]);
  const [placementApplications, setPlacementApplications] = useState([]);
  const [postedInternships, setPostedInternships] = useState([]);
  const [postedPlacements, setPostedPlacements] = useState([]);
  const [opportunityType, setOpportunityType] = useState('internship');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('crce_user') || 'null');
    if (!savedUser?.loggedIn) {
      navigate('/login');
      return;
    }
    if (savedUser.role === 'faculty') {
      navigate('/faculty-portal');
      return;
    }
    if (savedUser.role === 'recruiter') {
      navigate('/recruiter-portal');
      return;
    }

    const savedProfile = JSON.parse(localStorage.getItem('crce_profile') || 'null');
    const nextProfile = savedProfile || { ...emptyProfile, name: savedUser.name || '', email: savedUser.email || '' };

    setUser(savedUser);
    setProfile(nextProfile);
    setPhoto(localStorage.getItem('crce_photo') || '');
    setResumeRequests(getResumeRequests());
    setInternshipApplications(getInternshipApplications());
    setPlacementApplications(getPlacementApplications());
    setPostedInternships(getPostedInternships());
    setPostedPlacements(getPostedPlacements());
    upsertStudentRecord({ ...nextProfile, email: savedUser.email, name: savedUser.name }, facultySeedStudents);
  }, [navigate]);

  const allInternships = useMemo(() => [...postedInternships, ...internships], [postedInternships]);
  const allPlacements = useMemo(() => [...postedPlacements, ...placements], [postedPlacements]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredInternships = useMemo(() => {
    return allInternships.filter(item => {
      const lowerSearch = search.toLowerCase();
      const matchesSearch = !lowerSearch
        || item.company.toLowerCase().includes(lowerSearch)
        || item.role.toLowerCase().includes(lowerSearch)
        || item.tags.some(tag => tag.toLowerCase().includes(lowerSearch));
      const matchesDept = !dept || item.department === dept;
      const matchesDuration = !duration || (duration === '16' ? item.durationWeeks >= 16 : item.durationWeeks === Number(duration));
      return matchesSearch && matchesDept && matchesDuration;
    });
  }, [allInternships, search, dept, duration]);

  const filteredPlacements = useMemo(() => {
    return allPlacements.filter(item => {
      const lowerSearch = search.toLowerCase();
      const matchesSearch = !lowerSearch
        || item.company.toLowerCase().includes(lowerSearch)
        || item.role.toLowerCase().includes(lowerSearch)
        || item.tags.some(tag => tag.toLowerCase().includes(lowerSearch));
      const matchesDept = !dept || item.department === dept;
      return matchesSearch && matchesDept;
    });
  }, [allPlacements, search, dept]);

  const internshipStatusById = useMemo(() => {
    return internshipApplications
      .filter(item => item.studentEmail === (user?.email || '').toLowerCase())
      .reduce((acc, item) => {
        const current = acc[item.internshipId];
        if (!current || new Date(item.submittedAt) > new Date(current.submittedAt)) {
          acc[item.internshipId] = item;
        }
        return acc;
      }, {});
  }, [internshipApplications, user?.email]);

  const placementStatusById = useMemo(() => {
    return placementApplications
      .filter(item => item.studentEmail === (user?.email || '').toLowerCase())
      .reduce((acc, item) => {
        const current = acc[item.placementId];
        if (!current || new Date(item.submittedAt) > new Date(current.submittedAt)) {
          acc[item.placementId] = item;
        }
        return acc;
      }, {});
  }, [placementApplications, user?.email]);

  const updateProfile = event => {
    event.preventDefault();
    localStorage.setItem('crce_profile', JSON.stringify(profile));
    const nextUser = { ...user, name: profile.name || user.name, email: profile.email || user.email };
    localStorage.setItem('crce_user', JSON.stringify(nextUser));
    setUser(nextUser);
    upsertStudentRecord({ ...profile, email: nextUser.email, name: nextUser.name }, facultySeedStudents);
    setToast('Profile saved successfully.');
  };

  const handlePhoto = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target.result;
      setPhoto(result);
      localStorage.setItem('crce_photo', result);
      setToast('Profile photo updated.');
    };
    reader.readAsDataURL(file);
  };

  const saveResume = () => {
    Object.entries(resume).forEach(([key, value]) => localStorage.setItem(`crce_resume_${key}`, value));

    if (user?.email) {
      const request = {
        id: `resume-${Date.now()}`,
        studentEmail: user.email.toLowerCase(),
        studentName: profile.name || user.name || 'Student',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        resumeSnapshot: { ...resume }
      };
      const nextRequests = addResumeRequest(request);
      setResumeRequests(nextRequests);
      upsertStudentRecord(
        {
          ...profile,
          name: profile.name || user.name,
          email: user.email,
          resume: { ...resume }
        },
        facultySeedStudents
      );
    }

    setToast('Resume saved and sent for faculty approval.');
  };

  const downloadResume = () => {
    const name = profile.name || user?.name || 'Student';
    const text = [
      name.toUpperCase(),
      `${profile.email || user?.email || ''}${profile.phone ? ` | ${profile.phone}` : ''}`,
      ''.padEnd(50, '='),
      '',
      resume.education && `EDUCATION\n${resume.education}`,
      resume.experience && `EXPERIENCE\n${resume.experience}`,
      resume.projects && `PROJECTS\n${resume.projects}`,
      resume.skills && `SKILLS\n${resume.skills}`
    ].filter(Boolean).join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('Resume downloaded.');
  };

  const applyInternship = id => {
    if (!user?.email) return;

    const existing = internshipApplications.find(item => item.studentEmail === user.email.toLowerCase() && item.internshipId === id && item.status !== 'rejected');
    if (existing) return;

    const internship = allInternships.find(item => item.id === id);
    const application = {
      id: `internship-${Date.now()}`,
      internshipId: id,
      internshipRole: internship?.role || 'Internship Role',
      company: internship?.company || 'Company',
      studentEmail: user.email.toLowerCase(),
      studentName: profile.name || user.name || 'Student',
      department: profile.department || internship?.department || 'Computer Engineering',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    const nextApplications = addInternshipApplication(application);
    setInternshipApplications(nextApplications);
    setToast('Internship application submitted for faculty approval.');
  };

  const applyPlacement = id => {
    if (!user?.email) return;

    const existing = placementApplications.find(item => item.studentEmail === user.email.toLowerCase() && item.placementId === id && item.status !== 'rejected');
    if (existing) return;

    const placement = allPlacements.find(item => item.id === id);
    const application = {
      id: `placement-${Date.now()}`,
      placementId: id,
      placementRole: placement?.role || 'Placement Role',
      company: placement?.company || 'Company',
      studentEmail: user.email.toLowerCase(),
      studentName: profile.name || user.name || 'Student',
      department: profile.department || placement?.department || 'Computer Engineering',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    const nextApplications = addPlacementApplication(application);
    setPlacementApplications(nextApplications);
    setToast('Placement application submitted for faculty approval.');
  };

  const logout = () => {
    localStorage.removeItem('crce_user');
    navigate('/login');
  };

  if (!user) return null;

  const displayName = profile.name || user?.name || 'Student';
  const initial = displayName.charAt(0).toUpperCase();
  const myResumeRequests = resumeRequests.filter(item => item.studentEmail === user.email.toLowerCase());

  const navItems = [
    ['profile', 'person', 'Profile'],
    ['resume', 'description', 'Resume'],
    ['policy', 'policy', 'Opportunity Policy'],
    ['internships', 'work', 'Opportunities'],
    ['statistics', 'bar_chart', 'Statistics']
  ];

  return (
    <div className="portal-page">
      <header className="portal-topbar">
        <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
          <span className="material-icons-outlined">menu</span>
        </button>
        <button className="brand-link portal-brand" onClick={() => navigate('/')}>
          <img src="/HEADER_LOGO.png" alt="CRCE Logo" />
          <span>Placement Portal</span>
        </button>
        <div className="topbar-user">
          <span>{displayName}</span>
          <div className="avatar">{initial}</div>
          <button className="icon-button" onClick={logout} aria-label="Logout">
            <span className="material-icons-outlined">logout</span>
          </button>
        </div>
      </header>

      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-profile">
          <div className="avatar large">{initial}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{profile.email || user.email}</span>
          </div>
        </div>
        <nav>
          {navItems.map(([key, icon, label]) => (
            <button
              key={key}
              className={activePage === key ? 'active' : ''}
              onClick={() => {
                setActivePage(key);
                setSidebarOpen(false);
              }}
            >
              <span className="material-icons-outlined">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <button className="sidebar-home" onClick={() => navigate('/')}>
          <span className="material-icons-outlined">home</span>
          Back to Home
        </button>
      </aside>

      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

      <main className="portal-main">
        {activePage === 'profile' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Student Profile</span>
              <h1>Keep your placement identity sharp.</h1>
            </div>
            <div className="profile-layout">
              <article className="profile-photo-card">
                <div className="profile-photo">
                  {photo ? <img src={photo} alt="Profile" /> : <span className="material-icons-outlined">person</span>}
                </div>
                <label className="btn btn-secondary">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                </label>
                <h3>{displayName}</h3>
                <p>{profile.department || 'Department pending'}</p>
              </article>
              <form className="portal-card profile-form" onSubmit={updateProfile}>
                {[
                  ['name', 'Full Name', 'text'],
                  ['email', 'Email', 'email'],
                  ['department', 'Department', 'text'],
                  ['year', 'Year', 'text'],
                  ['roll', 'Roll Number', 'text'],
                  ['phone', 'Phone', 'tel'],
                  ['skills', 'Skills', 'text'],
                  ['linkedin', 'LinkedIn', 'url']
                ].map(([key, label, type]) => (
                  <label key={key}>
                    {label}
                    <input type={type} value={profile[key] || ''} onChange={event => setProfile({ ...profile, [key]: event.target.value })} />
                  </label>
                ))}
                <button className="btn btn-primary" type="submit">Save Profile</button>
              </form>
            </div>
          </section>
        )}

        {activePage === 'resume' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Resume Studio</span>
              <h1>Turn raw achievements into a clean draft.</h1>
            </div>
            <div className="portal-card resume-card">
              {[
                ['education', 'Education', 'B.E. Computer Engineering, Fr. CRCE'],
                ['experience', 'Experience', 'Internships, responsibilities, measurable wins'],
                ['projects', 'Projects', 'Project Name - impact, stack, result'],
                ['skills', 'Skills', 'Python, React, SQL, Cloud, ML']
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  {label}
                  <textarea value={resume[key]} placeholder={placeholder} onChange={event => setResume({ ...resume, [key]: event.target.value })} />
                </label>
              ))}
              <div className="button-row">
                <button className="btn btn-primary" type="button" onClick={saveResume}>Save Resume</button>
                <button className="btn btn-secondary" type="button" onClick={downloadResume}>Download TXT</button>
              </div>
              <div className="request-status-card">
                <h3>Resume Verification Status</h3>
                {myResumeRequests.length === 0 && <p>No submissions yet. Save your resume to send it for review.</p>}
                {myResumeRequests.slice(0, 4).map(request => (
                  <div className="status-row" key={request.id}>
                    <span>{new Date(request.submittedAt).toLocaleString()}</span>
                    <strong className={`status-pill ${request.status}`}>{request.status}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activePage === 'policy' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Opportunity Policy</span>
              <h1>Simple rules, fewer surprises.</h1>
            </div>
            <div className="policy-grid">
              {[
                ['Eligibility', 'Students must keep profile, academic data, and resume records updated before applying.'],
                ['Deadlines', 'Internship and placement applications close automatically at the stated deadline. Late entries need placement-cell approval.'],
                ['Conduct', 'Any malpractice during assessments or interviews can lead to debarment from future drives.'],
                ['Documentation', 'Carry resume, transcript, ID proof, and required photographs for every offline process.']
              ].map(([title, copy]) => (
                <article className="portal-card" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === 'internships' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Opportunities</span>
              <h1>Track internships and placements in one place.</h1>
            </div>
            <div className="opportunity-tabs" role="tablist" aria-label="Select opportunity type">
              <button className={opportunityType === 'internship' ? 'active' : ''} onClick={() => setOpportunityType('internship')}>Internships</button>
              <button className={opportunityType === 'placement' ? 'active' : ''} onClick={() => setOpportunityType('placement')}>Placements</button>
            </div>
            <div className="filters">
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search company, role, or skill" />
              <select value={dept} onChange={event => setDept(event.target.value)}>
                <option value="">All departments</option>
                <option>Computer Engineering</option>
                <option>Electronics & Computer Science</option>
                <option>Mechanical Engineering</option>
                <option>AI & Data Science</option>
              </select>
              {opportunityType === 'internship' ? (
                <select value={duration} onChange={event => setDuration(event.target.value)}>
                  <option value="">Any duration</option>
                  <option value="4">4 weeks</option>
                  <option value="8">8 weeks</option>
                  <option value="12">12 weeks</option>
                  <option value="16">16+ weeks</option>
                </select>
              ) : (
                <div className="filters-hint">Duration filter is available for internships only.</div>
              )}
            </div>

            {opportunityType === 'internship' && (
              <div className="internship-grid">
                {filteredInternships.map(item => {
                  const appState = getApplicationState(internshipStatusById[item.id]?.status);
                  return (
                    <article className="internship-card" key={item.id}>
                      <div className="company-row">
                        <div className="company-mark">{item.logo}</div>
                        <div>
                          <h3>{item.role}</h3>
                          <p>{item.company}</p>
                        </div>
                      </div>
                      <p>{item.description}</p>
                      <div className="internship-meta">
                        <span>{item.stipend}</span>
                        <span>{item.duration}</span>
                        <span>{item.location}</span>
                        {item.mode && <span>{item.mode}</span>}
                      </div>
                      <div className="tag-row">
                        {(item.domains || []).map(domain => <span key={domain}>{domain}</span>)}
                        {item.tags.map(tag => <span key={tag}>{tag}</span>)}
                      </div>
                      <div className="card-footer">
                        <small>Deadline: {item.deadline}</small>
                        <button className={`btn ${appState.locked ? 'btn-disabled' : 'btn-primary'}`} onClick={() => applyInternship(item.id)} disabled={appState.locked}>
                          {appState.label}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {opportunityType === 'placement' && (
              <div className="internship-grid">
                {filteredPlacements.map(item => {
                  const appState = getApplicationState(placementStatusById[item.id]?.status);
                  return (
                    <article className="internship-card" key={item.id}>
                      <div className="company-row">
                        <div className="company-mark">{item.logo}</div>
                        <div>
                          <h3>{item.role}</h3>
                          <p>{item.company}</p>
                        </div>
                      </div>
                      <p>{item.description}</p>
                      <div className="internship-meta">
                        <span>{item.package}</span>
                        <span>{item.employmentType}</span>
                        <span>{item.location}</span>
                        {item.mode && <span>{item.mode}</span>}
                      </div>
                      <div className="tag-row">
                        {(item.domains || []).map(domain => <span key={domain}>{domain}</span>)}
                        {item.tags.map(tag => <span key={tag}>{tag}</span>)}
                      </div>
                      <div className="card-footer">
                        <small>Deadline: {item.deadline}</small>
                        <button className={`btn ${appState.locked ? 'btn-disabled' : 'btn-primary'}`} onClick={() => applyPlacement(item.id)} disabled={appState.locked}>
                          {appState.label}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="portal-card approval-note">
              <h3>Application Review Process</h3>
              <p>Every internship and placement request is routed to faculty for approval. You can reapply only if a request is rejected.</p>
            </div>
          </section>
        )}

        {activePage === 'statistics' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Placement Statistics</span>
              <h1>Outcomes at a glance.</h1>
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
                <span>Live Snapshot</span>
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
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
