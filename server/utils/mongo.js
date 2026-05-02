function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function toPlain(doc) {
  if (!doc) return null;
  const value = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { _id, __v, ...rest } = value;
  return rest;
}

function toPlainList(docs) {
  return docs.map(toPlain);
}

function cleanUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  );
}

module.exports = {
  cleanUndefined,
  normalizeEmail,
  toPlain,
  toPlainList
};
