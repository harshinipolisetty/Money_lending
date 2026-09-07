export const remainingOf = (tx) => {
    if (!tx || tx.status === 'repaid') return 0;
    if (tx.remainingAmount != null) return Number(tx.remainingAmount);
    return Number(tx.amount) || 0;
};

export const isDueTomorrow = (tx) => {
    if (!tx?.dueDate || tx.status === 'repaid' || remainingOf(tx) <= 0) return false;
    const due = new Date(tx.dueDate);
    due.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return due.getTime() === tomorrow.getTime();
};

export const isOverdue = (tx) => {
    if (!tx?.dueDate || tx.status === 'repaid') return false;
    return remainingOf(tx) > 0 && new Date(tx.dueDate) < new Date(new Date().toDateString());
};
