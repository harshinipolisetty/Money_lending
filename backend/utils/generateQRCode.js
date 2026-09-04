const QRCode = require('qrcode');

const buildUpiPayload = (upiId, name) => {
    const params = new URLSearchParams({
        pa: upiId,
        pn: name || 'User',
        cu: 'INR'
    });
    return `upi://pay?${params.toString()}`;
};

const generateUpiQrCode = async (upiId, name) => {
    if (!upiId) {
        return null;
    }

    const payload = buildUpiPayload(upiId, name);
    return QRCode.toDataURL(payload);
};

module.exports = {
    buildUpiPayload,
    generateUpiQrCode
};
