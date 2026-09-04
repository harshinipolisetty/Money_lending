const express = require('express');
const { searchUsers, getAllUsers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/all', getAllUsers);

module.exports = router;
