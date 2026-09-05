import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const BrandPanel = ({ headline, description, showLogo = true, align = 'center' }) => (
    <section className={`hidden lg:flex relative overflow-hidden flex-col text-sand-50 px-16 xl:px-20 py-12 ${align === 'end' ? 'justify-end' : 'justify-between'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-moss-800 via-moss-900 to-moss-950" />
        <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-moss-700/50 blur-3xl" />
        <div className="relative z-10 flex flex-col h-full">
            {showLogo && align !== 'end' && (
                <Link to="/login" className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 border border-white/20">
                        <Wallet size={20} />
                    </span>
                    <span>
                        <span className="block font-display text-2xl">LendLoop</span>
                        <span className="block text-[10px] tracking-[0.2em] uppercase text-gold-400">Lend with ease</span>
                    </span>
                </Link>
            )}
            {align === 'end' && <div />}
            <div className={`max-w-md ${align === 'end' ? 'mb-8 mt-auto' : 'my-auto'}`}>
                <p className="kicker text-gold-400 mb-4">Designed for friends</p>
                <h2 className="font-display text-4xl xl:text-[2.9rem] font-medium leading-tight">
                    {headline}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-sand-100/80">
                    {description}
                </p>
            </div>
        </div>
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
        <div className="min-h-screen grid lg:grid-cols-2">
            {brandSide === 'left' && brand}
            <section className="flex items-center justify-center px-6 py-12 sm:px-10">
                <div className="w-full max-w-[440px] surface p-8 sm:p-10">
                    <Link to="/login" className="lg:hidden mb-8 flex items-center gap-2.5 text-moss-900">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss-900 text-sand-50">
                            <Wallet size={18} />
                        </span>
                        <span className="font-display text-xl">LendLoop</span>
                    </Link>
                    {children}
                </div>
            </section>
            {brandSide === 'right' && brand}
        </div>
    );
};

export default AuthLayout;
