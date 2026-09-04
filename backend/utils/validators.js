const validateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const validateUpiId = (upiId) => {
    // Basic UPI validation: string@string
    const re = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return re.test(upiId);
};

module.exports = {
    validateEmail,
    validateUpiId
};
