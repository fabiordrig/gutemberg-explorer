import { db } from "@/server/db";
import { type GutendexResponse } from "../types";

export class BookHandlers {
  async getBooksByUser(userId: string) {
    return db.userBooks.findMany({
      where: { userId },
      include: { book: true },
    });
  }

  async getBookById(userId: string, bookId: number) {
    return db.userBooks.findFirstOrThrow({
      where: { userId, bookId },
      include: { book: true },
    });
  }

  async getBookByUserAndId(userId: string, bookId: number) {
    return db.userBooks.findFirstOrThrow({
      where: {
        userId,
        bookId,
      },
      include: {
        book: true,
      },
    });
  }

  async saveBook(
    userId: string,
    bookData: GutendexResponse,
    bookContent: string,
    summary: string | null,
    keyCharacters: string | null,
  ) {
    const savedBook = await db.book.create({
      data: {
        title: bookData.title,
        author: bookData.authors?.[0]?.name ?? "Unknown",
        publicationYear: bookData.publication_year ?? null,
        metadata: JSON.parse(JSON.stringify(bookData)),
        content: bookContent,
        summary,
        keyCharacters,
      },
    });

    await db.userBooks.create({
      data: {
        userId,
        bookId: savedBook.id,
      },
    });

    return savedBook;
  }
}
