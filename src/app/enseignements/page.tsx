/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import CartNavButton from "@/components/CartNavButton";

export default function EnseignementsPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f5f5f0]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#e5e4e0] bg-white px-4 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex size-8 items-center justify-center rounded-full bg-black">
                                <span className="material-symbols-outlined text-xl text-[#FACC15]">menu_book</span>
                            </div>
                            <h2 className="text-sm font-extrabold uppercase tracking-tight text-[#181810] sm:text-lg">
                                SENAME EDITION'S
                            </h2>
                        </div>
                    </Link>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <UserMenu showAuthLinks />
                    <CartNavButton />
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-28 md:px-10 lg:px-16">
                <h1 className="text-4xl font-black uppercase tracking-widest text-[#181810] sm:text-6xl md:text-8xl">
                    En chantier
                </h1>
                <p className="mt-4 text-lg text-gray-500">
                    Cette section sera bientôt disponible.
                </p>
                <Link href="/" className="mt-8 rounded-full bg-primary px-8 py-3 font-black text-black hover:scale-105 transition-transform">
                    Retour à l'accueil
                </Link>
            </main>

            <Footer />
        </div>
    );
}
