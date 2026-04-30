const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

// ─────────────────────────────────────────────────────────────────────────────
// 1. STUDENT (Users)
// ─────────────────────────────────────────────────────────────────────────────
const studentSchema = new Schema(
  {
    // Identity
    fullName:         { type: String, required: true, trim: true },
    email:            {
                        type: String, required: true, unique: true,
                        lowercase: true, trim: true,
                        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
                      },
    phone:            { type: String, required: true, trim: true },

    // Academic
    schoolName:       { type: String, required: true, trim: true },
    yearOfCompletion: { type: String, default: '2025' },
    markSheetPath:    { type: String, default: null },   // uploaded file path

    // Access control
    role:             { type: String, enum: ['student', 'admin'], default: 'student' },
    status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isApproved:       { type: Boolean, default: false },  // mirrors status === 'approved'

    // Admin password
    password:         { type: String, default: null, select: false },

    // OTP login (no stored password — OTP-based auth)
    otp:              { type: String, default: null, select: false },
    otpExpiry:        { type: Date,   default: null, select: false },

    // Quiz state
    hasAttempted:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Keep isApproved in sync with status automatically
studentSchema.pre('save', function (next) {
  this.isApproved = this.status === 'approved';
  next();
});

// Indexes
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ status: 1 });
studentSchema.index({ role: 1 });


// ─────────────────────────────────────────────────────────────────────────────
// 2. QUIZ SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
const quizSettingsSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true, default: 'AI Quiz Competition 2026' },
    startTime:   { type: Date, required: true },
    duration:    { type: Number, default: 20, min: 1 },   // minutes
    isActive:    { type: Boolean, default: true },
    password:    { type: String, default: null },          // optional quiz unlock password
    quizStarted: { type: Boolean, default: false },        // admin manually starts the quiz
    createdBy:   { type: Types.ObjectId, ref: 'Student', required: true },
  },
  { timestamps: true }
);

// Computed virtual: endTime
quizSettingsSchema.virtual('endTime').get(function () {
  return new Date(this.startTime.getTime() + this.duration * 60 * 1000);
});

// Computed virtual: isLive
quizSettingsSchema.virtual('isLive').get(function () {
  const now = Date.now();
  return this.isActive && now >= this.startTime && now <= this.endTime;
});

quizSettingsSchema.set('toJSON', { virtuals: true });
quizSettingsSchema.set('toObject', { virtuals: true });

// Index
quizSettingsSchema.index({ startTime: 1 });
quizSettingsSchema.index({ isActive: 1 });


// ─────────────────────────────────────────────────────────────────────────────
// 3. QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const questionSchema = new Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options:      {
                    type: [String], required: true,
                    validate: {
                      validator: v => v.length === 4 && v.every(o => o.trim().length > 0),
                      message: 'Exactly 4 non-empty options are required',
                    },
                  },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    topic:        { type: String, default: 'General', trim: true },
    difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    createdBy:    { type: Types.ObjectId, ref: 'Student', default: null },
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1 });
questionSchema.index({ difficulty: 1 });


// ─────────────────────────────────────────────────────────────────────────────
// 4. QUIZ ATTEMPT (Results)
// ─────────────────────────────────────────────────────────────────────────────

// Sub-document: one answer entry
const answerEntrySchema = new Schema(
  {
    questionId:     { type: Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: Number, min: 0, max: 3, default: null },  // null = skipped
  },
  { _id: false }
);

const attemptSchema = new Schema(
  {
    // References
    student:        { type: Types.ObjectId, ref: 'Student', required: true, unique: true },
    quizSettings:   { type: Types.ObjectId, ref: 'QuizSettings', default: null },

    // Questions assigned to this student (randomised subset)
    questions:      [{ type: Types.ObjectId, ref: 'Question' }],

    // Answers — stored as both Map (fast per-question lookup) and array (for export/analysis)
    answers:        { type: Map, of: Number, default: () => new Map() },
    answersArray:   { type: [answerEntrySchema], default: [] },

    // Scoring
    score:          { type: Number, default: 0, min: 0 },
    totalMarks:     { type: Number, default: 20 },
    percentage:     { type: Number, default: 0, min: 0, max: 100 },

    // Timing
    timeTaken:      { type: Number, default: 0 },   // seconds elapsed
    startedAt:      { type: Date, default: Date.now },
    submittedAt:    { type: Date, default: null },

    // State
    isSubmitted:    { type: Boolean, default: false },

    // Email tracking
    emailSent:      { type: Boolean, default: false },
    emailSentAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-calculate percentage before save
attemptSchema.pre('save', function (next) {
  if (this.isSubmitted && this.totalMarks > 0) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
  }
  next();
});

// Indexes
attemptSchema.index({ student: 1 }, { unique: true });
attemptSchema.index({ score: -1 });                          // leaderboard sort
attemptSchema.index({ score: -1, timeTaken: 1 });            // leaderboard: score desc, time asc
attemptSchema.index({ isSubmitted: 1 });
attemptSchema.index({ submittedAt: -1 });


// ─────────────────────────────────────────────────────────────────────────────
// MODEL EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  Student:      mongoose.model('Student',      studentSchema),
  QuizSettings: mongoose.model('QuizSettings', quizSettingsSchema),
  Question:     mongoose.model('Question',     questionSchema),
  QuizAttempt:  mongoose.model('QuizAttempt',  attemptSchema),
};
