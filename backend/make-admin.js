require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const { Student } = require('./models/models');

async function run() {
  await connectDB();

  const email = 'anthanyanis@gmail.com';
  const plainPassword = 'anto';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const student = await Student.findOneAndUpdate(
    { email },
    { role: 'admin', status: 'approved', password: hashedPassword },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!student.fullName) {
    await Student.findOneAndUpdate(
      { email },
      { fullName: 'Admin', phone: '0000000000', schoolName: 'AAA College' }
    );
  }

  console.log(`✅ ${email} is now role=admin with password set`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
