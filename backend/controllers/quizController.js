const { Question, QuizAttempt, Student, QuizSettings } = require('../models/models');
const { sendResultEmail } = require('../utils/mailer');

// POST /api/quiz/start
const startQuiz = async (req, res) => {
  try {
    const student = req.user;

    if (student.hasAttempted) {
      return res.status(403).json({ message: 'You have already attempted the quiz' });
    }

    // Resume existing unsubmitted attempt
    let attempt = await QuizAttempt.findOne({ student: student._id, isSubmitted: false })
      .populate('questions', 'questionText options _id');

    if (!attempt) {
      // Pick 20 random questions
      const allQuestions = await Question.find({});
      if (allQuestions.length < 20) {
        return res.status(500).json({ message: 'Not enough questions in the database' });
      }
      const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 20);

      const settings = await QuizSettings.findOne({ isActive: true }).sort({ startTime: -1 });

      // Check if quiz is over
      if (settings && settings.quizStarted) {
        const quizEndTime = new Date(settings.startTime).getTime() + (settings.duration || 20) * 60 * 1000;
        if (Date.now() > quizEndTime) {
          return res.status(403).json({ quizOver: true, message: 'Quiz is over! Better luck next time.' });
        }
      }

      attempt = await QuizAttempt.create({
        student: student._id,
        quizSettings: settings?._id ?? null,
        questions: shuffled.map(q => q._id),
        totalMarks: shuffled.length,
        answers: {},
        answersArray: [],
        startedAt: new Date(),
      });
      attempt = await attempt.populate('questions', 'questionText options _id');
    }

    // Calculate remaining time
    const elapsed = Math.floor((Date.now() - attempt.startedAt) / 1000);
    const totalSeconds = 20 * 60;
    const remaining = Math.max(0, totalSeconds - elapsed);

    res.json({
      attemptId: attempt._id,
      questions: attempt.questions.map(q => ({
        id: q._id,
        questionText: q.questionText,
        options: q.options,
      })),
      answers: Object.fromEntries(attempt.answers),
      duration: Math.ceil(remaining / 60),
      remainingSeconds: remaining,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quiz/save-answer
const saveAnswer = async (req, res) => {
  try {
    const { questionId, answerIndex } = req.body;
    if (questionId === undefined || answerIndex === undefined) {
      return res.status(400).json({ message: 'questionId and answerIndex are required' });
    }

    const attempt = await QuizAttempt.findOne({ student: req.user._id, isSubmitted: false });
    if (!attempt) return res.status(404).json({ message: 'No active quiz attempt found' });

    attempt.answers.set(String(questionId), answerIndex);
    await attempt.save();

    res.json({ message: 'Answer saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quiz/submit
const submitQuiz = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ student: req.user._id, isSubmitted: false })
      .populate('questions');

    if (!attempt) return res.status(404).json({ message: 'No active quiz attempt found' });

    // Score calculation
    let score = 0;
    const answersArray = [];
    for (const question of attempt.questions) {
      const selected = attempt.answers.get(String(question._id)) ?? null;
      answersArray.push({ questionId: question._id, selectedOption: selected });
      if (selected !== null && selected === question.correctIndex) score++;
    }

    const timeTaken = Math.floor((Date.now() - attempt.startedAt) / 1000);

    attempt.score = score;
    attempt.totalMarks = attempt.questions.length;
    attempt.timeTaken = timeTaken;
    attempt.submittedAt = new Date();
    attempt.isSubmitted = true;
    attempt.answersArray = answersArray;
    // percentage is auto-calculated by pre-save hook
    await attempt.save();

    // Mark student as attempted
    const student = await Student.findByIdAndUpdate(req.user._id, { hasAttempted: true }, { new: true });

    // Send result email (non-blocking) and mark emailSent
    sendResultEmail(student.email, student.fullName, score, attempt.questions.length, timeTaken)
      .then(() => QuizAttempt.findByIdAndUpdate(attempt._id, { emailSent: true, emailSentAt: new Date() }))
      .catch(err => console.error('Result email error:', err.message));

    res.json({
      message: 'Quiz submitted successfully',
      score,
      totalMarks: attempt.totalMarks,
      timeTaken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quiz/leaderboard
const leaderboard = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ isSubmitted: true })
      .populate('student', 'fullName schoolName')
      .sort({ score: -1, timeTaken: 1 })
      .limit(100);

    const data = attempts.map((a, i) => ({
      rank: i + 1,
      name: a.student?.fullName || 'Unknown',
      school: a.student?.schoolName || '',
      score: a.score,
      total: a.totalMarks,
      timeTaken: a.timeTaken,
      submittedAt: a.submittedAt,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { startQuiz, saveAnswer, submitQuiz, leaderboard };
