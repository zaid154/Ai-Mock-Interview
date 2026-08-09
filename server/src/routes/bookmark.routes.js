const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { wrap } = require('../utils/asyncHandler')
const bookmark = require('../controllers/bookmark.controller')

const router = Router()
router.use(requireAuth)

router.get('/', wrap(bookmark.listBookmarks))
router.post('/', wrap(bookmark.addBookmark))
router.patch('/:id/notes', wrap(bookmark.updateBookmarkNotes))
router.delete('/:id', wrap(bookmark.removeBookmark))

module.exports = router
