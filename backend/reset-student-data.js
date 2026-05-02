require('dotenv').config();
const connectDB = require('./db');
const { Student, QuizAttempt } = require('./models/models');

async function main() {
  if (process.env.RESET_STUDENT_DATA !== 'YES') {
    throw new Error('Refusing to reset. Set RESET_STUDENT_DATA=YES to confirm.');
  }

  await connectDB();

  const [studentResult, attemptResult] = await Promise.all([
    Student.deleteMany({ role: 'student' }),
    QuizAttempt.deleteMany({}),
  ]);

  const [remainingStudents, remainingAttempts, admins] = await Promise.all([
    Student.countDocuments({ role: 'student' }),
    QuizAttempt.countDocuments({}),
    Student.countDocuments({ role: 'admin' }),
  ]);

  console.log(`Deleted students: ${studentResult.deletedCount || 0}`);
  console.log(`Deleted quiz attempts: ${attemptResult.deletedCount || 0}`);
  console.log(`Remaining students: ${remainingStudents}`);
  console.log(`Remaining quiz attempts: ${remainingAttempts}`);
  console.log(`Admin accounts kept: ${admins}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
