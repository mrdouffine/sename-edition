/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import CartNavButton from "@/components/CartNavButton";
import Logo from "@/components/Logo";

export default function EnseignementsPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FFEA00]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/" className="flex items-center gap-3 sm:gap-4">
                        <Logo />
                    </Link>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <UserMenu showAuthLinks />
                    <CartNavButton />
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-28 pt-32 sm:px-6 sm:pb-32 sm:pt-32 md:px-10 lg:px-20">
                <div className="flex flex-col flex-1 items-center justify-center pb-20">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#181810]">
                        En chantier
                    </h2>
                </div>
            </main>

            <Footer />
        </div >
    );
}
