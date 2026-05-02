const STORAGE_KEYS = {
  user: 'crce_user',
  profile: 'crce_profile',
  photo: 'crce_photo',
  studentRecords: 'crce_student_records',
  resumeRequests: 'crce_resume_change_requests',
  internshipApplications: 'crce_internship_applications',
  placementApplications: 'crce_placement_applications',
  opportunityListingRequests: 'crce_opportunity_listing_requests',
  postedInternships: 'crce_posted_internships',
  postedPlacements: 'crce_posted_placements'
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function getJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Backend request failed.');
  }

  return payload;
}

function getLocalStudentRecords(seedStudents = []) {
  const current = getJson(STORAGE_KEYS.studentRecords, []);
  const byEmail = new Map();

  [...seedStudents, ...current].forEach(student => {
    const normalized = normalizeEmail(student.email);
    if (!normalized) return;
    byEmail.set(normalized, { ...byEmail.get(normalized), ...student, email: normalized });
  });

  const merged = [...byEmail.values()];
  setJson(STORAGE_KEYS.studentRecords, merged);
  return merged;
}

function upsertLocalStudentRecord(student, seedStudents = []) {
  const normalized = normalizeEmail(student.email);
  if (!normalized) return [];

  const records = getLocalStudentRecords(seedStudents);
  const index = records.findIndex(item => normalizeEmail(item.email) === normalized);
  const nextValue = { ...records[index], ...student, email: normalized };

  if (index >= 0) {
    records[index] = nextValue;
  } else {
    records.push(nextValue);
  }

  setJson(STORAGE_KEYS.studentRecords, records);
  return records;
}

function addLocalItem(key, item) {
  const items = getJson(key, []);
  const next = [{ ...item }, ...items];
  setJson(key, next);
  return next;
}

function updateLocalStatus(key, id, status, reviewerName) {
  const items = getJson(key, []).map(item => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      reviewedAt: new Date().toISOString(),
      reviewer: reviewerName || 'Faculty'
    };
  });
  setJson(key, items);
  return items;
}

export async function loginUser(credentials) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  });

  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
  return data.user;
}

export async function getStudentRecords(seedStudents = []) {
  try {
    const data = seedStudents.length
      ? await apiRequest('/students/seed', { method: 'POST', body: { students: seedStudents } })
      : await apiRequest('/students');
    setJson(STORAGE_KEYS.studentRecords, data.students || []);
    return data.students || [];
  } catch {
    return getLocalStudentRecords(seedStudents);
  }
}

export async function upsertStudentRecord(student, seedStudents = []) {
  try {
    const data = await apiRequest('/students/upsert', {
      method: 'POST',
      body: { student }
    });
    setJson(STORAGE_KEYS.studentRecords, data.students || []);
    return data.students || [];
  } catch {
    return upsertLocalStudentRecord(student, seedStudents);
  }
}

export async function getResumeRequests() {
  try {
    const data = await apiRequest('/resume-requests');
    setJson(STORAGE_KEYS.resumeRequests, data.resumeRequests || []);
    return data.resumeRequests || [];
  } catch {
    return getJson(STORAGE_KEYS.resumeRequests, []);
  }
}

export async function addResumeRequest(request) {
  try {
    const data = await apiRequest('/resume-requests', {
      method: 'POST',
      body: request
    });
    setJson(STORAGE_KEYS.resumeRequests, data.resumeRequests || []);
    return data.resumeRequests || [];
  } catch {
    return addLocalItem(STORAGE_KEYS.resumeRequests, request);
  }
}

export async function updateResumeRequestStatus(id, status, reviewerName) {
  try {
    const data = await apiRequest(`/resume-requests/${id}/status`, {
      method: 'PATCH',
      body: { status, reviewer: reviewerName || 'Faculty' }
    });
    setJson(STORAGE_KEYS.resumeRequests, data.resumeRequests || []);
    return data.resumeRequests || [];
  } catch {
    return updateLocalStatus(STORAGE_KEYS.resumeRequests, id, status, reviewerName);
  }
}

export async function getInternshipApplications() {
  try {
    const data = await apiRequest('/applications/internships');
    setJson(STORAGE_KEYS.internshipApplications, data.internshipApplications || []);
    return data.internshipApplications || [];
  } catch {
    return getJson(STORAGE_KEYS.internshipApplications, []);
  }
}

export async function addInternshipApplication(application) {
  try {
    const data = await apiRequest('/applications/internships', {
      method: 'POST',
      body: application
    });
    setJson(STORAGE_KEYS.internshipApplications, data.internshipApplications || []);
    return data.internshipApplications || [];
  } catch {
    return addLocalItem(STORAGE_KEYS.internshipApplications, application);
  }
}

export async function updateInternshipApplicationStatus(id, status, reviewerName) {
  try {
    const data = await apiRequest(`/applications/internships/${id}/status`, {
      method: 'PATCH',
      body: { status, reviewer: reviewerName || 'Faculty' }
    });
    setJson(STORAGE_KEYS.internshipApplications, data.internshipApplications || []);
    return data.internshipApplications || [];
  } catch {
    return updateLocalStatus(STORAGE_KEYS.internshipApplications, id, status, reviewerName);
  }
}

export async function getPlacementApplications() {
  try {
    const data = await apiRequest('/applications/placements');
    setJson(STORAGE_KEYS.placementApplications, data.placementApplications || []);
    return data.placementApplications || [];
  } catch {
    return getJson(STORAGE_KEYS.placementApplications, []);
  }
}

export async function addPlacementApplication(application) {
  try {
    const data = await apiRequest('/applications/placements', {
      method: 'POST',
      body: application
    });
    setJson(STORAGE_KEYS.placementApplications, data.placementApplications || []);
    return data.placementApplications || [];
  } catch {
    return addLocalItem(STORAGE_KEYS.placementApplications, application);
  }
}

export async function updatePlacementApplicationStatus(id, status, reviewerName) {
  try {
    const data = await apiRequest(`/applications/placements/${id}/status`, {
      method: 'PATCH',
      body: { status, reviewer: reviewerName || 'Faculty' }
    });
    setJson(STORAGE_KEYS.placementApplications, data.placementApplications || []);
    return data.placementApplications || [];
  } catch {
    return updateLocalStatus(STORAGE_KEYS.placementApplications, id, status, reviewerName);
  }
}

export async function getOpportunityListingRequests() {
  try {
    const data = await apiRequest('/opportunity-listing-requests');
    setJson(STORAGE_KEYS.opportunityListingRequests, data.listingRequests || []);
    return data.listingRequests || [];
  } catch {
    return getJson(STORAGE_KEYS.opportunityListingRequests, []);
  }
}

export async function addOpportunityListingRequest(request) {
  try {
    const data = await apiRequest('/opportunity-listing-requests', {
      method: 'POST',
      body: request
    });
    setJson(STORAGE_KEYS.opportunityListingRequests, data.listingRequests || []);
    return data.listingRequests || [];
  } catch {
    return addLocalItem(STORAGE_KEYS.opportunityListingRequests, request);
  }
}

export async function updateOpportunityListingRequestStatus(id, status, reviewerName) {
  try {
    const data = await apiRequest(`/opportunity-listing-requests/${id}/status`, {
      method: 'PATCH',
      body: { status, reviewer: reviewerName || 'Faculty' }
    });
    setJson(STORAGE_KEYS.opportunityListingRequests, data.listingRequests || []);
    return data.listingRequests || [];
  } catch {
    return updateLocalStatus(STORAGE_KEYS.opportunityListingRequests, id, status, reviewerName);
  }
}

export async function getPostedInternships() {
  try {
    const data = await apiRequest('/opportunities/internships');
    setJson(STORAGE_KEYS.postedInternships, data.postedInternships || []);
    return data.postedInternships || [];
  } catch {
    return getJson(STORAGE_KEYS.postedInternships, []);
  }
}

export async function addPostedInternship(opportunity) {
  try {
    const data = await apiRequest('/opportunities/internships', {
      method: 'POST',
      body: opportunity
    });
    setJson(STORAGE_KEYS.postedInternships, data.postedInternships || []);
    return data.postedInternships || [];
  } catch {
    return addLocalItem(STORAGE_KEYS.postedInternships, opportunity);
  }
}

export async function getPostedPlacements() {
  try {
    const data = await apiRequest('/opportunities/placements');
    setJson(STORAGE_KEYS.postedPlacements, data.postedPlacements || []);
    return data.postedPlacements || [];
  } catch {
    return getJson(STORAGE_KEYS.postedPlacements, []);
  }
}

export async function addPostedPlacement(opportunity) {
  try {
    const data = await apiRequest('/opportunities/placements', {
      method: 'POST',
      body: opportunity
    });
    setJson(STORAGE_KEYS.postedPlacements, data.postedPlacements || []);
    return data.postedPlacements || [];
  } catch {
    return addLocalItem(STORAGE_KEYS.postedPlacements, opportunity);
  }
}

export function getStorageKeys() {
  return STORAGE_KEYS;
}
