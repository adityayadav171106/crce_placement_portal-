/* ============================
   CRCE Student Portal - JS
   ============================ */

// ========== MOCK DATA ==========

const internships = [
    {
        id: 1,
        company: "JP Morgan Chase",
        role: "Software Engineering Intern",
        logo: "JPM",
        stipend: "₹80,000/month",
        duration: "12 Weeks",
        durationWeeks: 12,
        location: "Mumbai",
        department: "Computer Engineering",
        deadline: "Mar 10, 2026",
        tags: ["Java", "Spring Boot", "AWS"],
        description: "Work with the Corporate & Investment Banking technology team."
    },
    {
        id: 2,
        company: "Microsoft",
        role: "SDE Intern",
        logo: "MS",
        stipend: "₹1,00,000/month",
        duration: "16 Weeks",
        durationWeeks: 16,
        location: "Hyderabad",
        department: "Computer Engineering",
        deadline: "Mar 5, 2026",
        tags: ["C#", ".NET", "Azure"],
        description: "Build cloud-native solutions for Microsoft 365."
    },
    {
        id: 3,
        company: "TCS Research",
        role: "Data Science Intern",
        logo: "TCS",
        stipend: "₹35,000/month",
        duration: "8 Weeks",
        durationWeeks: 8,
        location: "Pune",
        department: "AI & Data Science",
        deadline: "Mar 15, 2026",
        tags: ["Python", "ML", "TensorFlow"],
        description: "Work on AI-driven solutions for enterprise clients."
    },
    {
        id: 4,
        company: "Google",
        role: "STEP Intern",
        logo: "G",
        stipend: "₹1,20,000/month",
        duration: "12 Weeks",
        durationWeeks: 12,
        location: "Bangalore",
        department: "Computer Engineering",
        deadline: "Feb 28, 2026",
        tags: ["Python", "Go", "Cloud"],
        description: "Contribute to Google Search and AI infrastructure."
    },
    {
        id: 5,
        company: "Accenture",
        role: "Technology Consulting Intern",
        logo: "ACC",
        stipend: "₹40,000/month",
        duration: "8 Weeks",
        durationWeeks: 8,
        location: "Mumbai",
        department: "Electronics & Computer Science",
        deadline: "Mar 20, 2026",
        tags: ["Consulting", "Cloud", "Agile"],
        description: "Join the digital transformation consulting team."
    },
    {
        id: 6,
        company: "SAP Labs",
        role: "Full Stack Developer Intern",
        logo: "SAP",
        stipend: "₹60,000/month",
        duration: "12 Weeks",
        durationWeeks: 12,
        location: "Bangalore",
        department: "Computer Engineering",
        deadline: "Mar 8, 2026",
        tags: ["React", "Node.js", "HANA"],
        description: "Build enterprise applications on SAP BTP platform."
    },
    {
        id: 7,
        company: "Tata Motors",
        role: "Mechanical Design Intern",
        logo: "TM",
        stipend: "₹30,000/month",
        duration: "8 Weeks",
        durationWeeks: 8,
        location: "Pune",
        department: "Mechanical Engineering",
        deadline: "Mar 25, 2026",
        tags: ["CATIA", "AutoCAD", "FEA"],
        description: "Work on next-gen EV chassis design and simulation."
    },
    {
        id: 8,
        company: "ICICI Securities",
        role: "Quantitative Analyst Intern",
        logo: "ICICI",
        stipend: "₹50,000/month",
        duration: "12 Weeks",
        durationWeeks: 12,
        location: "Mumbai",
        department: "AI & Data Science",
        deadline: "Mar 12, 2026",
        tags: ["Python", "Statistics", "Finance"],
        description: "Develop quantitative models for derivatives pricing."
    },
    {
        id: 9,
        company: "Infosys",
        role: "Systems Engineer Intern",
        logo: "INF",
        stipend: "₹25,000/month",
        duration: "4 Weeks",
        durationWeeks: 4,
        location: "Mysuru",
        department: "Electronics & Computer Science",
        deadline: "Apr 1, 2026",
        tags: ["Java", "SQL", "Linux"],
        description: "Training and project work in enterprise solutions."
    },
    {
        id: 10,
        company: "Amazon",
        role: "SDE Intern",
        logo: "AMZ",
        stipend: "₹90,000/month",
        duration: "12 Weeks",
        durationWeeks: 12,
        location: "Hyderabad",
        department: "Computer Engineering",
        deadline: "Mar 3, 2026",
        tags: ["Java", "AWS", "Distributed Systems"],
        description: "Build scalable services for Amazon's retail platform."
    }
];

const recruiters = [
    {
        name: "Microsoft",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
        roles: "SDE, PM, Data Scientist",
        package: "18 - 44 LPA"
    },
    {
        name: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        roles: "SDE, STEP, SRE",
        package: "20 - 48 LPA"
    },
    {
        name: "Amazon",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        roles: "SDE, Data Engineer",
        package: "16 - 38 LPA"
    },
    {
        name: "JP Morgan Chase",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/J.P._Morgan_Logo_2008_1.svg",
        roles: "SWE, Quant Analyst",
        package: "14 - 30 LPA"
    },
    {
        name: "TCS",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
        roles: "System Engineer, Developer",
        package: "4 - 11 LPA"
    },
    {
        name: "Infosys",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Infosys_logo.svg",
        roles: "SE, Power Programmer",
        package: "3.6 - 9 LPA"
    },
    {
        name: "Accenture",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
        roles: "ASE, Technology Analyst",
        package: "4.5 - 12 LPA"
    },
    {
        name: "SAP Labs",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg",
        roles: "Developer, Consultant",
        package: "10 - 22 LPA"
    },
    {
        name: "ICICI Securities",
        logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/ICICI_Bank_Logo.svg",
        roles: "Analyst, Developer",
        package: "6 - 14 LPA"
    },
    {
        name: "Tata Motors",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg",
        roles: "Design Engineer, R&D",
        package: "5 - 12 LPA"
    },
    {
        name: "Barclays",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Barclays_logo.svg",
        roles: "Technology Analyst",
        package: "12 - 22 LPA"
    },
    {
        name: "Capgemini",
        logo: "https://upload.wikimedia.org/wikipedia/commons/9/99/Capgemini_Logo.svg",
        roles: "Associate Consultant",
        package: "4 - 8 LPA"
    }
];

// ========== APPLIED STATE ==========
let appliedInternships = JSON.parse(localStorage.getItem('crce_applied') || '[]');

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserInfo();
    loadProfile();
    renderInternships();
    handleHashNavigation();
    loadResumeBuilder();
});

window.addEventListener('hashchange', handleHashNavigation);

// ========== AUTH ==========
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('crce_user'));
    if (!user || !user.loggedIn) {
        window.location.href = '/login';
    }
}

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('crce_user'));
    if (!user) return;

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'S';
    const displayName = user.name || 'Student';

    document.getElementById('topbarUserName').textContent = displayName;
    document.getElementById('topbarAvatar').textContent = initial;
    document.getElementById('sidebarAvatar').textContent = initial;
    document.getElementById('sidebarUserName').textContent = displayName;
    document.getElementById('sidebarUserEmail').textContent = user.email || 'student@crce.edu.in';
}

function handleLogout() {
    localStorage.removeItem('crce_user');
    window.location.href = '/login';
}

// ========== NAVIGATION ==========
function navigateTo(pageId, navElement) {
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navElement) navElement.classList.add('active');

    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        closeSidebar();
    }

    // Update hash without triggering hashchange loop
    window.history.replaceState(null, '', '#' + pageId);
}

function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '') || 'profile';
    const navItem = document.querySelector(`.nav-item[data-page="${hash}"]`);
    if (navItem) {
        navigateTo(hash, navItem);
    }
}

// ========== SIDEBAR TOGGLE ==========
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
}

function collapseSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const btn = document.getElementById('sidebarCollapseBtn');
    const icon = btn.querySelector('.material-icons-outlined');
    if (document.body.classList.contains('sidebar-collapsed')) {
        icon.textContent = 'chevron_right';
        btn.title = 'Expand sidebar';
    } else {
        icon.textContent = 'chevron_left';
        btn.title = 'Collapse sidebar';
    }
}

// ========== TOAST ==========
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== PROFILE ==========
function saveProfile(e) {
    e.preventDefault();
    const profile = {
        name: document.getElementById('profName').value,
        email: document.getElementById('profEmail').value,
        department: document.getElementById('profDept').value,
        year: document.getElementById('profYear').value,
        roll: document.getElementById('profRoll').value,
        phone: document.getElementById('profPhone').value,
        skills: document.getElementById('profSkills').value,
        linkedin: document.getElementById('profLinkedin').value
    };
    localStorage.setItem('crce_profile', JSON.stringify(profile));

    // Update display
    document.getElementById('profileDisplayName').textContent = profile.name || 'Student Name';
    document.getElementById('profileDisplayDept').textContent = profile.department || 'Department';
    document.getElementById('profileDisplayYear').textContent = profile.year || 'Year';

    // Update user info in sidebar/topbar
    if (profile.name) {
        const user = JSON.parse(localStorage.getItem('crce_user') || '{}');
        user.name = profile.name;
        localStorage.setItem('crce_user', JSON.stringify(user));
        loadUserInfo();
    }

    showToast('Profile saved successfully!');
}

function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('crce_profile'));
    const user = JSON.parse(localStorage.getItem('crce_user') || '{}');

    if (profile) {
        document.getElementById('profName').value = profile.name || '';
        document.getElementById('profEmail').value = profile.email || user.email || '';
        document.getElementById('profDept').value = profile.department || '';
        document.getElementById('profYear').value = profile.year || '';
        document.getElementById('profRoll').value = profile.roll || '';
        document.getElementById('profPhone').value = profile.phone || '';
        document.getElementById('profSkills').value = profile.skills || '';
        document.getElementById('profLinkedin').value = profile.linkedin || '';

        document.getElementById('profileDisplayName').textContent = profile.name || 'Student Name';
        document.getElementById('profileDisplayDept').textContent = profile.department || 'Department';
        document.getElementById('profileDisplayYear').textContent = profile.year || 'Year';
    } else {
        document.getElementById('profEmail').value = user.email || '';
    }

    // Load saved photo
    const savedPhoto = localStorage.getItem('crce_photo');
    if (savedPhoto) {
        document.getElementById('profilePhoto').innerHTML = `<img src="${savedPhoto}" alt="Profile">`;
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const photoDiv = document.getElementById('profilePhoto');
        photoDiv.innerHTML = `<img src="${e.target.result}" alt="Profile">`;
        localStorage.setItem('crce_photo', e.target.result);
        showToast('Profile photo updated!');
    };
    reader.readAsDataURL(file);
}

// ========== RESUME ==========
function handleResumeDrop(event) {
    event.preventDefault();
    event.target.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file) processResumeFile(file);
}

function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (file) processResumeFile(file);
}

function processResumeFile(file) {
    const validTypes = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
        showToast('Please upload a PDF, DOC, or DOCX file.');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be under 5MB.');
        return;
    }

    document.getElementById('uploadedFileName').textContent = file.name;
    document.getElementById('uploadedFileSize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('uploadedFileInfo').style.display = 'flex';
    document.getElementById('resumeDropZone').style.display = 'none';

    localStorage.setItem('crce_resume_name', file.name);
    localStorage.setItem('crce_resume_size', file.size);
    showToast('Resume uploaded successfully!');
}

function removeResume() {
    document.getElementById('uploadedFileInfo').style.display = 'none';
    document.getElementById('resumeDropZone').style.display = 'block';
    document.getElementById('resumeFileInput').value = '';
    localStorage.removeItem('crce_resume_name');
    localStorage.removeItem('crce_resume_size');
}

function saveResumeBuilder() {
    const data = {
        education: document.getElementById('rbEducation').value,
        experience: document.getElementById('rbExperience').value,
        projects: document.getElementById('rbProjects').value,
        skills: document.getElementById('rbSkills').value
    };
    localStorage.setItem('crce_resume_builder', JSON.stringify(data));
    showToast('Resume data saved!');
}

function loadResumeBuilder() {
    const data = JSON.parse(localStorage.getItem('crce_resume_builder'));
    if (data) {
        document.getElementById('rbEducation').value = data.education || '';
        document.getElementById('rbExperience').value = data.experience || '';
        document.getElementById('rbProjects').value = data.projects || '';
        document.getElementById('rbSkills').value = data.skills || '';
    }

    // Load uploaded file display
    const resumeName = localStorage.getItem('crce_resume_name');
    if (resumeName) {
        document.getElementById('uploadedFileName').textContent = resumeName;
        const resumeSize = localStorage.getItem('crce_resume_size');
        document.getElementById('uploadedFileSize').textContent =
            (parseInt(resumeSize) / (1024 * 1024)).toFixed(2) + ' MB';
        document.getElementById('uploadedFileInfo').style.display = 'flex';
        document.getElementById('resumeDropZone').style.display = 'none';
    }
}

function downloadResume() {
    const data = JSON.parse(localStorage.getItem('crce_resume_builder'));
    const profile = JSON.parse(localStorage.getItem('crce_profile'));

    if (!data && !profile) {
        showToast('Please fill in your resume details first.');
        return;
    }

    // Generate a simple text resume and download
    const name = profile?.name || 'Student';
    const email = profile?.email || '';
    const phone = profile?.phone || '';

    let text = `${name.toUpperCase()}\n`;
    text += `${email}${phone ? ' | ' + phone : ''}\n`;
    text += `${'='.repeat(50)}\n\n`;

    if (data?.education) text += `EDUCATION\n${'-'.repeat(20)}\n${data.education}\n\n`;
    if (data?.experience) text += `EXPERIENCE\n${'-'.repeat(20)}\n${data.experience}\n\n`;
    if (data?.projects) text += `PROJECTS\n${'-'.repeat(20)}\n${data.projects}\n\n`;
    if (data?.skills) text += `SKILLS\n${'-'.repeat(20)}\n${data.skills}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resume downloaded!');
}

// ========== ACCORDION ==========
function toggleAccordion(header) {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

    // Open clicked if it wasn't open
    if (!isOpen) {
        item.classList.add('open');
    }
}

// ========== INTERNSHIPS ==========
function renderInternships(data = internships) {
    const grid = document.getElementById('internshipGrid');
    if (data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dim);">
                <span class="material-icons-outlined" style="font-size: 48px; display: block; margin-bottom: 1rem;">search_off</span>
                <p>No internships match your search criteria.</p>
            </div>`;
        return;
    }

    grid.innerHTML = data.map(intern => {
        const isApplied = appliedInternships.includes(intern.id);
        return `
        <div class="internship-card">
            <div class="internship-card-header">
                <div class="company-logo-sm">${intern.logo}</div>
                <div>
                    <h4>${intern.role}</h4>
                    <p>${intern.company}</p>
                </div>
            </div>
            <div class="internship-details">
                <div class="detail-item">
                    <span class="material-icons-outlined">currency_rupee</span>
                    ${intern.stipend}
                </div>
                <div class="detail-item">
                    <span class="material-icons-outlined">schedule</span>
                    ${intern.duration}
                </div>
                <div class="detail-item">
                    <span class="material-icons-outlined">location_on</span>
                    ${intern.location}
                </div>
                <div class="detail-item">
                    <span class="material-icons-outlined">apartment</span>
                    ${intern.department}
                </div>
            </div>
            <div class="internship-tags">
                ${intern.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <div class="internship-card-footer">
                <span class="deadline">Deadline: <strong>${intern.deadline}</strong></span>
                ${isApplied
                ? `<button class="btn-apply btn-applied" disabled>
                        <span class="material-icons-outlined" style="font-size:16px;">check</span> Applied
                    </button>`
                : `<button class="btn-apply" onclick="applyInternship(${intern.id}, this)">
                        <span class="material-icons-outlined" style="font-size:16px;">send</span> Apply
                    </button>`
            }
            </div>
        </div>`;
    }).join('');
}

function applyInternship(id, btn) {
    if (appliedInternships.includes(id)) return;

    if (confirm('Are you sure you want to apply for this internship?')) {
        appliedInternships.push(id);
        localStorage.setItem('crce_applied', JSON.stringify(appliedInternships));

        btn.classList.add('btn-applied');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px;">check</span> Applied';
        showToast('Application submitted successfully!');
    }
}

function filterInternships() {
    const search = document.getElementById('internshipSearch').value.toLowerCase();
    const dept = document.getElementById('filterDept').value;
    const duration = document.getElementById('filterDuration').value;

    let filtered = internships.filter(i => {
        const matchSearch = !search ||
            i.company.toLowerCase().includes(search) ||
            i.role.toLowerCase().includes(search) ||
            i.tags.some(t => t.toLowerCase().includes(search));

        const matchDept = !dept || i.department === dept;

        let matchDuration = true;
        if (duration) {
            const weeks = parseInt(duration);
            if (weeks === 16) {
                matchDuration = i.durationWeeks >= 16;
            } else {
                matchDuration = i.durationWeeks === weeks;
            }
        }

        return matchSearch && matchDept && matchDuration;
    });

    renderInternships(filtered);
}

// ========== RECRUITERS ==========
// Recruiter section removed from portal

