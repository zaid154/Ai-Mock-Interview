const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { wrap } = require('../utils/asyncHandler')
const admin = require('../controllers/admin.controller')

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

// Flexible settings
router.get('/settings', wrap(admin.listSettings))
router.put('/settings', validate(settingSchema), wrap(admin.upsertSetting))
router.patch('/settings/:key/rename', validate(renameSchema), wrap(admin.renameSetting))
router.delete('/settings/:key', wrap(admin.deleteSetting))

module.exports = router
