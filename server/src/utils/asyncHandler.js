// Wraps an async route handler so a rejected promise is passed to Express'
// error handler instead of crashing the request. Lets handlers just `await`.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = { wrap }
