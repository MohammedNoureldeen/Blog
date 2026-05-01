/**
 * @typedef {'text' | 'heading' | 'image' | 'code' | 'list' | 'quote' | 'divider'} BlockType
 */

/**
 * @typedef {Object} Block
 * @property {string} id
 * @property {BlockType} type
 * @property {string} content
 * @property {Object} [metadata]
 * @property {number} order
 */

/**
 * @typedef {Object} PostContent
 * @property {Block[]} blocks
 */

/**
 * @typedef {'draft' | 'published' | 'archived'} PostStatus
 */

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {PostContent} content
 * @property {string} [coverImage]
 * @property {PostStatus} status
 * @property {string} authorId
 * @property {string[]} tags
 * @property {string} [publishedAt]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

module.exports = {};
