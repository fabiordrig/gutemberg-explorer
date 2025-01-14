import { BookHandlers } from "@/lib/handlers/books";
import { NextResponse } from "next/server";

const booksHandler = new BookHandlers();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      console.error("User ID is required.", userId);
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 },
      );
    }

    const { id } = await params;
    const bookId = parseInt(id);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID." }, { status: 400 });
    }

    const books = await booksHandler.getBookByUserAndId(userId, bookId);

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books." },
      { status: 500 },
    );
  }
}
