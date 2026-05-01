import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Converts markdown to sanitized HTML
 * @param {string} markdown - The markdown content to render
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(markdown) {
  const rawHtml = marked.parse(markdown || '');
  return DOMPurify.sanitize(rawHtml);
}

/**
 * Renders markdown to a truncated version with sanitized HTML
 * @param {string} markdown - The markdown content
 * @param {number} maxLength - Maximum character length before truncation
 * @returns {string} Truncated and sanitized HTML string
 */
export function sanitizeHtmlTruncated(markdown, maxLength = 500) {
  const truncated =
    markdown.length > maxLength
      ? markdown.slice(0, maxLength) + '...'
      : markdown;
  return sanitizeHtml(truncated);
}
