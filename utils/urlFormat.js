// src/utils/urlFormat.js
const formatForUrl = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

module.exports = { formatForUrl };
