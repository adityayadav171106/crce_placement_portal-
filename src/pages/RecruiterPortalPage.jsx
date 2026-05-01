import { useEffect, useMemo, useState } from 'react';
import { facultySeedStudents } from '../data/siteData.js';
import {
  addOpportunityListingRequest,
  addPostedInternship,
  addPostedPlacement,
  getInternshipApplications,
  getOpportunityListingRequests,
  getPlacementApplications,
  getPostedInternships,
  getPostedPlacements,
  getStudentRecords
} from '../data/portalStorage.js';

const domainOptions = ['Computer Science', 'Electronics', 'Mechanical'];

const emptyForm = {
  company: '',
  role: '',
  opportunityType: 'internship',
  mode: 'online',
  location: '',
  startDate: '',
  endDate: '',
  deadline: '',
  stipend: '',
  package: '',
  durationWeeks: '8',
  employmentType: 'Full Time',
  eligibility: '',
  assessmentPlan: '',
  description: '',
  tags: '',
  domains: ['Computer Science'],
  otherDomain: ''
};

function formatDate(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function overlapsAcademicWindow(startDate, endDate) {
  if (!startDate || !endDate) return false;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return false;

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    const month = cursor.getMonth();
    if ((month >= 0 && month <= 3) || (month >= 6 && month <= 10)) return true;
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return false;
}

function buildDomains(form) {
  const domains = [...form.domains];
  const custom = form.otherDomain.trim();
  if (custom) domains.push(custom);
  return [...new Set(domains)];
}

export default function RecruiterPortalPage({ navigate }) {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [postedInternships, setPostedInternships] = useState([]);
  const [postedPlacements, setPostedPlacements] = useState([]);
  const [listingRequests, setListingRequests] = useState([]);
  const [internshipApplications, setInternshipApplications] = useState([]);
  const [placementApplications, setPlacementApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [toast, setToast] = useState('');

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
    if (savedUser.role === 'student') {
      navigate('/student-portal');
      return;
    }

    setUser(savedUser);
    setForm(current => ({ ...current, company: savedUser.name || '' }));
    setStudents(getStudentRecords(facultySeedStudents));
    setPostedInternships(getPostedInternships());
    setPostedPlacements(getPostedPlacements());
    setListingRequests(getOpportunityListingRequests());
    setInternshipApplications(getInternshipApplications());
    setPlacementApplications(getPlacementApplications());
  }, [navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const recruiterEmail = (user?.email || '').toLowerCase();
  const recruiterCompany = (form.company || user?.name || '').toLowerCase();

  const myInternships = useMemo(() => {
    return postedInternships.filter(item => item.recruiterEmail === recruiterEmail || item.company.toLowerCase() === recruiterCompany);
  }, [postedInternships, recruiterCompany, recruiterEmail]);

  const myPlacements = useMemo(() => {
    return postedPlacements.filter(item => item.recruiterEmail === recruiterEmail || item.company.toLowerCase() === recruiterCompany);
  }, [postedPlacements, recruiterCompany, recruiterEmail]);

  const myRequests = useMemo(() => {
    return listingRequests.filter(item => item.recruiterEmail === recruiterEmail || item.opportunity?.company?.toLowerCase() === recruiterCompany);
  }, [listingRequests, recruiterCompany, recruiterEmail]);

  const candidates = useMemo(() => {
    const studentByEmail = students.reduce((acc, student) => {
      acc[student.email] = student;
      return acc;
    }, {});

    const internshipIds = new Set(myInternships.map(item => item.id));
    const placementIds = new Set(myPlacements.map(item => item.id));

    const internshipRows = internshipApplications
      .filter(item => internshipIds.has(item.internshipId))
      .map(item => ({
        ...item,
        type: 'Internship',
        role: item.internshipRole,
        student: studentByEmail[item.studentEmail] || {}
      }));

    const placementRows = placementApplications
      .filter(item => placementIds.has(item.placementId))
      .map(item => ({
        ...item,
        type: 'Full Time',
        role: item.placementRole,
        student: studentByEmail[item.studentEmail] || {}
      }));

    return [...internshipRows, ...placementRows].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [internshipApplications, myInternships, myPlacements, placementApplications, students]);

  const dashboardStats = [
    ['Live Internships', myInternships.length, 'work'],
    ['Live Full Time Jobs', myPlacements.length, 'business_center'],
    ['Faculty Listing Requests', myRequests.filter(item => item.status === 'pending').length, 'approval'],
    ['Candidate Applications', candidates.length, 'groups']
  ];

  const handleField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const toggleDomain = domain => {
    setForm(current => {
      const exists = current.domains.includes(domain);
      const domains = exists ? current.domains.filter(item => item !== domain) : [...current.domains, domain];
      return { ...current, domains };
    });
  };

  const submitOpportunity = event => {
    event.preventDefault();
    const domains = buildDomains(form);

    if (!form.company.trim() || !form.role.trim() || !form.deadline || !form.description.trim()) {
      setToast('Please fill company, role, deadline, and description.');
      return;
    }

    if (domains.length === 0) {
      setToast('Select at least one domain or add a custom domain.');
      return;
    }

    if (form.opportunityType === 'internship' && (!form.startDate || !form.endDate)) {
      setToast('Add internship start and end dates for academic clash checks.');
      return;
    }

    const id = Date.now();
    const basePayload = {
      id,
      company: form.company.trim(),
      role: form.role.trim(),
      logo: form.company.trim().slice(0, 3).toUpperCase(),
      location: form.mode === 'online' ? 'Online' : form.location.trim() || 'Campus / Office',
      mode: form.mode,
      domains,
      department: domains[0],
      deadline: formatDate(form.deadline),
      deadlineRaw: form.deadline,
      eligibility: form.eligibility.trim() || 'Open to eligible students as per recruiter screening.',
      assessmentPlan: form.assessmentPlan.trim() || 'Resume screening followed by recruiter assessment.',
      description: form.description.trim(),
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      recruiterName: user?.name || 'Recruiter',
      recruiterEmail,
      postedBy: user?.name || 'Recruiter',
      postedAt: new Date().toISOString()
    };

    if (form.opportunityType === 'internship') {
      const durationWeeks = Number(form.durationWeeks) || 8;
      const payload = {
        ...basePayload,
        startDate: formatDate(form.startDate),
        endDate: formatDate(form.endDate),
        startDateRaw: form.startDate,
        endDateRaw: form.endDate,
        stipend: form.stipend.trim() || 'As per company policy',
        durationWeeks,
        duration: `${durationWeeks} Weeks`
      };

      const needsFacultyApproval = form.mode === 'offline' && overlapsAcademicWindow(form.startDate, form.endDate);
      if (needsFacultyApproval) {
        const next = addOpportunityListingRequest({
          id: `listing-${id}`,
          type: 'internship',
          status: 'pending',
          reason: 'Offline internship overlaps January-April or July-November academic months.',
          recruiterEmail,
          recruiterName: user?.name || 'Recruiter',
          submittedAt: new Date().toISOString(),
          opportunity: payload
        });
        setListingRequests(next);
        setToast('Offline internship sent to faculty for listing approval.');
      } else {
        const next = addPostedInternship(payload);
        setPostedInternships(next);
        setToast('Internship posted to student opportunities.');
      }
    } else {
      const payload = {
        ...basePayload,
        package: form.package.trim() || 'As per company policy',
        employmentType: form.employmentType || 'Full Time'
      };
      const next = addPostedPlacement(payload);
      setPostedPlacements(next);
      setToast('Full time opportunity posted to student opportunities.');
    }

    setForm(current => ({
      ...emptyForm,
      company: current.company,
      opportunityType: current.opportunityType,
      mode: current.mode
    }));
  };

  const logout = () => {
    localStorage.removeItem('crce_user');
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.name || 'Recruiter';
  const initial = displayName.charAt(0).toUpperCase();
  const conflictLikely = form.opportunityType === 'internship' && form.mode === 'offline' && overlapsAcademicWindow(form.startDate, form.endDate);

  const navItems = [
    ['dashboard', 'dashboard', 'Dashboard'],
    ['post', 'add_box', 'Post Opportunity'],
    ['candidates', 'groups', 'Applicants'],
    ['listings', 'fact_check', 'Listing Status']
  ];

  return (
    <div className="portal-page recruiter-page">
      <header className="portal-topbar">
        <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
          <span className="material-icons-outlined">menu</span>
        </button>
        <button className="brand-link portal-brand" onClick={() => navigate('/')}>
          <img src="/HEADER_LOGO.png" alt="CRCE Logo" />
          <span>Recruiter Portal</span>
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
            <span>{user.email}</span>
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
        {activePage === 'dashboard' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Recruiter Workspace</span>
              <h1>Post roles, track approvals, and assess campus applicants.</h1>
            </div>
            <div className="stats-card-grid">
              {dashboardStats.map(([label, value, icon]) => (
                <article className="stat-card" key={label}>
                  <span className="material-icons-outlined">{icon}</span>
                  <strong>{value}</strong>
                  <p>{label}</p>
                </article>
              ))}
            </div>
            <div className="portal-card recruiter-workflow">
              <h3>Offline Internship Rule</h3>
              <p>Offline internships that run during January-April or July-November are sent to faculty first. Online internships and full time jobs can be listed directly.</p>
            </div>
          </section>
        )}

        {activePage === 'post' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Opportunity Builder</span>
              <h1>Create an internship or full time opening.</h1>
            </div>

            <form className="portal-card post-opportunity-form recruiter-post-form" onSubmit={submitOpportunity}>
              <div className="form-block">
                <span>Opportunity Type</span>
                <div className="opportunity-tabs" role="tablist" aria-label="Select opportunity type">
                  <button type="button" className={form.opportunityType === 'internship' ? 'active' : ''} onClick={() => handleField('opportunityType', 'internship')}>Internship</button>
                  <button type="button" className={form.opportunityType === 'placement' ? 'active' : ''} onClick={() => handleField('opportunityType', 'placement')}>Full Time</button>
                </div>
              </div>

              <div className="form-block">
                <span>Mode</span>
                <div className="opportunity-tabs" role="tablist" aria-label="Select work mode">
                  <button type="button" className={form.mode === 'online' ? 'active' : ''} onClick={() => handleField('mode', 'online')}>Online</button>
                  <button type="button" className={form.mode === 'offline' ? 'active' : ''} onClick={() => handleField('mode', 'offline')}>Offline</button>
                </div>
              </div>

              <label>
                Company
                <input value={form.company} onChange={event => handleField('company', event.target.value)} placeholder="Company name" />
              </label>
              <label>
                Role
                <input value={form.role} onChange={event => handleField('role', event.target.value)} placeholder="Software Intern, GET, Analyst" />
              </label>
              <label>
                Location
                <input value={form.location} onChange={event => handleField('location', event.target.value)} placeholder={form.mode === 'online' ? 'Online' : 'Mumbai office / campus'} disabled={form.mode === 'online'} />
              </label>
              <label>
                Application Deadline
                <input type="date" value={form.deadline} onChange={event => handleField('deadline', event.target.value)} />
              </label>

              {form.opportunityType === 'internship' ? (
                <>
                  <label>
                    Start Date
                    <input type="date" value={form.startDate} onChange={event => handleField('startDate', event.target.value)} />
                  </label>
                  <label>
                    End Date
                    <input type="date" value={form.endDate} onChange={event => handleField('endDate', event.target.value)} />
                  </label>
                  <label>
                    Stipend
                    <input value={form.stipend} onChange={event => handleField('stipend', event.target.value)} placeholder="Rs. 30,000/month" />
                  </label>
                  <label>
                    Duration (weeks)
                    <input type="number" min="1" max="52" value={form.durationWeeks} onChange={event => handleField('durationWeeks', event.target.value)} />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Package
                    <input value={form.package} onChange={event => handleField('package', event.target.value)} placeholder="Rs. 8.0 LPA" />
                  </label>
                  <label>
                    Employment Type
                    <select value={form.employmentType} onChange={event => handleField('employmentType', event.target.value)}>
                      <option>Full Time</option>
                      <option>Graduate Trainee</option>
                      <option>PPO</option>
                    </select>
                  </label>
                </>
              )}

              <div className="domain-picker">
                <span>Domains</span>
                <div className="domain-options">
                  {domainOptions.map(domain => (
                    <label key={domain} className="domain-chip">
                      <input type="checkbox" checked={form.domains.includes(domain)} onChange={() => toggleDomain(domain)} />
                      {domain}
                    </label>
                  ))}
                </div>
                <input value={form.otherDomain} onChange={event => handleField('otherDomain', event.target.value)} placeholder="Other domain, optional" />
              </div>

              <label>
                Eligibility
                <input value={form.eligibility} onChange={event => handleField('eligibility', event.target.value)} placeholder="CGPA, branch, batch, prerequisite criteria" />
              </label>
              <label>
                Tags
                <input value={form.tags} onChange={event => handleField('tags', event.target.value)} placeholder="React, CAD, Embedded, Aptitude" />
              </label>
              <label className="post-description">
                Assessment Plan
                <textarea value={form.assessmentPlan} onChange={event => handleField('assessmentPlan', event.target.value)} placeholder="Online test, technical interview, HR round, assignment, portfolio review" />
              </label>
              <label className="post-description">
                Description
                <textarea value={form.description} onChange={event => handleField('description', event.target.value)} placeholder="Responsibilities, projects, joining expectations, and selection details" />
              </label>

              {conflictLikely && (
                <div className="approval-note post-description">
                  <h3>Faculty approval required</h3>
                  <p>This offline internship overlaps an academic window, so it will be sent to the faculty portal before students can see it.</p>
                </div>
              )}

              <div className="button-row">
                <button className="btn btn-primary" type="submit">
                  {conflictLikely ? 'Send Approval Request' : 'Post Opportunity'}
                </button>
              </div>
            </form>
          </section>
        )}

        {activePage === 'candidates' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Applicant Review</span>
              <h1>See who applied and assess their qualifications.</h1>
            </div>
            <div className="approval-grid">
              {candidates.length === 0 && <article className="portal-card"><p>No student applications for your posted opportunities yet.</p></article>}
              {candidates.map(application => (
                <article className="portal-card candidate-card" key={application.id}>
                  <div className="approval-head">
                    <div>
                      <h3>{application.studentName}</h3>
                      <p>{application.studentEmail}</p>
                    </div>
                    <span className={`status-pill ${application.status}`}>{application.status}</span>
                  </div>
                  <div className="student-detail-grid">
                    <div>
                      <h4>{application.type}: {application.company} - {application.role}</h4>
                      <p><strong>Department:</strong> {application.student.department || application.department || 'Not provided'}</p>
                      <p><strong>Year:</strong> {application.student.year || 'Not provided'}</p>
                      <p><strong>Roll:</strong> {application.student.roll || 'Not provided'}</p>
                      <p><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <h4>Qualifications</h4>
                      <p><strong>Skills:</strong> {application.student.skills || 'Not provided'}</p>
                      <p><strong>Education:</strong> {application.student.resume?.education || 'Not available'}</p>
                      <p><strong>Projects:</strong> {application.student.resume?.projects || 'Not available'}</p>
                      <p><strong>LinkedIn:</strong> {application.student.linkedin || 'Not provided'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === 'listings' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Listing Status</span>
              <h1>Monitor live and faculty-reviewed opportunities.</h1>
            </div>
            <div className="posted-opportunities-grid">
              {[...myInternships.map(item => ({ ...item, kind: 'Internship', status: 'live' })), ...myPlacements.map(item => ({ ...item, kind: 'Full Time', status: 'live' }))].map(item => (
                <div className="mini-row" key={`${item.kind}-${item.id}`}>
                  <span>{item.kind}: {item.company} - {item.role}</span>
                  <strong className="status-pill approved">live</strong>
                </div>
              ))}
              {myRequests.map(request => (
                <div className="mini-row" key={request.id}>
                  <span>Faculty Review: {request.opportunity.company} - {request.opportunity.role}</span>
                  <strong className={`status-pill ${request.status}`}>{request.status}</strong>
                </div>
              ))}
              {myInternships.length === 0 && myPlacements.length === 0 && myRequests.length === 0 && (
                <article className="portal-card"><p>No recruiter listings yet.</p></article>
              )}
            </div>
          </section>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
