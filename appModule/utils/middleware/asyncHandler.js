/**
 * Utility middleware that wraps async route handlers to avoid try-catch blocks
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}