/**
 * @typedef {'admin' | 'editor' | 'author' | 'reader'} UserRole
 */

/**
 * @typedef {Object} AuthorProfile
 * @property {string} id
 * @property {string} bio
 * @property {string} [avatar]
 * @property {string} [website]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} [passwordHash]
 * @property {UserRole} role
 * @property {boolean} isVerified
 * @property {AuthorProfile} [authorProfile]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

module.exports = {};
