const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');

const { register, sendOtp, login, adminLogin, me } = require('../controllers/authController');
const { startQuiz, saveAnswer, submitQuiz, leaderboard } = require('../controllers/quizController');
const {
  getStats, getLive, getQuestionStats,
  getStudents, approveStudent, rejectStudent,
  exportResults, addQuestion, deleteQuestion, getQuestions,
  getQuizSettings, upsertQuizSettings,
  adminStartQuiz, adminStopQuiz, getQuizStatus,
} = require('../controllers/adminController');

// ── Multer (file uploads) ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// ── Test mail ────────────────────────────────────────────────────────────────
router.get('/test-mail', async (req, res) => {
  try {
    const { sendOtpEmail } = require('../utils/mailer');
    await sendOtpEmail(process.env.MAIL_USER, '123456');
    res.json({ message: 'Test email sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', upload.single('markSheet'), register);
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
router.get('/admin/questions', auth, adminOnly, getQuestions);
router.post('/admin/questions', auth, adminOnly, addQuestion);
router.delete('/admin/questions/:id', auth, adminOnly, deleteQuestion);
router.get('/admin/quiz-settings', auth, adminOnly, getQuizSettings);
router.post('/admin/quiz-settings', auth, adminOnly, upsertQuizSettings);

module.exports = router;
