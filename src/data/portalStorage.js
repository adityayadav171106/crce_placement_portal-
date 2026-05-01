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

export function getStudentRecords(seedStudents = []) {
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

export function upsertStudentRecord(student, seedStudents = []) {
  const normalized = normalizeEmail(student.email);
  if (!normalized) return [];

  const records = getStudentRecords(seedStudents);
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

export function getResumeRequests() {
  return getJson(STORAGE_KEYS.resumeRequests, []);
}

export function addResumeRequest(request) {
  const requests = getResumeRequests();
  const next = [{ ...request }, ...requests];
  setJson(STORAGE_KEYS.resumeRequests, next);
  return next;
}

export function updateResumeRequestStatus(id, status, reviewerName) {
  const requests = getResumeRequests().map(item => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      reviewedAt: new Date().toISOString(),
      reviewer: reviewerName || 'Faculty'
    };
  });
  setJson(STORAGE_KEYS.resumeRequests, requests);
  return requests;
}

export function getInternshipApplications() {
  return getJson(STORAGE_KEYS.internshipApplications, []);
}

export function addInternshipApplication(application) {
  const applications = getInternshipApplications();
  const next = [{ ...application }, ...applications];
  setJson(STORAGE_KEYS.internshipApplications, next);
  return next;
}

export function updateInternshipApplicationStatus(id, status, reviewerName) {
  const applications = getInternshipApplications().map(item => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      reviewedAt: new Date().toISOString(),
      reviewer: reviewerName || 'Faculty'
    };
  });
  setJson(STORAGE_KEYS.internshipApplications, applications);
  return applications;
}

export function getPlacementApplications() {
  return getJson(STORAGE_KEYS.placementApplications, []);
}

export function addPlacementApplication(application) {
  const applications = getPlacementApplications();
  const next = [{ ...application }, ...applications];
  setJson(STORAGE_KEYS.placementApplications, next);
  return next;
}

export function updatePlacementApplicationStatus(id, status, reviewerName) {
  const applications = getPlacementApplications().map(item => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      reviewedAt: new Date().toISOString(),
      reviewer: reviewerName || 'Faculty'
    };
  });
  setJson(STORAGE_KEYS.placementApplications, applications);
  return applications;
}

export function getOpportunityListingRequests() {
  return getJson(STORAGE_KEYS.opportunityListingRequests, []);
}

export function addOpportunityListingRequest(request) {
  const requests = getOpportunityListingRequests();
  const next = [{ ...request }, ...requests];
  setJson(STORAGE_KEYS.opportunityListingRequests, next);
  return next;
}

export function updateOpportunityListingRequestStatus(id, status, reviewerName) {
  const requests = getOpportunityListingRequests().map(item => {
    if (item.id !== id) return item;
    return {
      ...item,
      status,
      reviewedAt: new Date().toISOString(),
      reviewer: reviewerName || 'Faculty'
    };
  });
  setJson(STORAGE_KEYS.opportunityListingRequests, requests);
  return requests;
}

export function getPostedInternships() {
  return getJson(STORAGE_KEYS.postedInternships, []);
}

export function addPostedInternship(opportunity) {
  const items = getPostedInternships();
  const next = [{ ...opportunity }, ...items];
  setJson(STORAGE_KEYS.postedInternships, next);
  return next;
}

export function getPostedPlacements() {
  return getJson(STORAGE_KEYS.postedPlacements, []);
}

export function addPostedPlacement(opportunity) {
  const items = getPostedPlacements();
  const next = [{ ...opportunity }, ...items];
  setJson(STORAGE_KEYS.postedPlacements, next);
  return next;
}

export function getStorageKeys() {
  return STORAGE_KEYS;
}
