import { formatCurrency } from './formatCurrency';

export const upiPayUri = ({ upiId, name, amount, note }) => {
    if (!upiId) return '';
    const params = new URLSearchParams({
        pa: String(upiId).trim(),
        pn: name || 'LendLoop',
        cu: 'INR'
    });
    if (amount) {
        params.set('am', Number(amount).toFixed(2));
    }
    if (note) {
        params.set('tn', String(note).slice(0, 50));
    }
    return `upi://pay?${params.toString()}`;
};

export const payRequestMessage = ({ friendName, amount, upiId, note, yourName }) => {
    const money = amount != null && amount !== '' ? formatCurrency(amount) : 'the outstanding amount';
    const greeting = friendName ? `Hi ${friendName}` : 'Hi';
    const reason = note ? ` for ${note}` : '';
    const upiLine = upiId
        ? `UPI ID: ${upiId}`
        : 'I have not added a UPI ID on LendLoop yet — please ask me for one.';
    const signer = yourName ? `\n— ${yourName}` : '';
    return `${greeting}, please pay ${money} on LendLoop${reason}.\n${upiLine}${signer}`;
};

export const whatsappShareUrl = (text) =>
    `https://wa.me/?text=${encodeURIComponent(text)}`;

export const copyText = async (text) => {
    if (!text) return false;
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};
