const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { wrap } = require('../utils/asyncHandler')
const templates = require('../controllers/certificateTemplate.controller')

const router = Router()

// Read-only for candidates. The Certificates page needs the milestone list to
// render at all, so this sits outside the admin boundary — but still behind auth,
// since only a signed-in candidate has certificates to earn.
router.get('/templates', requireAuth, wrap(templates.listPublicTemplates))

module.exports = router
