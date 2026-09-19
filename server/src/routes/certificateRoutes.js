const { Router } = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { wrap } = require('../utils/asyncHandler')
const templates = require('../controllers/certificateTemplateController')

const router = Router()

// Public verification endpoint for QR codes and shared credentials
router.get('/verify/:certId', wrap(templates.verifyCertificate))

// Read-only for candidates
router.get('/templates', requireAuth, wrap(templates.listPublicTemplates))

module.exports = router
