const { Router } = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { wrap } = require('../utils/asyncHandler')
const bookmark = require('../controllers/bookmarkController')

const router = Router()
router.use(requireAuth)

router.get('/', wrap(bookmark.listBookmarks))
router.post('/', wrap(bookmark.addBookmark))
router.post('/toggle', wrap(bookmark.toggleBookmark))
router.patch('/:id/notes', wrap(bookmark.updateBookmarkNotes))
router.delete('/:id', wrap(bookmark.removeBookmark))

module.exports = router
