import { AIHandlers } from "@/lib/handlers/ai";
import { BookHandlers } from "@/lib/handlers/books";
import { type GutendexResponse } from "@/lib/types";
import axios from "axios";
import { NextResponse } from "next/server";

const booksHandler = new BookHandlers();
const aiHandler = new AIHandlers();

const GUTENDEX_BASE_URL = "https://gutendex.com/books";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id");
    const { bookId } = body;

    if (!bookId || !userId) {
      return NextResponse.json(
        { error: "Book ID and User ID are required." },
        { status: 400 },
      );
    }

    const response = await axios.get<GutendexResponse>(
      `${GUTENDEX_BASE_URL}/${bookId}`,
    );
    const bookData = response.data;

    const bookContentResponse = await axios.get<string>(
      bookData.formats["text/plain; charset=us-ascii"]!,
    );
    const bookContent = bookContentResponse.data;
    const subBookContent = bookContent.substring(0, 16385);

    const { summary, characters } =
      await aiHandler.generateBookSummaryAndCharacters(
        bookData.title,
        subBookContent,
      );

    const savedBook = await booksHandler.saveBook(
      userId,
      bookData,
      bookContent,
      summary,
      characters,
    );

    return NextResponse.json({
      message: "Book saved successfully",
      book: savedBook,
    });
  } catch (error) {
    console.error("Error fetching or saving book:", error);
    return NextResponse.json(
      { error: "Failed to fetch or save book." },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 },
      );
    }

    const books = await booksHandler.getBooksByUser(userId);

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books." },
      { status: 500 },
    );
  }
}
