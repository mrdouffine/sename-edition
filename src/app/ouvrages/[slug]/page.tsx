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
            <div className="w-full overflow-hidden rounded-xl border-[10px] border-primary shadow-lg">
              <BookCover
                title={book.title}
                subtitle={book.subtitle}
                authorName={book.authorName}
                variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="mb-2 text-[clamp(2rem,3.2vw,3.6rem)] font-black uppercase leading-tight tracking-tight text-[#181810]">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="mb-3 text-[clamp(1rem,1.6vw,1.5rem)] font-semibold text-[#4a4a40]">
                {book.subtitle}
              </p>
            ) : null}
            <p className="mb-6 text-[clamp(1.6rem,2.4vw,2.4rem)] font-extrabold text-primary drop-shadow-sm sm:mb-8">
              {book.price.toFixed(2)}€
            </p>
            <div className="mb-8 flex flex-col gap-3 border-y border-[#e5e5e0] py-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">
                  hourglass_empty
                </span>
                <p className="text-sm font-semibold uppercase tracking-wider">
                  Statut : <span className="text-primary">{saleStatus}</span>
                </p>
              </div>
              {book.releaseDate ? (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#8d895e]">
                    calendar_month
                  </span>
                  <p className="text-sm text-[#8d895e]">
                    Sortie :{" "}
                    <span className="font-bold text-[#181810]">
                      {new Date(book.releaseDate).toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#8d895e]">
                {book.isbn ? (
                  <p>
                    ISBN :{" "}
                    <span className="font-bold text-[#181810]">{book.isbn}</span>
                  </p>
                ) : null}
                {book.pages ? (
                  <p>
                    Pages : <span className="font-bold text-[#181810]">{book.pages}</span>
                  </p>
                ) : null}
              </div>
              {book.saleType === "crowdfunding" ? (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-[#8d895e]">
                    <span>{funding.percent}% financé</span>
                    <span>Reste {funding.remaining.toFixed(0)}€</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e0]">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${funding.percent}%` }}
                    ></div>
                  </div>
                </div>
              ) : null}
            </div>

            {book.saleType === "crowdfunding" ? (
              <div className="mb-8 rounded-lg border border-[#e5e5e0] bg-[#f7f7f3] px-4 py-3 text-xs font-semibold sm:text-sm">
                Ce projet se finance par contribution.
              </div>
            ) : (
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
            )}
            {book.saleType === "crowdfunding" ? (
              <>
                <ContributionForm bookId={bookId} />
                <CrowdfundingLivePanel
                  bookId={bookId}
                  initialGoal={book.fundingGoal ?? 0}
                  initialRaised={book.fundingRaised ?? 0}
                />
              </>
            ) : null}
            <WishlistButton bookId={bookId} />

            <div className="flex flex-wrap items-center gap-4 text-[#8d895e]">
              <span className="text-xs font-bold uppercase tracking-widest">Partager :</span>
              <SocialShareButtons title={book.title} className="flex flex-wrap gap-3" />
            </div>
          </div>
        </div>

        <BookDetailTabs description={book.description ?? ""} bookId={bookId} staticReviews={book.staticReviews} />
      </main>

      <Footer />
    </div>
  );
}
