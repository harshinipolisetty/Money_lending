const express = require('express');
const {
    createTransaction,
    getTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByType,
    getTransactionsByFriend
} = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.get('/type/:type', getTransactionsByType);
router.get('/friend/:friendName', getTransactionsByFriend);
router.get('/:friendName', getTransactionsByFriend);

router.route('/:id')
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction);

module.exports = router;
