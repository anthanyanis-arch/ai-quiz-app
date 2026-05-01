const https = require('https');

const sendEmail = (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender: { name: 'AI Quiz 2026', email: 'anthanyanis@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html
    });
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => res.statusCode < 300 ? resolve() : reject(new Error(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const sendOtpEmail = (to, otp) => sendEmail(
  to,
  'Your OTP – AI Quiz Competition 2026',
  `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
    <h2 style="color:#0f172a">AI Quiz Competition 2026</h2>
    <p style="color:#6b7280">AAA College of Engineering and Technology</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <p style="color:#374151">Your One-Time Password is:</p>
    <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#0f172a;margin:16px 0">${otp}</div>
    <p style="color:#6b7280;font-size:13px">Valid for ${process.env.OTP_EXPIRY || 10} minutes. Do not share it.</p>
  </div>`
);

const sendResultEmail = (to, name, score, total, timeTaken) => {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? 'Distinction' : pct >= 60 ? 'Merit' : 'Participation';
  const mins = Math.floor(timeTaken / 60), secs = timeTaken % 60;
  return sendEmail(
    to,
    `Your AI Quiz Result – ${score}/${total} | ${grade}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#0f172a">AI Quiz Competition 2026</h2>
      <p>Dear <strong>${name}</strong>, your score: <strong>${score}/${total}</strong> (${pct}%) — ${grade}</p>
      <p>Time taken: ${mins}m ${secs}s</p>
    </div>`
  );
};

module.exports = { sendOtpEmail, sendResultEmail };
