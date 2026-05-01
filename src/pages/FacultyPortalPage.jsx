import { useEffect, useMemo, useState } from 'react';
import { facultySeedStudents, internships, placements } from '../data/siteData.js';
import {
  addPostedInternship,
  addPostedPlacement,
  getInternshipApplications,
  getOpportunityListingRequests,
  getPostedInternships,
  getPostedPlacements,
  getPlacementApplications,
  getResumeRequests,
  getStudentRecords,
  updateInternshipApplicationStatus,
  updateOpportunityListingRequestStatus,
  updatePlacementApplicationStatus,
  updateResumeRequestStatus
} from '../data/portalStorage.js';

export default function FacultyPortalPage({ navigate }) {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('profiles');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [resumeRequests, setResumeRequests] = useState([]);
  const [internshipApplications, setInternshipApplications] = useState([]);
  const [placementApplications, setPlacementApplications] = useState([]);
  const [listingRequests, setListingRequests] = useState([]);
  const [postedInternships, setPostedInternships] = useState([]);
  const [postedPlacements, setPostedPlacements] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [postType, setPostType] = useState('internship');
  const [postForm, setPostForm] = useState({
    company: '',
    role: '',
    department: 'Computer Engineering',
    location: 'Mumbai',
    deadline: '',
    tags: '',
    description: '',
    stipend: '',
    durationWeeks: '8',
    package: '',
    employmentType: 'Full Time'
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('crce_user') || 'null');
    if (!savedUser?.loggedIn) {
      navigate('/login');
      return;
    }
    if (savedUser.role !== 'faculty') {
      navigate('/student-portal');
      return;
    }

    const records = getStudentRecords(facultySeedStudents);
    setStudents(records);
    setSelectedEmail(records[0]?.email || '');
    setResumeRequests(getResumeRequests());
    setInternshipApplications(getInternshipApplications());
    setPlacementApplications(getPlacementApplications());
    setListingRequests(getOpportunityListingRequests());
    setPostedInternships(getPostedInternships());
    setPostedPlacements(getPostedPlacements());
    setUser(savedUser);
  }, [navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;

    return students.filter(student => {
      return [student.name, student.email, student.department, student.skills]
        .filter(Boolean)
        .some(field => field.toLowerCase().includes(term));
    });
  }, [search, students]);

  const selectedStudent = students.find(student => student.email === selectedEmail) || filteredStudents[0] || null;

  const resumeByEmail = useMemo(() => {
    return resumeRequests.reduce((acc, request) => {
      const current = acc[request.studentEmail];
      if (!current || new Date(request.submittedAt) > new Date(current.submittedAt)) {
        acc[request.studentEmail] = request;
      }
      return acc;
    }, {});
  }, [resumeRequests]);

  const internshipByEmail = useMemo(() => {
    return internshipApplications.reduce((acc, application) => {
      const list = acc[application.studentEmail] || [];
      list.push(application);
      acc[application.studentEmail] = list;
      return acc;
    }, {});
  }, [internshipApplications]);

  const placementByEmail = useMemo(() => {
    return placementApplications.reduce((acc, application) => {
      const list = acc[application.studentEmail] || [];
      list.push(application);
      acc[application.studentEmail] = list;
      return acc;
    }, {});
  }, [placementApplications]);

  const resumeQueue = resumeRequests.filter(item => item.status === 'pending');
  const internshipQueue = internshipApplications.filter(item => item.status === 'pending');
  const placementQueue = placementApplications.filter(item => item.status === 'pending');
  const listingQueue = listingRequests.filter(item => item.status === 'pending');

  const analytics = useMemo(() => {
    const approvedInternships = internshipApplications.filter(item => item.status === 'approved').length;
    const rejectedInternships = internshipApplications.filter(item => item.status === 'rejected').length;
    const pendingInternships = internshipApplications.filter(item => item.status === 'pending').length;

    const approvedPlacements = placementApplications.filter(item => item.status === 'approved').length;
    const rejectedPlacements = placementApplications.filter(item => item.status === 'rejected').length;
    const pendingPlacements = placementApplications.filter(item => item.status === 'pending').length;

    const deptMap = students.reduce((acc, student) => {
      const key = student.department || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const deptStats = Object.entries(deptMap).map(([department, count]) => ({
      department,
      count,
      percent: Math.round((count / Math.max(students.length, 1)) * 100)
    }));

    return {
      approvedInternships,
      rejectedInternships,
      pendingInternships,
      approvedPlacements,
      rejectedPlacements,
      pendingPlacements,
      pendingListings: listingQueue.length,
      pendingResume: resumeQueue.length,
      deptStats
    };
  }, [internshipApplications, listingQueue.length, placementApplications, resumeQueue.length, students]);

  const reviewResume = (id, status) => {
    const next = updateResumeRequestStatus(id, status, user?.name || 'Faculty');
    setResumeRequests(next);
    setToast(`Resume request ${status}.`);
  };

  const reviewInternship = (id, status) => {
    const next = updateInternshipApplicationStatus(id, status, user?.name || 'Faculty');
    setInternshipApplications(next);
    setToast(`Internship application ${status}.`);
  };

  const reviewPlacement = (id, status) => {
    const next = updatePlacementApplicationStatus(id, status, user?.name || 'Faculty');
    setPlacementApplications(next);
    setToast(`Placement application ${status}.`);
  };

  const reviewListing = (request, status) => {
    const next = updateOpportunityListingRequestStatus(request.id, status, user?.name || 'Faculty');
    setListingRequests(next);

    if (status === 'approved' && request.type === 'internship') {
      const nextPosted = addPostedInternship({
        ...request.opportunity,
        facultyApprovedAt: new Date().toISOString(),
        facultyReviewer: user?.name || 'Faculty'
      });
      setPostedInternships(nextPosted);
    }

    setToast(`Recruiter listing ${status}.`);
  };

  const handlePostField = (field, value) => {
    setPostForm(current => ({ ...current, [field]: value }));
  };

  const resetPostForm = () => {
    setPostForm(current => ({
      ...current,
      company: '',
      role: '',
      tags: '',
      description: '',
      stipend: '',
      package: ''
    }));
  };

  const submitOpportunityPost = event => {
    event.preventDefault();
    if (!postForm.company.trim() || !postForm.role.trim() || !postForm.deadline.trim() || !postForm.description.trim()) {
      setToast('Please fill company, role, deadline, and description.');
      return;
    }

    const basePayload = {
      id: Date.now(),
      company: postForm.company.trim(),
      role: postForm.role.trim(),
      logo: postForm.company.trim().slice(0, 3).toUpperCase(),
      location: postForm.location.trim() || 'Mumbai',
      department: postForm.department,
      deadline: postForm.deadline.trim(),
      description: postForm.description.trim(),
      tags: postForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      postedBy: user?.name || 'Faculty',
      postedAt: new Date().toISOString()
    };

    if (postType === 'internship') {
      const durationWeeks = Number(postForm.durationWeeks) || 8;
      const payload = {
        ...basePayload,
        stipend: postForm.stipend.trim() || 'Rs. 30,000/month',
        durationWeeks,
        duration: `${durationWeeks} Weeks`
      };
      const next = addPostedInternship(payload);
      setPostedInternships(next);
      setToast('Internship opportunity posted.');
    } else {
      const payload = {
        ...basePayload,
        package: postForm.package.trim() || 'Rs. 6.0 LPA',
        employmentType: postForm.employmentType || 'Full Time'
      };
      const next = addPostedPlacement(payload);
      setPostedPlacements(next);
      setToast('Placement opportunity posted.');
    }

    resetPostForm();
  };

  const logout = () => {
    localStorage.removeItem('crce_user');
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    ['profiles', 'groups', 'Student Profiles'],
    ['resume-approvals', 'fact_check', 'Resume Approvals'],
    ['opportunity-approvals', 'approval', 'Opportunity Approvals'],
    ['post-opportunities', 'add_box', 'Post Opportunities'],
    ['analytics', 'analytics', 'Placement + Internship Stats']
  ];

  const displayName = user.name || 'Faculty';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="portal-page faculty-page">
      <header className="portal-topbar">
        <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
          <span className="material-icons-outlined">menu</span>
        </button>
        <button className="brand-link portal-brand" onClick={() => navigate('/')}>
          <img src="/HEADER_LOGO.png" alt="CRCE Logo" />
          <span>Faculty Control Room</span>
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
        {activePage === 'profiles' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Faculty Portal</span>
              <h1>Profile directory with resume and opportunity state.</h1>
            </div>
            <div className="portal-card faculty-toolbar">
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by student, email, department, or skill" />
              <span>{filteredStudents.length} students</span>
            </div>
            <div className="faculty-grid">
              <article className="portal-card student-list-card">
                {filteredStudents.map(student => {
                  const latestResume = resumeByEmail[student.email];
                  const internshipApps = internshipByEmail[student.email] || [];
                  const placementApps = placementByEmail[student.email] || [];
                  const pendingCount = [...internshipApps, ...placementApps].filter(item => item.status === 'pending').length;
                  const approvedCount = [...internshipApps, ...placementApps].filter(item => item.status === 'approved').length;
                  return (
                    <button key={student.email} className={`student-list-item ${selectedStudent?.email === student.email ? 'active' : ''}`} onClick={() => setSelectedEmail(student.email)}>
                      <div>
                        <strong>{student.name || student.email}</strong>
                        <small>{student.department || 'Department pending'}</small>
                      </div>
                      <div className="list-meta">
                        <span className={`status-pill ${latestResume?.status || 'pending'}`}>{latestResume?.status || 'no review'}</span>
                        <small>{approvedCount} approved / {pendingCount} pending</small>
                      </div>
                    </button>
                  );
                })}
              </article>

              {selectedStudent && (
                <article className="portal-card student-detail-card">
                  <div className="student-detail-header">
                    <div className="avatar large">{(selectedStudent.name || 'S').charAt(0).toUpperCase()}</div>
                    <div>
                      <h3>{selectedStudent.name || 'Student'}</h3>
                      <p>{selectedStudent.email}</p>
                      <p>{selectedStudent.department || 'Department pending'} | {selectedStudent.year || 'Year pending'} | {selectedStudent.roll || 'Roll pending'}</p>
                    </div>
                  </div>

                  <div className="student-detail-grid">
                    <div>
                      <h4>Contact and Skills</h4>
                      <p><strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}</p>
                      <p><strong>LinkedIn:</strong> {selectedStudent.linkedin || 'Not provided'}</p>
                      <p><strong>Skills:</strong> {selectedStudent.skills || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4>Resume Snapshot</h4>
                      <p><strong>Education:</strong> {selectedStudent.resume?.education || 'Not available'}</p>
                      <p><strong>Experience:</strong> {selectedStudent.resume?.experience || 'Not available'}</p>
                      <p><strong>Projects:</strong> {selectedStudent.resume?.projects || 'Not available'}</p>
                      <p><strong>Skills:</strong> {selectedStudent.resume?.skills || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="internship-mini-grid">
                    {(internshipByEmail[selectedStudent.email] || []).slice(0, 3).map(application => (
                      <div className="mini-row" key={application.id}>
                        <span>Internship: {application.company} - {application.internshipRole}</span>
                        <strong className={`status-pill ${application.status}`}>{application.status}</strong>
                      </div>
                    ))}
                    {(placementByEmail[selectedStudent.email] || []).slice(0, 3).map(application => (
                      <div className="mini-row" key={application.id}>
                        <span>Placement: {application.company} - {application.placementRole}</span>
                        <strong className={`status-pill ${application.status}`}>{application.status}</strong>
                      </div>
                    ))}
                    {(internshipByEmail[selectedStudent.email] || []).length === 0 && (placementByEmail[selectedStudent.email] || []).length === 0 && <p>No opportunity applications yet.</p>}
                  </div>
                </article>
              )}
            </div>
          </section>
        )}

        {activePage === 'resume-approvals' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Resume Governance</span>
              <h1>Approve or reject every submitted resume update.</h1>
            </div>
            <div className="approval-grid">
              {resumeQueue.length === 0 && <article className="portal-card"><p>No pending resume requests.</p></article>}
              {resumeQueue.map(request => (
                <article className="portal-card approval-card" key={request.id}>
                  <div className="approval-head">
                    <div>
                      <h3>{request.studentName}</h3>
                      <p>{request.studentEmail}</p>
                    </div>
                    <span className="status-pill pending">pending</span>
                  </div>
                  <p>Submitted: {new Date(request.submittedAt).toLocaleString()}</p>
                  <div className="resume-snapshot-grid">
                    <p><strong>Education:</strong> {request.resumeSnapshot?.education || 'Not provided'}</p>
                    <p><strong>Experience:</strong> {request.resumeSnapshot?.experience || 'Not provided'}</p>
                    <p><strong>Projects:</strong> {request.resumeSnapshot?.projects || 'Not provided'}</p>
                    <p><strong>Skills:</strong> {request.resumeSnapshot?.skills || 'Not provided'}</p>
                  </div>
                  <div className="button-row">
                    <button className="btn btn-primary" onClick={() => reviewResume(request.id, 'approved')}>Approve</button>
                    <button className="btn btn-secondary" onClick={() => reviewResume(request.id, 'rejected')}>Reject</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === 'opportunity-approvals' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Opportunity Workflow</span>
              <h1>Review recruiter listing requests and student applications.</h1>
            </div>

            <div className="approval-grid">
              {listingQueue.length === 0 && internshipQueue.length === 0 && placementQueue.length === 0 && <article className="portal-card"><p>No pending opportunity approvals.</p></article>}

              {listingQueue.map(request => (
                <article className="portal-card approval-card" key={request.id}>
                  <div className="approval-head">
                    <div>
                      <h3>{request.opportunity.company} - {request.opportunity.role}</h3>
                      <p>{request.recruiterName} | {request.recruiterEmail}</p>
                    </div>
                    <span className="status-pill pending">listing</span>
                  </div>
                  <p><strong>Reason:</strong> {request.reason}</p>
                  <p><strong>Mode:</strong> {request.opportunity.mode} | <strong>Dates:</strong> {request.opportunity.startDate} to {request.opportunity.endDate}</p>
                  <p><strong>Domains:</strong> {(request.opportunity.domains || [request.opportunity.department]).join(', ')}</p>
                  <p><strong>Eligibility:</strong> {request.opportunity.eligibility}</p>
                  <p><strong>Assessment:</strong> {request.opportunity.assessmentPlan}</p>
                  <div className="button-row">
                    <button className="btn btn-primary" onClick={() => reviewListing(request, 'approved')}>Approve Listing</button>
                    <button className="btn btn-secondary" onClick={() => reviewListing(request, 'rejected')}>Reject Listing</button>
                  </div>
                </article>
              ))}

              {internshipQueue.map(application => (
                <article className="portal-card approval-card" key={application.id}>
                  <div className="approval-head">
                    <div>
                      <h3>{application.studentName}</h3>
                      <p>{application.studentEmail}</p>
                    </div>
                    <span className="status-pill pending">internship</span>
                  </div>
                  <p>{application.company} - {application.internshipRole}</p>
                  <p>Department: {application.department}</p>
                  <p>Submitted: {new Date(application.submittedAt).toLocaleString()}</p>
                  <div className="button-row">
                    <button className="btn btn-primary" onClick={() => reviewInternship(application.id, 'approved')}>Approve</button>
                    <button className="btn btn-secondary" onClick={() => reviewInternship(application.id, 'rejected')}>Reject</button>
                  </div>
                </article>
              ))}

              {placementQueue.map(application => (
                <article className="portal-card approval-card" key={application.id}>
                  <div className="approval-head">
                    <div>
                      <h3>{application.studentName}</h3>
                      <p>{application.studentEmail}</p>
                    </div>
                    <span className="status-pill pending">placement</span>
                  </div>
                  <p>{application.company} - {application.placementRole}</p>
                  <p>Department: {application.department}</p>
                  <p>Submitted: {new Date(application.submittedAt).toLocaleString()}</p>
                  <div className="button-row">
                    <button className="btn btn-primary" onClick={() => reviewPlacement(application.id, 'approved')}>Approve</button>
                    <button className="btn btn-secondary" onClick={() => reviewPlacement(application.id, 'rejected')}>Reject</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === 'post-opportunities' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Faculty Publishing</span>
              <h1>Post internships and placements to the student opportunities portal.</h1>
            </div>

            <div className="opportunity-tabs" role="tablist" aria-label="Select posting type">
              <button className={postType === 'internship' ? 'active' : ''} onClick={() => setPostType('internship')}>Internship Post</button>
              <button className={postType === 'placement' ? 'active' : ''} onClick={() => setPostType('placement')}>Placement Post</button>
            </div>

            <form className="portal-card post-opportunity-form" onSubmit={submitOpportunityPost}>
              <label>
                Company
                <input value={postForm.company} onChange={event => handlePostField('company', event.target.value)} placeholder="Company name" />
              </label>
              <label>
                Role
                <input value={postForm.role} onChange={event => handlePostField('role', event.target.value)} placeholder="Opportunity role" />
              </label>
              <label>
                Department
                <select value={postForm.department} onChange={event => handlePostField('department', event.target.value)}>
                  <option>Computer Engineering</option>
                  <option>Electronics & Computer Science</option>
                  <option>Mechanical Engineering</option>
                  <option>AI & Data Science</option>
                </select>
              </label>
              <label>
                Location
                <input value={postForm.location} onChange={event => handlePostField('location', event.target.value)} placeholder="Mumbai" />
              </label>
              <label>
                Deadline
                <input value={postForm.deadline} onChange={event => handlePostField('deadline', event.target.value)} placeholder="May 15, 2026" />
              </label>
              <label>
                Tags (comma separated)
                <input value={postForm.tags} onChange={event => handlePostField('tags', event.target.value)} placeholder="React, SQL, Problem Solving" />
              </label>
              {postType === 'internship' ? (
                <>
                  <label>
                    Stipend
                    <input value={postForm.stipend} onChange={event => handlePostField('stipend', event.target.value)} placeholder="Rs. 50,000/month" />
                  </label>
                  <label>
                    Duration (weeks)
                    <input value={postForm.durationWeeks} onChange={event => handlePostField('durationWeeks', event.target.value)} type="number" min="1" max="52" />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Package
                    <input value={postForm.package} onChange={event => handlePostField('package', event.target.value)} placeholder="Rs. 8.0 LPA" />
                  </label>
                  <label>
                    Employment Type
                    <select value={postForm.employmentType} onChange={event => handlePostField('employmentType', event.target.value)}>
                      <option>Full Time</option>
                      <option>Graduate Trainee</option>
                      <option>PPO</option>
                    </select>
                  </label>
                </>
              )}
              <label className="post-description">
                Description
                <textarea value={postForm.description} onChange={event => handlePostField('description', event.target.value)} placeholder="Describe role, expectations, and key details" />
              </label>
              <div className="button-row">
                <button className="btn btn-primary" type="submit">Publish Opportunity</button>
              </div>
            </form>

            <div className="portal-card posted-opportunities-grid">
              <h3>Recently Posted</h3>
              {[...postedInternships.slice(0, 4).map(item => ({ ...item, kind: 'Internship' })), ...postedPlacements.slice(0, 4).map(item => ({ ...item, kind: 'Placement' }))]
                .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
                .map(item => (
                  <div className="mini-row" key={`${item.kind}-${item.id}`}>
                    <span>{item.kind}: {item.company} - {item.role}</span>
                    <small>{item.deadline}</small>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activePage === 'analytics' && (
          <section className="portal-section">
            <div className="section-heading">
              <span className="eyebrow">Opportunity Analytics</span>
              <h1>Track approval velocity for internships and placements.</h1>
            </div>
            <div className="stats-card-grid">
              {[
                ['Pending Resume Reviews', analytics.pendingResume, 'fact_check'],
                ['Pending Listing Reviews', analytics.pendingListings, 'approval'],
                ['Pending Internship Reviews', analytics.pendingInternships, 'hourglass_top'],
                ['Pending Placement Reviews', analytics.pendingPlacements, 'hourglass_bottom'],
                ['Approved Internship Apps', analytics.approvedInternships, 'task_alt'],
                ['Approved Placement Apps', analytics.approvedPlacements, 'verified'],
                ['Rejected Opportunity Apps', analytics.rejectedInternships + analytics.rejectedPlacements, 'report']
              ].map(([label, value, icon]) => (
                <article className="stat-card" key={label}>
                  <span className="material-icons-outlined">{icon}</span>
                  <strong>{value}</strong>
                  <p>{label}</p>
                </article>
              ))}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Department Participation</h3>
                <span>Current student records</span>
              </div>
              <div className="bar-list">
                {analytics.deptStats.map(item => (
                  <div className="bar-row" key={item.department}>
                    <span>{item.department}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${item.percent}%` }} />
                    </div>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="portal-card faculty-opportunities">
              <h3>Open Opportunities in Portal</h3>
              <div className="internship-mini-grid">
                {internships.map(item => (
                  <div className="mini-row" key={item.id}>
                    <span>Internship: {item.company} - {item.role}</span>
                    <small>{item.department}</small>
                  </div>
                ))}
                {placements.map(item => (
                  <div className="mini-row" key={item.id}>
                    <span>Placement: {item.company} - {item.role}</span>
                    <small>{item.department}</small>
                  </div>
                ))}
                {postedInternships.map(item => (
                  <div className="mini-row" key={`posted-internship-${item.id}`}>
                    <span>Internship: {item.company} - {item.role}</span>
                    <small>{item.department}</small>
                  </div>
                ))}
                {postedPlacements.map(item => (
                  <div className="mini-row" key={`posted-placement-${item.id}`}>
                    <span>Placement: {item.company} - {item.role}</span>
                    <small>{item.department}</small>
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
