import React from 'react';

const PageHeader = ({ kicker, title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            {kicker && <p className="kicker">{kicker}</p>}
            <h1 className="page-title mt-1">{title}</h1>
            {subtitle && <p className="page-sub">{subtitle}</p>}
        </div>
        {action}
    </div>
);

export default PageHeader;
