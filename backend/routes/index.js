const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');
const { uploadImageBuffer } = require('../utils/cloudImageUpload');

const { register, sendOtp, login, adminLogin, me } = require('../controllers/authController');
const { startQuiz, saveAnswer, submitQuiz, leaderboard } = require('../controllers/quizController');
const {
  getStats, getLive, getQuestionStats,
  getStudents, approveStudent, rejectStudent,
  exportResults, resetLeaderboard, addQuestion, deleteQuestion, getQuestions,
  getQuizSettings, upsertQuizSettings,
  adminStartQuiz, adminStopQuiz, getQuizStatus,
} = require('../controllers/adminController');

// ── Multer (file uploads) ────────────────────────────────────────────────────
const MAX_UPLOAD_KB = 250;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_KB * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});
const uploadMarkSheet = (req, res, next) => {
  upload.single('markSheet')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File size must be ${MAX_UPLOAD_KB} KB or less.` });
    }
    if (err) return res.status(400).json({ message: err.message || 'File upload failed.' });
    next();
  });
};
const uploadMarkSheetToCloud = async (req, res, next) => {
  try {
    if (!req.file) return next();
    req.cloudImageUrl = await uploadImageBuffer(req.file);
    next();
  } catch (err) {
    res.status(502).json({ message: err.message || 'Could not upload image.' });
  }
};

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', uploadMarkSheet, uploadMarkSheetToCloud, register);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/login', login);
router.post('/auth/admin-login', adminLogin);
router.get('/auth/me', auth, me);

// ── Quiz ─────────────────────────────────────────────────────────────────────
router.get('/quiz/status', getQuizStatus);          // public — poll for quiz started
router.post('/quiz/start', auth, startQuiz);
router.post('/quiz/save-answer', auth, saveAnswer);
router.post('/quiz/submit', auth, submitQuiz);
router.get('/quiz/leaderboard', leaderboard);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.post('/admin/quiz/start', auth, adminOnly, adminStartQuiz);
router.post('/admin/quiz/stop', auth, adminOnly, adminStopQuiz);
router.get('/admin/stats', auth, adminOnly, getStats);
router.get('/admin/live', auth, adminOnly, getLive);
router.get('/admin/question-stats', auth, adminOnly, getQuestionStats);
router.get('/admin/students', auth, adminOnly, getStudents);
router.patch('/admin/students/:id/approve', auth, adminOnly, approveStudent);
router.patch('/admin/students/:id/reject', auth, adminOnly, rejectStudent);
router.get('/admin/export', auth, adminOnly, exportResults);
router.delete('/admin/leaderboard', auth, adminOnly, resetLeaderboard);
router.get('/admin/questions', auth, adminOnly, getQuestions);
router.post('/admin/questions', auth, adminOnly, addQuestion);
router.delete('/admin/questions/:id', auth, adminOnly, deleteQuestion);
router.get('/admin/quiz-settings', auth, adminOnly, getQuizSettings);
router.post('/admin/quiz-settings', auth, adminOnly, upsertQuizSettings);

module.exports = router;
