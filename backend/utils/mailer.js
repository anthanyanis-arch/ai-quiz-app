const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"AI Quiz 2026" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your OTP – AI Quiz Competition 2026',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#0f172a;margin-bottom:8px">AI Quiz Competition 2026</h2>
        <p style="color:#6b7280">AAA College of Engineering and Technology</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#374151">Your One-Time Password is:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#0f172a;margin:16px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">This OTP is valid for ${process.env.OTP_EXPIRY || 10} minutes. Do not share it with anyone.</p>
      </div>`,
  });
};

const sendResultEmail = async (to, name, score, total, timeTaken) => {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? 'Distinction' : pct >= 60 ? 'Merit' : 'Participation';
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  await transporter.sendMail({
    from: `"AI Quiz 2026" <${process.env.MAIL_USER}>`,
    to,
    subject: `Your AI Quiz Result – ${score}/${total} | ${grade}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="color:#0f172a;margin:0">AI Quiz Competition 2026</h2>
          <p style="color:#6b7280;margin:4px 0 0">AAA College of Engineering and Technology</p>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px"/>
        <p style="color:#374151">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151">Thank you for participating! Here are your results:</p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:24px;margin:20px 0;text-align:center">
          <div style="font-size:48px;font-weight:bold;color:#0f172a">${score}<span style="font-size:24px;color:#6b7280">/${total}</span></div>
          <div style="font-size:14px;color:#6b7280;margin-top:4px">${pct}% · Time: ${mins}m ${secs}s</div>
          <div style="display:inline-block;margin-top:12px;padding:6px 18px;border-radius:999px;background:${pct>=80?'#dcfce7':pct>=60?'#fef9c3':'#f1f5f9'};color:${pct>=80?'#166534':pct>=60?'#854d0e':'#475569'};font-weight:600;font-size:13px">${grade}</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:20px 0">
          <p style="margin:0;color:#1e40af;font-size:13px">🏆 Your e-certificate will be issued by the department within 24 hours for eligible participants.</p>
        </div>
        <p style="color:#6b7280;font-size:13px">View the full leaderboard at the competition portal.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center">Dept. of Artificial Intelligence and Data Science · AAA College of Engineering and Technology</p>
      </div>`,
  });
};

module.exports = { sendOtpEmail, sendResultEmail };
