/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import CartNavButton from "@/components/CartNavButton";
import { getFundingProgress } from "@/lib/domain/book";
import { getHomeFeaturedBook, listBooksByType } from "@/lib/services/bookService";

export default async function Home() {
  const [books, preorders, crowdfunding, featuredBook] = await Promise.all([
    listBooksByType("direct"),
    listBooksByType("preorder"),
    listBooksByType("crowdfunding"),
    getHomeFeaturedBook()
  ]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F3F4F6]">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e4e0] bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
            <span className="material-symbols-outlined text-xl text-[#FACC15]">menu_book</span>
          </div>
          <h2 className="max-w-[38vw] truncate text-sm font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:max-w-none sm:text-lg">
            SENAME EDITION’S
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <UserMenu showAuthLinks />
          <CartNavButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-28 md:px-10 lg:px-12">
        {/* Hero Section */}
        <section className="mb-24 grid grid-cols-1 items-center gap-10 lg:mb-32 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-8">
            <h1 className="text-[clamp(2.5rem,4vw,5rem)] font-black leading-[1.05] tracking-tighter text-[#181810]">
              Essais, littérature, arts... <br />
              <span className="text-gray-400">Conférences & cours.</span>
            </h1>
            <p className="max-w-xl text-[clamp(1.1rem,1.5vw,1.3rem)] leading-relaxed text-[#4b5563]">
              Conçu pour rendre possible le financement, la production et la
              diffusion de chantiers intellectuels de{" "}
              <span className="font-bold border-b-2 border-primary">Seydou Koffi Abodjinou</span> sous
              toutes formes imprimées ou audiovisuelles.
            </p>
            <p className="max-w-xl text-[clamp(0.9rem,1.1vw,1rem)] leading-relaxed text-[#6b7280]">
              Les gains financent les engagements de l'association L'Africaine
              d'architecture.
            </p>
            <button className="group flex w-fit items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-black text-black transition-all hover:shadow-xl sm:px-10 sm:py-5">
              <span>Catalogue d'ouvrages + Enseignements</span>
            </button>
          </div>

          {/* Hero right column — matches reference screenshot exactly */}
          <div className="relative flex items-center justify-center py-10">
            {/* Dot grid decoration — top left */}
            <div
              className="absolute top-4 left-4 w-20 h-20 z-10"
              style={{
                background: "radial-gradient(circle, #FACC15 1.5px, transparent 1.5px)",
                backgroundSize: "8px 8px"
              }}
            />

            {/* Striped circle decoration — bottom left */}
            <div className="absolute bottom-4 left-10 w-24 h-24 rounded-full overflow-hidden z-10"
              style={{
                background: "repeating-linear-gradient(45deg, #FACC15, #FACC15 2px, transparent 2px, transparent 10px)"
              }}
            />

            {/* White background card */}
            <div className="relative bg-white shadow-xl" style={{ width: 480, height: 520 }}>
              {/* Big yellow circle — positioned to be centered-right, partially cropped */}
              <div
                className="absolute rounded-full bg-primary"
                style={{
                  width: 360,
                  height: 360,
                  top: "50%",
                  right: -30,
                  transform: "translateY(-50%)"
                }}
              >
                {/* White hole in center */}
                <div
                  className="absolute bg-white rounded-full"
                  style={{
                    width: 130,
                    height: 130,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                />
              </div>

              {/* Portrait image — on top of circle */}
              <img
                alt="Portrait de Seydou Koffi Abodjinou"
                className="absolute bottom-0 left-0 h-full object-contain object-bottom z-10"
                style={{ maxHeight: "100%", maxWidth: "90%" }}
                src="/images/image.png"
              />
            </div>
          </div>
        </section>

        {/* Separator Line */}
        <div className="mb-16">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-800 flex items-center gap-4">
            *OUVRAGES <span className="text-gray-300 flex-1 overflow-hidden whitespace-nowrap tracking-[0.3em]">................................................................................................................................................................................................</span>
          </h2>
        </div>

        {/* Section A la une */}
        <section className="mb-32">
          <div className="mb-12">
            <h2 className="bg-primary inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
              A la une :
            </h2>
          </div>

          {featuredBook && (
            <div className="flex flex-col items-center justify-center">
              <Link href={`/ouvrages/${featuredBook.slug}`} className="group relative transition-all duration-500 hover:scale-[1.02]">
                <div className="border-[12px] border-primary shadow-2xl bg-white p-1">
                  <img
                    alt={featuredBook.title}
                    className="max-h-[70vh] w-auto object-contain"
                    src={featuredBook.coverImage}
                  />
                </div>
              </Link>
              {/* Short line separator below featured image as per screenshot 4 */}
              <div className="mt-20 w-48 h-[2px] bg-black opacity-40"></div>
            </div>
          )}
        </section>

        {/* Header for Category sections */}
        <div className="mb-24">
          <h2 className="bg-primary inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
            OUVRAGES DISPONIBLES :
          </h2>
        </div>

        {/* Section Acquisition */}
        <section className="mb-40">
          <div className="flex flex-col items-center gap-6 mb-16 px-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-5xl text-black">diamond</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Disponible en <span className="font-bold uppercase tracking-tight">Acquisition</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {books.map((book) => (
              <div key={book.slug} className="group flex flex-col items-center">
                <Link href={`/ouvrages/${book.slug}`} className="relative border-[12px] border-primary p-1 transition-transform hover:scale-105 shadow-xl bg-white">
                  <img
                    alt={book.title}
                    className="h-[400px] w-auto object-contain"
                    src={book.coverImage}
                  />
                </Link>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <h4 className="font-black text-sm uppercase tracking-tight">{book.title}</h4>
                  <AddToCartButton
                    book={{
                      bookId: String((book as any)._id ?? ""),
                      slug: book.slug,
                      title: book.title,
                      authorName: book.authorName,
                      coverImage: book.coverImage,
                      price: book.price,
                      saleType: book.saleType
                    }}
                    className="rounded bg-black px-4 py-2 text-[10px] font-black text-white hover:bg-primary hover:text-black transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Pre-commande */}
        <section className="mb-40">
          <div className="flex flex-col items-center gap-6 mb-16 px-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-5xl text-black">hourglass_empty</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Disponible en <span className="font-bold uppercase tracking-tight">Pré-commande</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {preorders.map((book) => (
              <div key={book.slug} className="group flex flex-col items-center">
                <Link href={`/ouvrages/${book.slug}`} className="relative border-[12px] border-primary p-1 transition-transform hover:scale-105 shadow-xl bg-white">
                  <img
                    alt={book.title}
                    className="h-[400px] w-auto object-contain"
                    src={book.coverImage}
                  />
                  <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-[8px] font-black uppercase tracking-tight">PRÉ-COMMANDE</div>
                </Link>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <h4 className="font-black text-sm uppercase tracking-tight">{book.title}</h4>
                  <AddToCartButton
                    book={{
                      bookId: String((book as any)._id ?? ""),
                      slug: book.slug,
                      title: book.title,
                      authorName: book.authorName,
                      coverImage: book.coverImage,
                      price: book.price,
                      saleType: book.saleType
                    }}
                    className="rounded bg-black px-4 py-2 text-[10px] font-black text-white hover:bg-primary hover:text-black transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Crowdfunding */}
        <section className="mb-40">
          <div className="flex flex-col items-center gap-6 mb-16 px-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-5xl text-black">psychology</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Disponible en <span className="font-bold uppercase tracking-tight">financement participatif :</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {crowdfunding.map((project) => {
              const funding = getFundingProgress(project);
              return (
                <div key={project.slug} className="group flex flex-col items-center">
                  <Link href={`/ouvrages/${project.slug}`} className="relative border-[12px] border-primary p-1 transition-transform hover:scale-105 shadow-xl bg-white">
                    <img
                      alt={project.title}
                      className="h-[400px] w-auto object-contain"
                      src={project.coverImage}
                    />
                  </Link>
                  <div className="mt-4 w-full flex flex-col items-center gap-3">
                    <h4 className="font-black text-sm uppercase tracking-tight">{project.title}</h4>
                    <div className="w-48 h-1.5 overflow-hidden rounded-full bg-gray-200 border border-gray-300">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${funding.percent}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-tighter">
                      {funding.percent}% financé
                    </p>
                    <Link
                      href={`/ouvrages/${project.slug}`}
                      className="rounded-full bg-black px-6 py-2 text-[10px] font-black text-white uppercase hover:bg-primary hover:text-black transition-all"
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
