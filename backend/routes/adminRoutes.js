const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllTestResults,
  deleteResource,
  deleteTest,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/test-results', getAllTestResults);
router.delete('/resources/:id', deleteResource);
router.delete('/tests/:id', deleteTest);

module.exports = router;