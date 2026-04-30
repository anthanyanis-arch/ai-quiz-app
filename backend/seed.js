require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const { Student, Question, QuizSettings } = require('./models/models');

const questions = [
  { questionText: 'What does AI stand for?', options: ['Automated Intelligence', 'Artificial Intelligence', 'Augmented Interface', 'Analytical Input'], correctIndex: 1, topic: 'Basics', difficulty: 'easy' },
  { questionText: 'Which of the following is a supervised learning algorithm?', options: ['K-Means', 'DBSCAN', 'Linear Regression', 'PCA'], correctIndex: 2, topic: 'ML', difficulty: 'easy' },
  { questionText: 'What is the full form of NLP?', options: ['Natural Language Processing', 'Neural Learning Protocol', 'Network Layer Protocol', 'None'], correctIndex: 0, topic: 'NLP', difficulty: 'easy' },
  { questionText: 'Which activation function outputs values between 0 and 1?', options: ['ReLU', 'Tanh', 'Sigmoid', 'Softmax'], correctIndex: 2, topic: 'Deep Learning', difficulty: 'medium' },
  { questionText: 'What is overfitting in machine learning?', options: ['Model performs well on training but poorly on test data', 'Model performs poorly on both', 'Model performs well on test data only', 'None of the above'], correctIndex: 0, topic: 'ML', difficulty: 'medium' },
  { questionText: 'Which company developed ChatGPT?', options: ['Google', 'Meta', 'OpenAI', 'Microsoft'], correctIndex: 2, topic: 'General', difficulty: 'easy' },
  { questionText: 'What does CNN stand for in deep learning?', options: ['Central Neural Network', 'Convolutional Neural Network', 'Clustered Node Network', 'Computed Neuron Network'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'easy' },
  { questionText: 'Which algorithm is used for both classification and regression?', options: ['K-Means', 'Decision Tree', 'PCA', 'Apriori'], correctIndex: 1, topic: 'ML', difficulty: 'medium' },
  { questionText: 'What is the purpose of a loss function?', options: ['To increase model accuracy', 'To measure prediction error', 'To store model weights', 'To split data'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'medium' },
  { questionText: 'Which of the following is an unsupervised learning technique?', options: ['Linear Regression', 'Logistic Regression', 'K-Means Clustering', 'SVM'], correctIndex: 2, topic: 'ML', difficulty: 'easy' },
  { questionText: 'What is a neural network inspired by?', options: ['Computer circuits', 'The human brain', 'DNA structure', 'Solar system'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'easy' },
  { questionText: 'Which language is most commonly used for AI development?', options: ['Java', 'C++', 'Python', 'Ruby'], correctIndex: 2, topic: 'General', difficulty: 'easy' },
  { questionText: 'What does RNN stand for?', options: ['Recursive Neural Network', 'Recurrent Neural Network', 'Rapid Node Network', 'Relational Neural Network'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'medium' },
  { questionText: 'What is the Turing Test used for?', options: ['Testing computer speed', 'Measuring AI intelligence', 'Checking network security', 'Evaluating database performance'], correctIndex: 1, topic: 'Basics', difficulty: 'easy' },
  { questionText: 'Which of the following is a reinforcement learning concept?', options: ['Gradient descent', 'Reward and punishment', 'Backpropagation', 'Dropout'], correctIndex: 1, topic: 'ML', difficulty: 'medium' },
  { questionText: 'What does GPU stand for?', options: ['General Processing Unit', 'Graphics Processing Unit', 'Global Processing Unit', 'Graphical Program Utility'], correctIndex: 1, topic: 'General', difficulty: 'easy' },
  { questionText: 'Which library is used for deep learning in Python?', options: ['NumPy', 'Pandas', 'TensorFlow', 'Matplotlib'], correctIndex: 2, topic: 'Tools', difficulty: 'easy' },
  { questionText: 'What is the purpose of dropout in neural networks?', options: ['Speed up training', 'Prevent overfitting', 'Increase model size', 'Reduce dataset size'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'medium' },
  { questionText: 'What is a chatbot?', options: ['A robot that cleans', 'A software that simulates conversation', 'A hardware device', 'A type of database'], correctIndex: 1, topic: 'NLP', difficulty: 'easy' },
  { questionText: 'Which of the following is NOT a type of machine learning?', options: ['Supervised', 'Unsupervised', 'Reinforcement', 'Compiled'], correctIndex: 3, topic: 'ML', difficulty: 'easy' },
  { questionText: 'What is the vanishing gradient problem?', options: ['Gradients become too large', 'Gradients become too small during backprop', 'Loss function diverges', 'Weights are not updated'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'hard' },
  { questionText: 'Which algorithm is used in recommendation systems?', options: ['Decision Tree', 'Collaborative Filtering', 'Linear Regression', 'Naive Bayes'], correctIndex: 1, topic: 'ML', difficulty: 'medium' },
  { questionText: 'What does LSTM stand for?', options: ['Long Short-Term Memory', 'Large Scale Training Model', 'Linear Sequential Training Method', 'Layered Supervised Training Model'], correctIndex: 0, topic: 'Deep Learning', difficulty: 'medium' },
  { questionText: 'Which of the following is a generative AI model?', options: ['SVM', 'Random Forest', 'GAN', 'KNN'], correctIndex: 2, topic: 'Deep Learning', difficulty: 'medium' },
  { questionText: 'What is transfer learning?', options: ['Moving data between servers', 'Using a pre-trained model on a new task', 'Transferring weights to a new layer', 'None of the above'], correctIndex: 1, topic: 'Deep Learning', difficulty: 'medium' },
];

async function seed() {
  await connectDB();

  // Seed questions
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log(`✅ Inserted ${questions.length} questions`);

  // Seed admin
  const adminEmail = 'admin@aaacet.ac.in';
  const existing = await Student.findOne({ email: adminEmail });
  if (!existing) {
    await Student.create({
      fullName: 'Admin',
      email: adminEmail,
      phone: '0000000000',
      schoolName: 'AAA College',
      status: 'approved',
      role: 'admin',
    });
    console.log(`✅ Admin created  →  email: ${adminEmail}`);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed a test student (pre-approved so you can test login immediately)
  const testEmail = 'test@student.com';
  const testExists = await Student.findOne({ email: testEmail });
  if (!testExists) {
    await Student.create({
      fullName: 'Test Student',
      email: testEmail,
      phone: '9999999999',
      schoolName: 'Test School',
      status: 'approved',
      role: 'student',
    });
    console.log(`✅ Test student created  →  email: ${testEmail}`);
  } else {
    console.log('ℹ️  Test student already exists');
  }

  console.log('\n📋 Login instructions:');
  console.log('   Admin  → email: admin@aaacet.ac.in  (OTP shown in browser/console in dev mode)');
  console.log('   Student→ email: test@student.com    (OTP shown in browser/console in dev mode)');

  // Seed QuizSettings (start 5 minutes from now for easy testing)
  await QuizSettings.deleteMany({});
  const admin = await Student.findOne({ email: 'admin@aaacet.ac.in' });
  const startTime = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now
  await QuizSettings.create({
    title: 'AI Quiz Competition 2026',
    startTime,
    duration: 20,
    isActive: true,
    password: process.env.QUIZ_PASSWORD || '4680',
    createdBy: admin._id,
  });
  console.log(`✅ QuizSettings created  →  startTime: ${startTime.toISOString()}`);

  await mongoose.disconnect();
  console.log('\n✅ Seeding complete');
}

seed().catch(err => { console.error(err); process.exit(1); });
