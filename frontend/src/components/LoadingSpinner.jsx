import React from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center p-16">
        <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-emerald-800 animate-spin" />
    </div>
);

export default LoadingSpinner;
