const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { wrap } = require('../utils/asyncHandler')
const admin = require('../controllers/admin.controller')
const certTemplates = require('../controllers/certificateTemplate.controller')

const router = Router()

// Every admin route requires a signed-in admin.
router.use(requireAuth, requireAdmin)

const settingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
})
const renameSchema = z.object({ newKey: z.string().min(1, 'New key is required') })
const verifiedSchema = z.object({ isVerified: z.boolean() })
const roleSchema = z.object({ role: z.enum(['user', 'admin']) })

// Users
router.get('/users', wrap(admin.listUsers))
router.patch('/users/:id/verified', validate(verifiedSchema), wrap(admin.setUserVerified))
router.patch('/users/:id/role', validate(roleSchema), wrap(admin.setUserRole))
router.delete('/users/:id', wrap(admin.deleteUser))

// Certificate milestones. `key` is optional on create — the controller slugifies
// the title when it is missing. Bounds mirror the model so a bad payload is
// rejected before it reaches Mongoose.
const templateSchema = z.object({
  key: z.string().trim().min(1).max(40).optional(),
  title: z.string().trim().min(2, 'A title is required'),
  description: z.string().trim().max(400).optional(),
  subtitle: z.string().trim().max(200).optional(),
  reqCount: z.coerce.number().int().min(1).max(500).optional(),
  reqMinScore: z.coerce.number().min(0).max(100).optional(),
  reqScore: z.union([z.coerce.number().min(0).max(100), z.null()]).optional(),
  design: z.enum(['classic', 'modern', 'elegant']).optional(),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #4f46e5').optional(),
  enabled: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
})
// Every field is optional on edit so the panel can PATCH a single toggle.
const templatePatchSchema = templateSchema.partial()

router.get('/certificate-templates', wrap(certTemplates.listTemplates))
router.post('/certificate-templates', validate(templateSchema), wrap(certTemplates.createTemplate))
router.patch('/certificate-templates/:id', validate(templatePatchSchema), wrap(certTemplates.updateTemplate))
router.delete('/certificate-templates/:id', wrap(certTemplates.deleteTemplate))
router.post('/certificate-templates/reset', wrap(certTemplates.resetTemplates))

// Flexible settings
router.get('/settings', wrap(admin.listSettings))
router.put('/settings', validate(settingSchema), wrap(admin.upsertSetting))
router.patch('/settings/:key/rename', validate(renameSchema), wrap(admin.renameSetting))
router.delete('/settings/:key', wrap(admin.deleteSetting))

module.exports = router
