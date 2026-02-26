/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import CartNavButton from "@/components/CartNavButton";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import { getFundingProgress } from "@/lib/domain/book";
import { getHomeFeaturedBook, listBooksByType } from "@/lib/services/bookService";

export default async function OuvragesPage() {
    const [books, preorders, crowdfunding, featuredBook] = await Promise.all([
        listBooksByType("direct"),
        listBooksByType("preorder"),
        listBooksByType("crowdfunding"),
        getHomeFeaturedBook()
    ]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e4e0] bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/" className="flex items-center gap-3 sm:gap-4">
                        <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
                            <span className="material-symbols-outlined text-xl text-[#FACC15]">menu_book</span>
                        </div>
                        <h2 className="max-w-[38vw] truncate text-sm font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:max-w-none sm:text-lg">
                            SENAME EDITION’S
                        </h2>
                    </Link>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <UserMenu showAuthLinks />
                    <CartNavButton />
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-32 md:px-10 lg:px-20">
                {/* Header section *OUVRAGES */}
                <div className="mb-16">
                    <h1 className="text-xl font-black uppercase tracking-[0.2em] text-gray-800 flex items-center gap-4">
                        *OUVRAGES <span className="text-gray-200 flex-1 overflow-hidden whitespace-nowrap">................................................................................................................................................................</span>
                    </h1>
                </div>

                {/* Section A la une */}
                <section className="mb-24">
                    <div className="mb-8">
                        <h2 className="bg-yellow-400 inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
                            A la une :
                        </h2>
                    </div>

                    {featuredBook && (
                        <div className="flex justify-center">
                            <Link href={`/ouvrages/${featuredBook.slug}`} className="group relative transition-all duration-500 hover:scale-[1.02]">
                                <div className="border-[12px] border-yellow-400 shadow-2xl">
                                    <img
                                        alt={featuredBook.title}
                                        className="max-h-[70vh] w-auto object-contain"
                                        src={featuredBook.coverImage}
                                    />
                                </div>
                            </Link>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <div className="h-[2px] w-48 bg-gray-800 mx-auto"></div>
                    </div>
                </section>

                {/* Section Ouvrages disponibles */}
                <section className="mb-24">
                    <div className="mb-12">
                        <h2 className="bg-yellow-400 inline-block px-4 py-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
                            Ouvrages disponibles :
                        </h2>
                    </div>

                    {/* Direct Acquisition */}
                    <div className="space-y-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
                                <span className="material-symbols-outlined text-5xl text-black">diamond</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                Disponible en <span className="font-bold">Acquisition</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {books.map((book) => (
                                <div key={book.slug} className="group flex flex-col items-center">
                                    <Link href={`/ouvrages/${book.slug}`} className="relative border-2 border-yellow-400 p-1 mb-4 transition-transform hover:scale-105">
                                        <img
                                            alt={book.title}
                                            className="h-72 w-52 object-cover shadow-md"
                                            src={book.coverImage}
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
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
                                <span className="material-symbols-outlined text-5xl text-black">hourglass_empty</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                Disponible en <span className="font-bold">Pré-commande</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {preorders.map((book) => (
                                <div key={book.slug} className="group flex flex-col items-center">
                                    <Link href={`/ouvrages/${book.slug}`} className="relative border-2 border-yellow-400 p-1 mb-4 transition-transform hover:scale-105">
                                        <img
                                            alt={book.title}
                                            className="h-72 w-52 object-cover shadow-md"
                                            src={book.coverImage}
                                        />
                                    </Link>
                                    <h3 className="text-center font-bold text-gray-800">{book.title}</h3>
                                    <p className="text-center text-xs text-gray-500 italic mt-1">{book.subtitle}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section Crowdfunding */}
                <section className="mb-24">
                    <div className="space-y-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
                                <span className="material-symbols-outlined text-5xl text-black">psychology</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                Disponible en <span className="font-bold">financement participatif :</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {crowdfunding.map((project) => {
                                const funding = getFundingProgress(project);
                                return (
                                    <div key={project.slug} className="group flex flex-col items-center">
                                        <Link href={`/ouvrages/${project.slug}`} className="relative border-2 border-yellow-400 p-1 mb-4 transition-transform hover:scale-105">
                                            <img
                                                alt={project.title}
                                                className="h-72 w-52 object-cover shadow-md"
                                                src={project.coverImage}
                                            />
                                        </Link>
                                        <h3 className="text-center font-bold text-gray-800">{project.title}</h3>
                                        <p className="text-center text-xs text-gray-500 italic mt-1 mb-3">{project.subtitle}</p>

                                        <div className="w-48">
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                                                <div
                                                    className="h-full bg-yellow-400"
                                                    style={{ width: `${funding.percent}%` }}
                                                ></div>
                                            </div>
                                            <p className="mt-1 text-center text-[10px] font-black uppercase tracking-tighter">
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
