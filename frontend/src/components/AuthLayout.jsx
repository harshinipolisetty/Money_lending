import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const BrandPanel = ({ headline, description, showLogo = true, align = 'center' }) => (
    <section className={`hidden lg:flex flex-col bg-emerald-900 text-white px-16 xl:px-20 py-12 ${align === 'end' ? 'justify-end' : 'justify-between'}`}>
        {showLogo && align !== 'end' && (
            <Link to="/login" className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/30">
                    <Wallet size={20} />
                </span>
                <span className="text-xl font-semibold tracking-tight">LendLoop</span>
            </Link>
        )}
        {align === 'end' && <div />}
        <div className={`max-w-md ${align === 'end' ? 'mb-8' : 'my-auto'}`}>
            <h2 className="text-4xl xl:text-[2.75rem] font-semibold leading-tight tracking-tight">
                {headline}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80">
                {description}
            </p>
        </div>
        {align !== 'end' && <div />}
    </section>
);

const AuthLayout = ({ children, brandSide = 'left', headline, description }) => {
    const brand = (
        <BrandPanel
            headline={headline}
            description={description}
            showLogo={brandSide === 'left'}
            align={brandSide === 'right' ? 'end' : 'center'}
        />
    );

    return (
        <div className="min-h-screen grid lg:grid-cols-2 font-sans">
            {brandSide === 'left' && brand}
            <section className="flex items-center justify-center bg-[#f7fbf9] px-6 py-12 sm:px-10">
                <div className="w-full max-w-[420px]">
                    <Link to="/login" className="lg:hidden mb-10 flex items-center gap-2.5 text-emerald-900">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-900 text-white">
                            <Wallet size={18} />
                        </span>
                        <span className="text-lg font-semibold">LendLoop</span>
                    </Link>
                    {children}
                </div>
            </section>
            {brandSide === 'right' && brand}
        </div>
    );
};

export default AuthLayout;
