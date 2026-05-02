const { Student, QuizAttempt, Question, QuizSettings } = require('../models/models');
const xlsx = require('xlsx');

function safeFilenamePart(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-z0-9_-]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalStudents, approved, attempts] = await Promise.all([
      Student.countDocuments({ role: 'student' }),
      Student.countDocuments({ status: 'approved' }),
      QuizAttempt.find({ isSubmitted: true }),
    ]);

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts
      ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) * 10) / 10
      : 0;
    const highestScore = totalAttempts ? Math.max(...attempts.map(a => a.score)) : 0;
    const completionRate = approved ? Math.round((totalAttempts / approved) * 100) : 0;

    res.json({ totalStudents, approved, totalAttempts, avgScore, highestScore, completionRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/live
const getLive = async (req, res) => {
  try {
    const [active, submitted] = await Promise.all([
      QuizAttempt.countDocuments({ isSubmitted: false }),
      QuizAttempt.countDocuments({ isSubmitted: true }),
    ]);
    res.json({ active, submitted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/question-stats
const getQuestionStats = async (req, res) => {
  try {
    const questions = await Question.find({});
    const attempts = await QuizAttempt.find({ isSubmitted: true });

    const stats = questions.map(q => {
      let correct = 0, total = 0;
      for (const attempt of attempts) {
        const ans = attempt.answers.get(String(q._id));
        if (ans !== undefined) {
          total++;
          if (ans === q.correctIndex) correct++;
        }
      }
      return {
        topic: q.topic,
        accuracy: total ? Math.round((correct / total) * 100) : 0,
      };
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/students
const getStudents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'student' };
    if (status) filter.status = status;
    const students = await Student.find(filter).select('-otp -otpExpiry').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/students/:id/approve
const approveStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).select('-otp -otpExpiry');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student approved', student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/students/:id/reject
const rejectStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).select('-otp -otpExpiry');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student rejected', student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/export  – download results as .xlsx
const exportResults = async (req, res) => {
  try {
    const zone = req.query.zone ? String(req.query.zone).trim() : '';
    const attempts = await QuizAttempt.find({ isSubmitted: true })
      .populate('student', 'fullName email phone schoolName')
      .sort({ score: -1, timeTaken: 1 });

    const rows = attempts.map((a, i) => ({
      Rank: i + 1,
      ...(zone ? { Zone: zone } : {}),
      Name: a.student?.fullName || '',
      Email: a.student?.email || '',
      Phone: a.student?.phone || '',
      School: a.student?.schoolName || '',
      Score: a.score,
      'Total Marks': a.totalMarks,
      'Time Taken (s)': a.timeTaken,
      'Submitted At': a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '',
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, zone ? `${safeFilenamePart(zone).slice(0, 20) || 'Zone'} Results` : 'Results');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = zone ? `quiz_results_${safeFilenamePart(zone) || 'zone'}.xlsx` : 'quiz_results.xlsx';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/leaderboard - clear attempts for next zonal quiz
const resetLeaderboard = async (req, res) => {
  try {
    const [attemptResult, studentResult] = await Promise.all([
      QuizAttempt.deleteMany({}),
      Student.updateMany({ role: 'student' }, { hasAttempted: false }),
    ]);

    res.json({
      message: 'Leaderboard cleared. Students can attempt the next zonal quiz.',
      deletedAttempts: attemptResult.deletedCount || 0,
      resetStudents: studentResult.modifiedCount || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/questions  – add a question
const addQuestion = async (req, res) => {
  try {
    const { questionText, options, correctIndex, topic, difficulty } = req.body;
    if (!questionText || !options || correctIndex === undefined) {
      return res.status(400).json({ message: 'questionText, options and correctIndex are required' });
    }
    const q = await Question.create({ questionText, options, correctIndex, topic, difficulty });
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/quiz-settings
const getQuizSettings = async (req, res) => {
  try {
    const settings = await QuizSettings.findOne({ isActive: true }).sort({ startTime: -1 });
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/quiz/start  – admin starts the quiz (students can now enter)
const adminStartQuiz = async (req, res) => {
  try {
    let settings = await QuizSettings.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!settings) {
      // Auto-create a default settings doc if none exists
      settings = await QuizSettings.create({
        title: 'AI Quiz Competition 2026',
        startTime: new Date(),
        duration: 20,
        isActive: true,
        quizStarted: true,
        createdBy: req.user._id,
      });
    } else {
      settings.quizStarted = true;
      settings.startTime = new Date();
      await settings.save();
    }
    res.json({ message: 'Quiz started', quizStarted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/quiz/stop  – admin stops the quiz
const adminStopQuiz = async (req, res) => {
  try {
    await QuizSettings.updateMany({ isActive: true }, { quizStarted: false });
    res.json({ message: 'Quiz stopped', quizStarted: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quiz/status  – public: returns whether quiz has been started by admin
const getQuizStatus = async (req, res) => {
  try {
    const settings = await QuizSettings.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json({ quizStarted: settings?.quizStarted || false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/quiz-settings  – create or replace active settings
const upsertQuizSettings = async (req, res) => {
  try {
    const { title, startTime, duration, password } = req.body;
    if (!startTime) return res.status(400).json({ message: 'startTime is required' });

    // Deactivate previous settings
    await QuizSettings.updateMany({}, { isActive: false });

    const settings = await QuizSettings.create({
      title: title || 'AI Quiz Competition 2026',
      startTime: new Date(startTime),
      duration: duration || 20,
      password: password || null,
      isActive: true,
      createdBy: req.user._id,
    });
    res.status(201).json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats, getLive, getQuestionStats,
  getStudents, approveStudent, rejectStudent,
  exportResults, resetLeaderboard, addQuestion, deleteQuestion, getQuestions,
  getQuizSettings, upsertQuizSettings,
  adminStartQuiz, adminStopQuiz, getQuizStatus,
};
