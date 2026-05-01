const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  await resend.emails.send({
    from: 'AI Quiz 2026 <onboarding@resend.dev>',
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

  await resend.emails.send({
    from: 'AI Quiz 2026 <onboarding@resend.dev>',
    to,
    subject: `Your AI Quiz Result – ${score}/${total} | ${grade}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb">
        <h2 style="color:#0f172a;margin:0">AI Quiz Competition 2026</h2>
        <p style="color:#374151">Dear <strong>${name}</strong>, your score: <strong>${score}/${total}</strong> (${pct}%) — ${grade}</p>
        <p style="color:#374151">Time taken: ${mins}m ${secs}s</p>
      </div>`,
  });
};

module.exports = { sendOtpEmail, sendResultEmail };
