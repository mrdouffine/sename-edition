import BookModel, { type BookDocument, type SaleType } from "@/models/Book";
import { connectToDatabase } from "@/lib/mongodb";
import { mockBooks } from "@/lib/data/mockBooks";
import { slugify } from "@/lib/text/slugify";

function sortBooks(books: BookDocument[]) {
  return books.sort((a, b) => a.title.localeCompare(b.title));
}

export async function listBooksByType(type: SaleType) {
  try {
    await connectToDatabase();
    const books = await BookModel.find({ saleType: type }).lean();
    if (books.length > 0) {
      return sortBooks(books as unknown as BookDocument[]);
    }
    return sortBooks(mockBooks.filter((book) => book.saleType === type));
  } catch (error) {
    console.warn("Falling back to mock books", error);
    return sortBooks(mockBooks.filter((book) => book.saleType === type));
  }
}

export async function getBookBySlug(slug: string) {
  try {
    await connectToDatabase();
    const book = await BookModel.findOne({ slug }).lean();
    if (book) {
      return book as unknown as BookDocument;
    }
    return mockBooks.find((b) => b.slug === slug) ?? null;
  } catch (error) {
    console.warn("Falling back to mock books", error);
    return mockBooks.find((book) => book.slug === slug) ?? null;
  }
}

export async function getHomeFeaturedBook() {
  try {
    await connectToDatabase();
    const featured = await BookModel.findOne({ tags: "featured" }).sort({ createdAt: -1 }).lean();
    if (featured) {
      return featured as unknown as BookDocument;
    }
    const latest = await BookModel.findOne({}).sort({ createdAt: -1 }).lean();
    if (latest) {
      return latest as unknown as BookDocument;
    }
    return mockBooks.find(b => b.tags.includes("featured")) || mockBooks[0] || null;
  } catch (error) {
    console.warn("Falling back to mock featured book", error);
    return mockBooks.find(b => b.tags.includes("featured")) || mockBooks[0] || null;
  }
}

export async function createBook(payload: Partial<BookDocument>) {
  await connectToDatabase();

  const baseSlug = slugify(String(payload.slug ?? payload.title ?? ""));
  const uniqueSlug = await findAvailableSlug(baseSlug || `ouvrage-${Date.now()}`);

  const book = await BookModel.create({
    ...payload,
    slug: uniqueSlug
  });
  return book;
}

async function findAvailableSlug(base: string) {
  let candidate = base;
  let index = 2;

  while (await BookModel.exists({ slug: candidate })) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}
