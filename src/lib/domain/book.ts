import type { BookDocument } from "@/models/Book";

export function getFundingProgress(book: BookDocument) {
  if (book.saleType !== "crowdfunding") {
    return { percent: 0, remaining: 0 };
  }

  const goal = book.fundingGoal ?? 0;
  const raised = book.fundingRaised ?? 0;
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  return { percent, remaining: Math.max(0, goal - raised) };
}

export function getSaleStatus(book: BookDocument) {
  if (book.saleType === "preorder") {
    return "Précommande";
  }

  if (book.saleType === "crowdfunding") {
    return "Financement participatif";
  }

  return "Disponible";
}

export function isOutOfStock(book: BookDocument) {
  if (book.saleType !== "direct") {
    return false;
  }

  if (book.stock === undefined || book.stock === null) {
    return false;
  }

  return book.stock <= 0;
}
