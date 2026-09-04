const toE164 = (phone, defaultCountryCode = process.env.SMS_COUNTRY_CODE || '+91') => {
    if (!phone) return null;
    const trimmed = String(phone).trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('+')) {
        const digits = trimmed.replace(/[^\d+]/g, '');
        return digits.length > 4 ? digits : null;
    }
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length === 10) {
        return `${defaultCountryCode}${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('0')) {
        return `${defaultCountryCode}${digits.slice(1)}`;
    }
    return `+${digits}`;
};

const formatInr = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

const appUrl = () =>
    String(process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map((value) => value.trim())
        .find(Boolean) || 'http://localhost:5173';

const buildMessage = ({ borrowerName, amount, reason }) => {
    const money = formatInr(amount);
    const who = borrowerName || 'A friend';
    const note = reason ? ` Reason: ${reason}` : '';
    const dashboard = `${appUrl()}/lender-dashboard`;
    const html = `
        <p><b>${escapeHtml(who)}</b> asked to borrow <b>${escapeHtml(money)}</b> on LendLoop.</p>
        ${reason ? `<p>Reason: ${escapeHtml(reason)}</p>` : ''}
        <p><a href="${dashboard}">Open your lender dashboard</a> to accept or reject.</p>
    `;
    return {
        subject: `${who} asked to borrow ${money} on LendLoop`,
        text: `${who} has asked to borrow ${money} from you on LendLoop.${note}\n\nOpen your lender dashboard to accept or reject:\n${dashboard}`,
        html,
        sms: `${who} asked to borrow ${money} on LendLoop.${note} Open lender dashboard to respond.`
    };
};

const sendTwilioEmail = async ({ to, subject, text, html }) => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromAddress =
        process.env.TWILIO_EMAIL_FROM || (sid ? `${sid}@twilio.email` : '');

    if (!sid || !token || !fromAddress) {
        return null;
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const response = await fetch('https://comms.twilio.com/v1/Emails', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: {
                address: fromAddress,
                name: process.env.TWILIO_EMAIL_FROM_NAME || 'LendLoop'
            },
            to: [{ address: to }],
            content: {
                subject,
                html: html || `<p>${escapeHtml(text)}</p>`,
                text
            }
        })
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Twilio email failed (${response.status})`);
    }

    return { status: 'sent' };
};

const sendSmtpEmail = async ({ to, subject, text }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_PORT || '587') === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `LendLoop <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    });

    return { status: 'sent' };
};

const sendEmail = async ({ to, subject, text, html }) => {
    const twilioResult = await sendTwilioEmail({ to, subject, text, html });
    if (twilioResult) return twilioResult;

    const smtpResult = await sendSmtpEmail({ to, subject, text });
    if (smtpResult) return smtpResult;

    return { status: 'skipped', reason: 'email not configured' };
};

const sendSms = async ({ to, body }) => {
    const number = toE164(to);
    if (!number) {
        return { status: 'skipped', reason: 'no phone number' };
    }
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM) {
        return { status: 'skipped', reason: 'sms not configured' };
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
        from: process.env.TWILIO_FROM,
        to: number,
        body
    });

    return { status: 'sent' };
};

exports.notifyBorrowRequest = async ({ lender, borrower, amount, reason }) => {
    if (!lender) {
        return { email: { status: 'skipped' }, sms: { status: 'skipped' } };
    }

    const content = buildMessage({
        borrowerName: borrower?.name,
        amount,
        reason
    });

    const result = { email: { status: 'skipped' }, sms: { status: 'skipped' } };

    if (lender.email) {
        try {
            result.email = await sendEmail({
                to: lender.email,
                subject: content.subject,
                text: content.text,
                html: content.html
            });
        } catch (error) {
            console.error('Borrow-request email failed:', error.message);
            result.email = { status: 'failed', reason: error.message };
        }
    }

    if (lender.phone) {
        try {
            result.sms = await sendSms({
                to: lender.phone,
                body: content.sms
            });
        } catch (error) {
            console.error('Borrow-request SMS failed:', error.message);
            result.sms = { status: 'failed', reason: error.message };
        }
    } else {
        result.sms = { status: 'skipped', reason: 'no phone number' };
    }

    console.log(
        `Borrow-request notify email=${result.email?.status}${result.email?.reason ? ` (${result.email.reason})` : ''} sms=${result.sms?.status}${result.sms?.reason ? ` (${result.sms.reason})` : ''}`
    );

    return result;
};
