/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import BookCover from "@/components/BookCover";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import CartNavButton from "@/components/CartNavButton";
import Logo from "@/components/Logo";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import BookPurchaseControls from "@/components/BookPurchaseControls";
import { getFundingProgress, getSaleStatus } from "@/lib/domain/book";
import { getHomeFeaturedBook, listBooksByType } from "@/lib/services/bookService";

export default async function OuvragesPage() {
    const [books, originalPreorders, crowdfunding, featuredBook] = await Promise.all([
        listBooksByType("direct"),
        listBooksByType("preorder"),
        listBooksByType("crowdfunding"),
        getHomeFeaturedBook()
    ]);
    const preorders = [...originalPreorders];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e4e0] bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/" className="flex items-center gap-3 sm:gap-4">
                        <Logo />
                    </Link>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <UserMenu showAuthLinks />
                    <CartNavButton />
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-32 md:px-10 lg:px-20">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Retourner à l'accueil
                    </Link>
                </div>

                {/* Header section *OUVRAGES */}
                <div className="mb-16">
                    <h1 className="text-xl font-black uppercase tracking-[0.2em] text-gray-800 flex items-center gap-4">
                        *OUVRAGES <span className="text-gray-200 flex-1 overflow-hidden whitespace-nowrap">................................................................................................................................................................</span>
                    </h1>
                </div>

                {/* Section A la une */}
                <section className="mb-24">
                    <div className="mb-8">
                        <h2 className="bg-[#FFF100] inline-block px-3 py-1 text-xl font-medium tracking-wide text-black sm:text-2xl">A la une :</h2>
                    </div>

                    {featuredBook && (
                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start mb-16">
                            <div className="flex-shrink-0 w-full max-w-[320px] sm:w-[400px] lg:w-[460px] mx-auto lg:mx-0">
                                <Link href={`/ouvrages/${featuredBook.slug}`} className="group relative block transition-all duration-500 hover:scale-[1.01]">
                                    <BookCover
                                        slug={featuredBook.slug}
                                        title={featuredBook.title}
                                        subtitle={featuredBook.subtitle}
                                        authorName={featuredBook.authorName}
                                        variant={(featuredBook as any).coverVariant === "dark" ? "dark" : "light"}
                                        titleColor={(featuredBook as any).titleColor}
                                        className="border-[6px] border-[#FFF100]"
                                    />
                                </Link>
                            </div>

                            <div className="flex flex-col flex-1 w-full mt-4 lg:mt-0">
                                <h1 className="mb-2 text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-black leading-tight">
                                    {featuredBook.title}
                                </h1>
                                {featuredBook.subtitle && (
                                    <p className="mb-6 text-[1.1rem] sm:text-[1.3rem] font-medium text-[#444] uppercase tracking-widest">
                                        {featuredBook.subtitle}
                                    </p>
                                )}
                                <p className="mb-8 text-4xl font-black text-[#FFE600]">
                                    {featuredBook.price.toFixed(2).replace('.', ',')}€
                                </p>

                                {featuredBook.description && (
                                    <div className="mb-10 text-[0.9rem] sm:text-sm leading-relaxed text-[#2a2a2a] max-w-2xl">
                                        {featuredBook.description.split('\n').filter(l => l.trim().length > 0).map((line, i) => (
                                            <p key={i} className="mb-3">{line}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-6 flex items-center relative">
                                    <span className="text-sm font-medium text-gray-800">
                                        Statut : disponible en: <span className="font-normal">{getSaleStatus(featuredBook as any)}</span>
                                    </span>
                                </div>

                                <hr className="border-black mb-8" />

                                <BookPurchaseControls
                                    book={{
                                        bookId: String((featuredBook as any)._id ?? ""),
                                        slug: featuredBook.slug,
                                        title: featuredBook.title,
                                        authorName: featuredBook.authorName,
                                        coverImage: featuredBook.coverImage,
                                        price: featuredBook.price,
                                        saleType: featuredBook.saleType
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <div className="h-[2px] w-48 bg-gray-800 mx-auto"></div>
                    </div>
                </section>

                {/* Section Options d'achat */}
                <section className="mb-24">
                    <div className="mb-12 text-center sm:text-left">
                        <h2 className="bg-[#FFF100] inline-block px-3 py-1 text-xl font-medium tracking-wide text-black sm:text-2xl">Plusieurs options d'achat :</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
                        {/* Option 1: Acquisition */}
                        <div className="flex flex-col items-center text-center p-8 border-[3px] border-[#FFF100] rounded-xl bg-white transition-transform hover:-translate-y-1">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF100] mb-6">
                                <span className="material-symbols-outlined text-3xl text-black">diamond</span>
                            </div>
                            <h3 className="text-[1.15rem] font-bold text-black mb-4 uppercase leading-tight">
                                Achat-<br />Acquisition
                            </h3>
                            <p className="text-[0.7rem] sm:text-xs text-gray-700 leading-relaxed max-w-[240px]">
                                L'ouvrage est sorti et disponible. Vous serez livré dans la semaine dans le point de distribution de votre ville.
                            </p>
                        </div>

                        {/* Option 2: Pre-commande */}
                        <div className="flex flex-col items-center text-center p-8 border-[3px] border-[#FFF100] rounded-xl bg-white transition-transform hover:-translate-y-1">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF100] mb-6">
                                <span className="material-symbols-outlined text-3xl text-black">hourglass_empty</span>
                            </div>
                            <h3 className="text-[1.15rem] font-bold text-black mb-4 uppercase leading-tight">
                                achat-<br />Pré-commande
                            </h3>
                            <p className="text-[0.7rem] sm:text-xs text-gray-700 leading-relaxed max-w-[240px]">
                                L'ouvrage est prêt. Supportez la fabrication de votre exemplaire. Vous serez livré dans le mois dans le point de distribution de votre ville. Une dédicace personnalisée vous attend.
                            </p>
                        </div>

                        {/* Option 3: Financement Participatif */}
                        <div className="flex flex-col items-center text-center p-8 border-[3px] border-[#FFF100] rounded-xl bg-white transition-transform hover:-translate-y-1">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF100] mb-6">
                                <span className="material-symbols-outlined text-3xl text-black">psychology</span>
                            </div>
                            <h3 className="text-[1.15rem] font-bold text-black mb-4 uppercase leading-tight">
                                achat- financement<br />participatif
                            </h3>
                            <p className="text-[0.7rem] sm:text-xs text-gray-700 leading-relaxed max-w-[260px]">
                                Supportez le chantier d'écriture. Vous serez régulièrement avertis de l'avancement et je répondrai personnellement à toutes vos questions sur le contenu. Vous recevrez en exclusivité votre exemplaire avec une dédicace dès la sortie. Vous serez cité dans les remerciements.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section Ouvrages disponibles */}
                <section className="mb-24">
                    <div className="mb-12">
                        <h2 className="bg-[#FFF100] inline-block px-3 py-1 text-xl font-medium tracking-wide text-black sm:text-2xl">Ouvrages disponibles :</h2>
                    </div>

                    {/* Direct Acquisition */}
                    <div className="space-y-16">
                        <div className="flex flex-row items-center gap-6 ml-4 sm:ml-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF100]">
                                <span className="material-symbols-outlined text-3xl text-black">diamond</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                Disponible en <span className="font-bold">Acquisition</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {books.map((book, idx) => (
                                <div key={`${book.slug}-${idx}`} className="group flex flex-col items-center">
                                    <Link href={`/ouvrages/${book.slug}`} className="relative border-[4px] border-[#FFF100] mb-4 transition-transform hover:scale-105" style={{ width: 240 }}>
                                        <BookCover
                                            slug={book.slug}
                                            title={book.title}
                                            subtitle={book.subtitle}
                                            authorName={book.authorName}
                                            variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                                            titleColor={(book as any).titleColor}
                                        />
                                    </Link>
                                    <h3 className="text-center font-bold text-gray-800">{book.title}</h3>
                                    <p className="text-center text-xs text-gray-500 italic mt-1">{book.subtitle}</p>
                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            className="rounded bg-black px-6 py-2 text-xs font-bold text-white uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section Pre-commande */}
                <section className="mb-24">
                    <div className="space-y-16">
                        <div className="flex flex-row items-center gap-6 ml-4 sm:ml-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF100]">
                                <span className="material-symbols-outlined text-3xl text-black">hourglass_empty</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                Disponible en <span className="font-bold">Pré-commande</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {preorders.map((book, idx) => (
                                <div key={`${book.slug}-${idx}`} className="group flex flex-col items-center">
                                    <Link href={`/ouvrages/${book.slug}`} className="relative border-[4px] border-[#FFF100] mb-4 transition-transform hover:scale-105" style={{ width: 240 }}>
                                        <BookCover
                                            slug={book.slug}
                                            title={book.title}
                                            subtitle={book.subtitle}
                                            authorName={book.authorName}
                                            variant={(book as any).coverVariant === "dark" ? "dark" : "light"}
                                            titleColor={(book as any).titleColor}
                                        />
                                    </Link>
                                    <h3 className="text-center font-bold text-gray-800">{book.title}</h3>
                                    <p className="text-center text-xs text-gray-500 italic mt-1">{book.subtitle}</p>
                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            className="rounded bg-black px-6 py-2 text-xs font-bold text-white uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section Crowdfunding */}
                <section className="mb-24">
                    <div className="space-y-16">
                        <div className="flex flex-row items-center gap-6 ml-4 sm:ml-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF100]">
                                <span className="material-symbols-outlined text-3xl text-black">psychology</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                Disponible en <span className="font-bold">financement participatif :</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {crowdfunding.map((project) => {
                                const funding = getFundingProgress(project);
                                return (
                                    <div key={project.slug} className="group flex flex-col items-center">
                                        <Link href={`/ouvrages/${project.slug}`} className="relative border-[4px] border-[#FFF100] mb-4 transition-transform hover:scale-105" style={{ width: 240 }}>
                                            <BookCover
                                                slug={project.slug}
                                                title={project.title}
                                                subtitle={project.subtitle}
                                                authorName={project.authorName}
                                                variant={(project as any).coverVariant === "dark" ? "dark" : "light"}
                                                titleColor={(project as any).titleColor}
                                            />
                                        </Link>
                                        <h3 className="text-center font-bold text-gray-800">{project.title}</h3>
                                        <p className="text-center text-xs text-gray-500 italic mt-1 mb-3">{project.subtitle}</p>

                                        <div className="w-48">
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                                                <div
                                                    className="h-full bg-[#FFF100]"
                                                    style={{ width: `${funding.percent}%` }}
                                                ></div>
                                            </div>
                                            <p className="mt-1 text-center text-[10px] font-black tracking-tighter">
                                                {funding.percent}% financé
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
