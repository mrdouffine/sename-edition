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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e4e0] bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
            <span className="material-symbols-outlined text-xl">menu_book</span>
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
        <section className="mb-16 grid grid-cols-1 items-center gap-10 lg:mb-20 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-8">
            <h1 className="text-[clamp(2.2rem,3.6vw,4.6rem)] font-black leading-[1.1] tracking-tighter text-[#181810]">
              Essais, littérature, arts... <br />
              <span className="text-gray-400">Conférences & cours.</span>
            </h1>
            <p className="max-w-xl text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-[#4a4a40]">
              Conçu pour rendre possible le financement, la production et la
              diffusion de chantiers intellectuels de{" "}
              <span className="font-semibold">Seydou Koffi Abodjinou</span> sous
              toutes formes imprimées ou audiovisuelles.
            </p>
            <p className="max-w-xl text-[clamp(0.9rem,1.1vw,1rem)] leading-relaxed text-[#4a4a40]">
              Les gains financent les engagements de l'association L'Africaine
              d'architecture.
            </p>
            <button className="group flex w-fit items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-black transition-all hover:shadow-xl sm:px-8 sm:py-4 sm:text-base">
              <span>Catalogue d'ouvrages + Enseignements</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="flex items-center justify-center">
              <img
                alt="Portrait"
                className="max-h-[20rem] w-full max-w-full object-contain sm:max-h-[26rem] md:max-h-[32rem]"
                src="/images/image.png"
                style={{ background: 'none', display: 'block' }}
              />
            </div>
          </div>
        </section>

        <section className="mb-16 sm:mb-20">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-primary"></div>
            <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
              À la une
            </h2>
          </div>
          {featuredBook ? (
            <div className="relative flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:min-h-[420px] md:min-h-[450px] md:flex-row">
              <div className="flex w-full items-center justify-center overflow-hidden bg-gray-50 p-6 sm:p-10 md:w-1/2 md:p-12">
                <div className="relative h-72 w-52 shadow-2xl transition-transform duration-500 hover:scale-105 sm:h-80 sm:w-60 md:h-96 md:w-64">
                  <img
                    alt={`Couverture de ${featuredBook.title}`}
                    className="h-full w-full rounded-sm object-cover"
                    src={featuredBook.coverImage}
                  />
                </div>
              </div>
              <div className="flex w-full flex-col justify-center gap-5 bg-[#fafafa] p-6 sm:gap-6 sm:p-10 md:w-1/2 md:p-16">
                <span className="w-fit rounded bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
                  Vedette
                </span>
                <h3 className="text-2xl font-black leading-tight sm:text-3xl md:text-4xl">{featuredBook.title}</h3>
                <p className="text-base leading-relaxed text-[#8d895e] sm:text-lg">
                  {(featuredBook.description ?? "").slice(0, 220)}
                  {(featuredBook.description ?? "").length > 220 ? "..." : ""}
                </p>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-sm font-medium">{featuredBook.subtitle ?? "Édition spéciale"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-sm font-medium">
                      {featuredBook.authorName ?? "SENAME EDITION’S"}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/ouvrages/${featuredBook.slug}`}
                  className="mt-4 inline-flex w-fit rounded-lg bg-primary px-6 py-3 text-sm font-bold text-black transition-all hover:brightness-105 sm:px-10"
                >
                  Découvrir l&apos;ouvrage
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mb-16 sm:mb-20">
          <h3 className="mb-8 text-lg font-bold uppercase tracking-tight sm:text-xl">
            Options d'achat
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl border border-gray-100 bg-white p-6 transition-colors hover:border-primary sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-black">
                  shopping_bag
                </span>
              </div>
              <h4 className="mb-2 text-lg font-black">Achat-Acquisition</h4>
              <p className="text-sm leading-relaxed text-gray-500">
                Disponibilité immédiate. Livraison sous 3 à 5 jours ouvrés.
              </p>
            </div>

            <div className="group rounded-xl border border-gray-100 bg-white p-6 transition-colors hover:border-primary sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-black">
                  calendar_today
                </span>
              </div>
              <h4 className="mb-2 text-lg font-black">achat-Pré-commande</h4>
              <p className="text-sm leading-relaxed text-gray-500">
                Soyez les premiers à recevoir les futures parutions à tarif
                préférentiel.
              </p>
            </div>

            <div className="group rounded-xl border border-gray-100 bg-white p-6 transition-colors hover:border-primary sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-black">group</span>
              </div>
              <h4 className="mb-2 text-lg font-black">
                achat- financement participatif
              </h4>
              <p className="text-sm leading-relaxed text-gray-500">
                Soutenez les auteurs émergents et participez à l'éclosion de
                nouveaux talents.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-20">
          <section>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black uppercase sm:text-xl">
                Disponible en Acquisition
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <div className="group" key={book.slug}>
                  <Link href={`/ouvrages/${book.slug}`} className="block">
                    <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-all group-hover:shadow-xl">
                      <img
                        alt={`Couverture ${book.title}`}
                        className="h-full w-full object-cover"
                        src={book.coverImage}
                      />
                    </div>
                    <h5 className="text-base font-bold transition-colors group-hover:text-primary">{book.title}</h5>
                  </Link>
                  <p className="text-xs text-gray-500">{book.subtitle}</p>
                  <div className="mt-2">
                    <AddToCartButton
                      book={{
                        bookId: String((book as { _id?: { toString(): string } })._id ?? ""),
                        slug: book.slug,
                        title: book.title,
                        authorName: book.authorName,
                        coverImage: book.coverImage,
                        price: book.price,
                        saleType: book.saleType
                      }}
                      className="rounded bg-primary px-4 py-2 text-xs font-bold text-black"
                      disabled={!((book as { _id?: unknown })._id)}
                    />
                  </div>
                  {(book as { _id?: unknown })._id ? (
                    <WishlistButton bookId={String((book as { _id?: { toString(): string } })._id)} />
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black uppercase sm:text-xl">
                Disponible en Pré-commande
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {preorders.map((book) => {
                const content = (
                  <>
                    <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-all group-hover:shadow-xl">
                      <img
                        alt={`Couverture ${book.title}`}
                        className="h-full w-full object-cover"
                        src={book.coverImage}
                      />
                      <div className="absolute right-2 top-2 rounded bg-black px-2 py-1 text-[10px] font-bold text-white">
                        PRÉ-COMMANDE
                      </div>
                      {book.slug ? (
                        <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                      ) : null}
                    </div>
                    <h5
                      className={`text-base font-bold ${book.slug
                          ? "underline decoration-primary decoration-2 transition-colors group-hover:text-primary"
                          : ""
                        }`}
                    >
                      {book.title}
                    </h5>
                    <p className="text-xs text-gray-500">{book.subtitle}</p>
                  </>
                );

                if (book.slug) {
                  return (
                    <div className="group" key={book.slug}>
                      <Link href={`/ouvrages/${book.slug}`}>{content}</Link>
                      {(book as { _id?: unknown })._id ? (
                        <WishlistButton bookId={String((book as { _id?: { toString(): string } })._id)} />
                      ) : null}
                    </div>
                  );
                }

                return (
                  <div className="group" key={book.slug}>
                    {content}
                    {(book as { _id?: unknown })._id ? (
                      <WishlistButton bookId={String((book as { _id?: { toString(): string } })._id)} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black uppercase sm:text-xl">
                Disponible en financement participatif
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {crowdfunding.map((project) => {
                const funding = getFundingProgress(project);
                return (
                  <div className="group" key={project.slug}>
                    <Link href={`/ouvrages/${project.slug}`} className="block">
                      <div className="mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-all group-hover:shadow-md">
                        <img
                          alt={`Couverture ${project.title}`}
                          className="h-full w-full object-cover"
                          src={project.coverImage}
                        />
                      </div>
                      <h5 className="text-base font-bold transition-colors group-hover:text-primary">{project.title}</h5>
                    </Link>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${funding.percent}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-[10px] font-bold uppercase">
                      {funding.percent}% financé
                    </p>
                    {(project as { _id?: unknown })._id ? (
                      <WishlistButton bookId={String((project as { _id?: { toString(): string } })._id)} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
