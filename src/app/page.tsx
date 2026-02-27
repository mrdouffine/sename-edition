/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import CartNavButton from "@/components/CartNavButton";
import BookCover from "@/components/BookCover";
import { getFundingProgress } from "@/lib/domain/book";
import { getHomeFeaturedBook, listBooksByType } from "@/lib/services/bookService";
/*je fais mon import du composant juste ici*/
import ScrollAnimations from "@/components/ScrollAnimations";


export default async function Home() {
  const [books, preorders, crowdfunding, featuredBook] = await Promise.all([
    listBooksByType("direct"),
    listBooksByType("preorder"),
    listBooksByType("crowdfunding"),
    getHomeFeaturedBook(),
  ]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f5f5f0]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#e5e4e0] bg-white px-4 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-black">
            <span className="material-symbols-outlined text-xl text-[#FACC15]">menu_book</span>
          </div>
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-[#181810] sm:text-lg">
            SENAME EDITION'S
          </h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <UserMenu showAuthLinks />
          <CartNavButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-28 md:px-10 lg:px-16">
        <ScrollAnimations/>
        {/* ──────────────────────────────────────────────── */}
        {/* HERO SECTION                                    */}
        {/* ──────────────────────────────────────────────── */}
        <section className="mb-20 grid grid-cols-1 items-center gap-10 lg:mb-28 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <h1 className="anim-hero-title text-[clamp(2.4rem,4vw,4.8rem)] font-black leading-[1.05] tracking-tighter text-[#181810]">
              Essais, littérature, arts... <br />
              <span className="anim-hero-sub text-gray-400">Conférences & cours.</span>
            </h1>
            <p className="fade-up max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] leading-relaxed text-[#4b5563]">
              Conçu pour rendre possible le financement, la production et la
              diffusion de chantiers intellectuels de{" "}
              <span className="font-bold border-b-2 border-primary">Seydou Koffi Abodjinou</span>{" "}
              sous toutes formes imprimées ou audiovisuelles.
            </p>
            <p className="fade-up max-w-xl text-[clamp(0.9rem,1.1vw,1rem)] leading-relaxed text-[#6b7280]">
              Les gains financent les engagements de l'association L'Africaine d'architecture.
            </p>
            <a
              href="#ouvrages"
              className="anim-hero-cta btn-cta flex w-fit items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-black text-black transition-all hover:shadow-xl hover:scale-105"
            >
              Catalogue d'ouvrages + Enseignements
            </a>
          </div>

          {/* Hero right — image already contains circle + decorations */}
          <div className="flex items-center justify-center">
            <img
              alt="Portrait de Seydou Koffi Abodjinou"
              className="hero-image w-full max-w-[520px] h-auto object-contain"
              src="/images/image.png"
            />
          </div>
        </section>

        {/* ──────────────────────────────────────────────── */}
        {/* *OUVRAGES SEPARATOR                             */}
        {/* ──────────────────────────────────────────────── */}
        <div id="ouvrages" className="mb-14">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-800 flex items-center gap-4">
            *OUVRAGES{" "}
            <span className="text-gray-300 flex-1 overflow-hidden whitespace-nowrap tracking-[0.3em]">
              ................................................................................................................................................................................................
            </span>
          </h2>
        </div>

        {/* ──────────────────────────────────────────────── */}
        {/* A LA UNE                                        */}
        {/* ──────────────────────────────────────────────── */}
        <section className="mb-28">
          <div className="mb-10">
            <h2 className="bg-primary inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
              A la une :
            </h2>
          </div>

          {featuredBook && (
            <div className="flex justify-center">
              <Link href={`/ouvrages/${featuredBook.slug}`} className="group transition-transform duration-500 hover:scale-[1.02]">
                <div className="border-[10px] border-primary shadow-2xl" style={{ maxWidth: 420 }}>
                  <BookCover
                    title={featuredBook.title}
                    subtitle={featuredBook.subtitle}
                    authorName={featuredBook.authorName}
                    variant={(featuredBook as any).coverVariant === "dark" ? "dark" : "light"}
                    className="w-full"
                  />
                </div>
              </Link>
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <div className="h-[2px] w-48 bg-black opacity-30" />
          </div>
        </section>

        {/* ──────────────────────────────────────────────── */}
        {/* OUVRAGES DISPONIBLES                            */}
        {/* ──────────────────────────────────────────────── */}
        <div className="mb-20">
          <h2 className="bg-primary inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
            Ouvrages disponibles :
          </h2>
        </div>

        {/* ── ACQUISITION ── */}
        <section className="mb-32">
          <div className="flex flex-col items-center gap-4 mb-14">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
              <span className="material-symbols-outlined text-4xl text-black">diamond</span>
            </div>
            <p className="fade-up text-lg text-gray-900">
              Disponible en <span className="font-bold uppercase">Acquisition</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 books-grid">
            {books.map((book) => (
              <div key={book.slug} className="group flex flex-col items-center book-card">
                <Link href={`/ouvrages/${book.slug}`} className="block w-full transition-transform duration-300 hover:scale-[1.03]">
                  <div className="border-[8px] border-primary shadow-lg mx-auto" style={{ maxWidth: 280 }}>
                    <BookCover
                      title={book.title}
                      subtitle={book.subtitle}
                      authorName={book.authorName}
                      variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                    />
                  </div>
                </Link>
                <div className="mt-6 flex flex-col items-center gap-3 text-center">
                  <h4 className="fade-up font-black text-sm uppercase tracking-tight leading-tight">{book.title}</h4>
                  <p className="fade-up text-xs text-gray-500 italic">{book.subtitle}</p>
                  <AddToCartButton
                    book={{
                      bookId: String((book as any)._id ?? ""),
                      slug: book.slug,
                      title: book.title,
                      authorName: book.authorName,
                      coverImage: book.coverImage,
                      price: book.price,
                      saleType: book.saleType,
                    }}
                    className="btn-cta rounded bg-black px-5 py-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRÉ-COMMANDE ── */}
        <section className="mb-32">
          <div className="flex flex-col items-center gap-4 mb-14">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
              <span className="material-symbols-outlined text-4xl text-black">hourglass_empty</span>
            </div>
            <p className="fade-up text-lg text-gray-900">
              Disponible en <span className="font-bold uppercase">Pré-commande</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto books-grid">
            {preorders.map((book) => (
              <div key={book.slug} className="group flex flex-col items-center book-card">
                <Link href={`/ouvrages/${book.slug}`} className="block w-full transition-transform duration-300 hover:scale-[1.03]">
                  <div className="border-[8px] border-primary shadow-lg mx-auto" style={{ maxWidth: 280 }}>
                    <BookCover
                      title={book.title}
                      subtitle={book.subtitle}
                      authorName={book.authorName}
                      variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                    />
                  </div>
                </Link>
                <div className="mt-6 flex flex-col items-center gap-3 text-center">
                  <h4 className="fade-up font-black text-sm uppercase tracking-tight leading-tight">{book.title}</h4>
                  <p className="fade-up text-xs text-gray-500 italic">{book.subtitle}</p>
                  <AddToCartButton
                    book={{
                      bookId: String((book as any)._id ?? ""),
                      slug: book.slug,
                      title: book.title,
                      authorName: book.authorName,
                      coverImage: book.coverImage,
                      price: book.price,
                      saleType: book.saleType,
                    }}
                    className="btn-cta rounded bg-black px-5 py-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINANCEMENT PARTICIPATIF ── */}
        <section className="mb-32">
          <div className="flex flex-col items-center gap-4 mb-14">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
              <span className="material-symbols-outlined text-4xl text-black">psychology</span>
            </div>
            <p className="fade-up text-lg text-gray-900">
              Disponible en <span className="font-bold uppercase">financement participatif :</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 books-grid">
            {crowdfunding.map((project) => {
              const funding = getFundingProgress(project);
              return (
                <div key={project.slug} className="group flex flex-col items-center book-card">
                  <Link href={`/ouvrages/${project.slug}`} className="block w-full transition-transform duration-300 hover:scale-[1.03]">
                    <div className="border-[8px] border-primary shadow-lg mx-auto" style={{ maxWidth: 280 }}>
                      <BookCover
                        title={project.title}
                        subtitle={project.subtitle}
                        authorName={project.authorName}
                        variant={(project as any).coverVariant === "dark" ? "dark" : "light"}
                      />
                    </div>
                  </Link>
                  <div className="mt-6 flex flex-col items-center gap-3 text-center w-full" style={{ maxWidth: 280 }}>
                    <h4 className="fade-up font-black text-sm uppercase tracking-tight leading-tight">{project.title}</h4>
                    <p className="fade-up text-xs text-gray-500 italic">{project.subtitle}</p>
                    <div className="w-full h-2 overflow-hidden rounded-full bg-gray-200 border border-gray-300 funding-bar">
                      <div
                          className="h-full funding-fill bg-primary rounded-full"
                          data-width={`${funding.percent}%`}
                          style={{ width: "0%" }}
                      />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                      {funding.percent}% financé
                    </p>
                    <Link
                      href={`/ouvrages/${project.slug}`}
                      className="btn-cta rounded bg-black px-5 py-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                    >
                      Soutenir le projet
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}