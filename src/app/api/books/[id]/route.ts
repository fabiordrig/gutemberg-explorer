import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      console.log("User ID is required.", userId);
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 },
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid book ID." }, { status: 400 });
    }

    const books = await db.userBooks.findUnique({
      where: {
        userId,
        id,
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
