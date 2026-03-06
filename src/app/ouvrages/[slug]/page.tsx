import Footer from "@/components/Footer";
import Link from "next/link";
import BookPurchaseControls from "@/components/BookPurchaseControls";
import CartNavButton from "@/components/CartNavButton";
import ContributionForm from "@/components/ContributionForm";
import CrowdfundingLivePanel from "@/components/CrowdfundingLivePanel";
import WishlistButton from "@/components/WishlistButton";
import SocialShareButtons from "@/components/SocialShareButtons";
import MarketingReviews from "@/components/MarketingReviews";
import UserMenu from "@/components/UserMenu";
import Logo from "@/components/Logo";
import { getBookBySlug } from "@/lib/services/bookService";
import { getFundingProgress, getSaleStatus, isOutOfStock } from "@/lib/domain/book";
import { notFound } from "next/navigation";
import BookDetailTabs from "@/components/BookDetailTabs";
import BookCover from "@/components/BookCover";
import { Suspense } from "react";

const CENTER_OF_FLAMES_REVIEWS = [
  {
    name: "Follashade Ogunde",
    role: "Avis Lecture",
    content: "14 années après avoir finalisé la rédaction de son livre de sortie au jour, Sename décide de le faire découvrir. Pourquoi avoir attendu si longtemps ?\nDans ce livre où il semble s’adresser à la fois à « Neuf mois », sa mère et au lecteur par défaut, on lit les péripéties d’un jeune homme, qui après avoir rêvé à la poésie, de bat dans un monde qui n’est pas le sien, afin de faire accepter son bouquin par des maisons d’éditions. Un jeune homme noir, affamé, dans les rues d’une France qui ne l’a nullement vu naître. Il frappe aux portes des maisons mais aucune ne semble valoriser le tas de papiers qu’il tient en main. Il raconte au lecteur sa rage, avoir subi rejets après rejets sans jamais avoir la chance d’être ne serait-ce que considéré ou lu.\nSename parle à sa mère de ce par quoi il passe dans cette France où il est allé poursuivre ses études et où il a voulu embrasser la vocation de poète. Neuf années depuis son arrivée en France jusqu’à la rédaction de ce livre, il lui est arrivé de repenser à son retour au pays natal, d’aimer , de travailler, d’étudier, …\nRejeté à maintes reprises par les maisons d’édition, aussi bien françaises que « africaines », il décide de devenir lui même « Maison ». Ainsi, ce livre, « Le centre de flammes », vous le lirez sans retouche, sans relecture, sans corrections, sans polissure …\nViendront des parties que vous ne comprendrez peut-être pas, des parties que vous n’accepterez peut-être pas, … il laisse à chaque lecteur le soin d’avoir un avis, de le finir ou pas, de l’aimer ou de le désapprouver, de le recommander ou pas…",
    rating: 5,
    order: 1
  },
  {
    name: "Kodjo Casimir Atoukouvi",
    role: "Lecteur",
    content: "Le Centre de Flammes, c'est une poésie d'une force remarquable. C'est le délire lyrique d'un homme racontant son expérience de l'occident, l'intensité de sa vie intellectuelle et sa bohème.\nJe ne peux vraiment pas décrire ce qui m'est resté comme impression après l'avoir lu. On suit l'auteur dans un voyage très intense et extrêmement dense, et on effectue nous aussi cette navigation à la recherche de \"quelquechose\". On virevolte entre négritude, esthétique, illusions et autres sujets.\nL' écriture? D'une violence inouïe, d'une rapidité et d'une impatience sensationnelles: \"Vite, vite que l'écrive\". Le flux de conscience libre, le trouble mais surtout l'inspiration débordante que l'auteur ne pouvait, apparemment,plus contenir. Il s'agit d'une torture indicible. Il en résulte pourtant une force extraordinaire.\nPlusieurs parties du texte m'on fait penser aux expériences des situationnistes, notamment à Guy Debord. Le projet est bien évidemment la liberté.\nCertains ne peuvent assurément pas supporter cette folie et remarqueront que l'œuvre n'est pas pour eux. Je l'ai justement adorée pour cela... Car elle vient de la profondeur de l'âme du poète.",
    rating: 5,
    order: 2
  }
];

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
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <UserMenu showAuthLinks />
            <CartNavButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col px-4 pt-24 sm:px-6 sm:pt-28 md:px-10">
        <div className="flex items-center gap-2 text-xs font-medium sm:text-sm md:text-base">
          <Link className="text-gray-400 hover:text-[#181810]" href="/">
            Accueil
          </Link>
          <span className="text-gray-400">/</span>
          <Link className="text-gray-400 hover:text-[#181810]" href="/ouvrages">
            Ouvrages
          </Link>
          <span className="text-gray-400">/</span>
          <span className="max-w-[40vw] truncate text-[#181810] sm:max-w-none">{book.title}</span>
          <div className="hidden flex-1 border-b-2 border-dotted border-[#d1d1cf] opacity-30 md:block"></div>
          {book.isbn ? (
            <div className="hidden pl-4 text-xs uppercase tracking-widest text-gray-400 lg:block">
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
                slug={book.slug}
                title={book.title}
                subtitle={book.subtitle}
                authorName={book.authorName}
                variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                titleColor={(book as any).titleColor}
                className="w-full border-[6px] border-[#FFF100]"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="mb-2 text-4xl sm:text-5xl font-black lowercase text-[#FFEA00] leading-none tracking-tight">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="mb-4 text-base font-medium text-gray-400 lowercase tracking-wide italic leading-relaxed">
                {book.subtitle}
              </p>
            ) : null}
            <p className="mb-8 text-2xl font-black text-black opacity-80">
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
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-gray-400">
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

        <BookDetailTabs description={book.description ?? ""} bookId={bookId} staticReviews={slug === "le-centre-de-flammes" ? CENTER_OF_FLAMES_REVIEWS : []} />
      </main>

      <MarketingReviews slug={slug} />

      <Footer />
    </div>
  );
}
