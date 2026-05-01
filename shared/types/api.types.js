/**
 * @typedef {'not_found' | 'unauthorized' | 'forbidden' | 'validation_error' | 'conflict' | 'internal_error' | 'rate_limited'} AppErrorCode
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {T} [data]
 * @property {string} [message]
 * @property {AppErrorCode} [errorCode]
 * @property {Object[]} [errors]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]} items
 * @property {PaginationMeta} meta
 */

module.exports = {};
