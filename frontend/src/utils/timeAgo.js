export const timeAgo = (dateString) => {
    if (!dateString) return '';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (Number.isNaN(seconds) || seconds < 0) return 'Just now';
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short'
    }).format(new Date(dateString));
};
