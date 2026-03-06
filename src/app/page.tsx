/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import CartNavButton from "@/components/CartNavButton";
import ScrollAnimations from "@/components/ScrollAnimations";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f5f5f0]">
      <ScrollAnimations />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#e5e4e0] bg-white px-4 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
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

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-28 md:px-10 lg:px-16">

        {/* ──────────────────────────────────────────────── */}
        {/* HERO SECTION                                    */}
        {/* ──────────────────────────────────────────────── */}
        <section className="mb-20 grid grid-cols-1 items-center gap-10 lg:mb-28 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <h1 className="anim-hero-title text-[clamp(2.4rem,4vw,4.8rem)] font-black leading-[1.05] tracking-tighter text-[#181810]">
              Essais, littérature, arts... <br />
              <span className="text-gray-400">Conférences & cours.</span>
            </h1>
            <p className="anim-hero-sub fade-up max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] leading-relaxed text-[#4b5563]">
              Conçu pour rendre possible le financement, la production et la
              diffusion de chantiers intellectuels de{" "}
              <span className="font-bold border-b-2 border-primary whitespace-nowrap">Sénamé Koffi Agbodjinou</span>{" "}
              sous toutes formes imprimées ou audiovisuelles.
            </p>
            <p className="anim-hero-sub fade-up max-w-xl text-[clamp(0.9rem,1.1vw,1rem)] leading-relaxed text-[#6b7280]">
              Les gains financent les engagements de l'association L'Africaine d'architecture.
            </p>
            <div className="anim-hero-cta flex flex-wrap gap-4">
              <Link href="/ouvrages" className="btn-cta flex w-fit items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm sm:text-base font-black text-black transition-all hover:shadow-xl hover:scale-105 uppercase">
                Catalogue d'ouvrages
              </Link>
              <Link href="/enseignements" className="btn-cta flex w-fit items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm sm:text-base font-black text-black transition-all hover:shadow-xl hover:scale-105 uppercase">
                Enseignements
              </Link>
            </div>
          </div>

          {/* Hero right — image already contains circle + decorations */}
          <div className="flex items-center justify-center">
            <img
              alt="Portrait de Sénamé Koffi Agbodjinou"
              className="hero-image w-full max-w-[520px] h-auto object-contain mix-blend-multiply"
              src="/images/image.png"
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}