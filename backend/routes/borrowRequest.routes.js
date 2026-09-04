const express = require('express');
const {
    createRequest,
    getSentRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest
} = require('../controllers/borrowRequest.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);

router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);

module.exports = router;
