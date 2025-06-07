const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { getPendingUsers, approveUser, getAllUsers, removeUser, getUserbyNIP, updateUserbyNIP } = require('../controllers/adminController');

router.use(authenticate, isAdmin);

router.get('/users/pending', getPendingUsers);
router.get('/users', getAllUsers);
router.get('/users/:nip', getUserbyNIP);
router.put('/users/:nip', updateUserbyNIP);
router.delete('/users/:nip', removeUser);

module.exports = router;