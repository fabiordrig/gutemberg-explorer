import openai from "@/lib/ai";
import { type GutendexResponse } from "@/lib/types";
import { db } from "@/server/db";
import axios from "axios";
import { NextResponse } from "next/server";

// Base URL for Gutendex API
const GUTENDEX_BASE_URL = "https://gutendex.com/books";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id");
    const { bookId } = body;

    if (!bookId || !userId) {
      return NextResponse.json(
        { error: "Book ID is required." },
        { status: 400 },
      );
    }

    const response = await axios.get<GutendexResponse>(
      `${GUTENDEX_BASE_URL}/${bookId}`,
    );
    const bookData = response.data;

    const bookContentResponse = await axios.get(
      bookData.formats["text/plain; charset=us-ascii"]!,
    );

    const bookContent = bookContentResponse.data;
    const subBookContent = bookContent.substring(0, 16385);

    const prompt = `
    Identify the summary of the book "${bookData.title}" and the key characters based on this text: ${subBookContent}.

    Answer always on this JSON format:

      {
      "summary": "The summary of the book", /// Summary with a maximum of 500 characters
      "characters": "Character 1, Character 2, "Character 3"
      }
    `;

    /// Identifying the summary of the book and the key characters
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const content = aiResponse.choices[0]?.message?.content ?? "";

    let parsedContent: { summary?: string; characters?: string };
    try {
      parsedContent = JSON.parse(content);
    } catch {
      throw new Error("Invalid AI response format");
    }

    const savedBook = await db.book.create({
      data: {
        title: bookData.title,
        author: bookData.authors?.[0]?.name ?? "Unknown",
        publicationYear: bookData?.publication_year ?? null,
        metadata: JSON.parse(JSON.stringify(bookData)),
        content: bookContent,
        summary: parsedContent.summary ?? null,
        keyCharacters: parsedContent.characters ?? null,
      },
    });

    await db.userBooks.create({
      data: {
        userId: userId,
        bookId: savedBook.id,
      },
    });

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

    const books = await db.userBooks.findMany({
      where: {
        userId,
      },
      include: {
        book: true,
      },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books." },
      { status: 500 },
    );
  }
}
