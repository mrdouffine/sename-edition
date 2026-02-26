import Footer from "@/components/Footer";
import Link from "next/link";
import BookPurchaseControls from "@/components/BookPurchaseControls";
import CartNavButton from "@/components/CartNavButton";
import ContributionForm from "@/components/ContributionForm";
import CrowdfundingLivePanel from "@/components/CrowdfundingLivePanel";
import WishlistButton from "@/components/WishlistButton";
import SocialShareButtons from "@/components/SocialShareButtons";
import UserMenu from "@/components/UserMenu";
import { getBookBySlug } from "@/lib/services/bookService";
import { getFundingProgress, getSaleStatus, isOutOfStock } from "@/lib/domain/book";
import { notFound } from "next/navigation";
import BookDetailTabs from "@/components/BookDetailTabs";
import BookCover from "@/components/BookCover";
import { Suspense } from "react";

export default async function BookDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const saleStatus = getSaleStatus(book);
  const funding = getFundingProgress(book);
  const outOfStock = isOutOfStock(book);
  const bookId = book._id ? String(book._id) : book.slug;

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-[#181810]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e5e0] bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <h2 className="max-w-[38vw] truncate text-sm font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:max-w-none sm:text-lg">
              SENAME EDITION’S
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <UserMenu showAuthLinks />
            <CartNavButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] items-center px-4 pt-24 sm:px-6 sm:pt-28 md:px-10">
        <div className="flex items-center gap-2 text-xs font-medium sm:text-sm md:text-base">
          <Link className="text-[#8d895e] hover:text-[#181810]" href="/">
            Accueil
          </Link>
          <span className="text-[#8d895e]">/</span>
          <span className="max-w-[52vw] truncate text-[#181810] sm:max-w-none">{book.title}</span>
          <div className="hidden flex-1 border-b-2 border-dotted border-[#d1d1cf] opacity-30 md:block"></div>
          {book.isbn ? (
            <div className="hidden pl-4 text-xs uppercase tracking-widest text-[#8d895e] lg:block">
              ISBN: {book.isbn}
            </div>
          ) : null}
        </div>
      </div>
      <br />
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 sm:px-6 sm:pb-32 md:px-10">
        <div className="mb-12 grid grid-cols-1 gap-8 sm:gap-12 lg:mb-16 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-center border border-[#e5e5e0] p-4 shadow-sm bg-white sm:p-12">
              <BookCover
                title={book.title}
                subtitle={book.subtitle}
                authorName={book.authorName}
                variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                className="w-full shadow-md"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="mb-2 text-4xl sm:text-5xl font-black uppercase text-black">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="mb-3 text-[1.2rem] font-semibold text-[#4a4a40]">
                {book.subtitle}
              </p>
            ) : null}
            <p className="mb-8 text-3xl font-black text-[#FFEA00]">
              {book.price.toFixed(2).replace('.', ',')}€
            </p>

            {book.description && (
              <div className="mb-10 text-sm leading-relaxed text-[#181810]">
                {book.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            <div className="mb-3 flex items-center relative">
              <span className="text-sm font-medium">
                Statut : disponible en: <span className="font-normal">{saleStatus}</span>
              </span>
              <div className="ml-auto mr-12 -translate-y-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEA00]">
                <span className="material-symbols-outlined text-[1.2rem] text-black">
                  hourglass_empty
                </span>
              </div>
            </div>

            {book.releaseDate ? (
              <div className="mb-4 text-sm font-medium">
                Sortie :{" "}
                <span className="font-normal">
                  {new Date(book.releaseDate).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric"
                  })}
                </span>
              </div>
            ) : null}

            <hr className="my-6 border-black" />

            <div className="mb-10 text-sm font-medium">
              <p>
                {book.pages ? `${book.pages} pages ` : null}
                {book.isbn ? `ISBN : ${book.isbn}` : null}
              </p>
            </div>

            {book.saleType === "crowdfunding" ? (
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-[#8d895e]">
                  <span>{funding.percent}% financé</span>
                  <span>Reste {funding.remaining.toFixed(0)}€</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e0]">
                  <div
                    className="h-full bg-[#FFEA00]"
                    style={{ width: `${funding.percent}%` }}
                  ></div>
                </div>
                <div className="mt-4 rounded-lg border border-[#e5e5e0] bg-[#f7f7f3] px-4 py-3 text-xs font-semibold sm:text-sm">
                  Ce projet se finance par contribution.
                </div>
              </div>
            ) : null}

            {book.saleType !== "crowdfunding" ? (
              <BookPurchaseControls
                book={{
                  bookId: bookId,
                  slug: book.slug,
                  title: book.title,
                  authorName: book.authorName,
                  coverImage: book.coverImage,
                  description: book.description,
                  subtitle: book.subtitle,
                  coverVariant: (book as any).coverVariant === "dark" ? "dark" : "light",
                  price: book.price,
                  saleType: book.saleType
                }}
                disabled={outOfStock}
              />
            ) : (
              <>
                <Suspense fallback={
                  <div className="mt-5 rounded-xl border border-[#e5e5e0] bg-white p-4">
                    <p className="text-sm font-semibold text-[#6b6959]">Chargement du formulaire...</p>
                  </div>
                }>
                  <ContributionForm bookId={bookId} />
                </Suspense>
                <CrowdfundingLivePanel
                  bookId={bookId}
                  initialGoal={book.fundingGoal ?? 0}
                  initialRaised={book.fundingRaised ?? 0}
                />
              </>
            )}

            <WishlistButton bookId={bookId} />

            <div className="mt-8 flex items-center justify-between border-t border-b border-[#e5e5e0] py-6">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#a3a3a3]">Partager this product</span>
              <SocialShareButtons title={book.title} className="flex gap-2" />
            </div>
          </div>
        </div>

        <BookDetailTabs description={book.description ?? ""} bookId={bookId} staticReviews={book.staticReviews} />
      </main>

      <Footer />
    </div>
  );
}
