const express = require('express');
const {
    requestRepayment,
    getPending,
    getHistory,
    approve,
    reject
} = require('../controllers/repayment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/request', requestRepayment);
router.get('/pending', getPending);
router.get('/history', getHistory);
router.put('/:id/approve', approve);
router.put('/:id/reject', reject);

module.exports = router;
