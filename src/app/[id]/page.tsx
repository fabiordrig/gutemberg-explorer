"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { type GutendexResponse, type UserBook } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookDetails() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        const response = await fetch(`/api/books/${id}`, {
          headers: { "x-user-id": "demo-user" },
        });
        const data: UserBook = await response.json();

        setUserBook(data);
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="ml-4 text-lg font-medium">Loading book details...</p>
      </div>
    );
  }

  if (!userBook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-red-500">
          Sorry, we couldn’t find the book you were looking for. Please try
          another book ID.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <h1 className="mb-4 text-4xl font-bold">{userBook.book.title}</h1>
          <p className="text-sm text-gray-500">By {userBook.book.author}</p>
          <h2 className="mb-2 text-lg font-semibold">Summary</h2>
          <p className="mb-4 text-gray-700">{userBook.book.summary}</p>
          <h2 className="mb-2 text-lg font-semibold">Key Characters</h2>
          <p className="mb-4 text-gray-700">{userBook.book.keyCharacters}</p>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">{userBook.book.content}</p>
        </CardContent>
        <CardFooter>
          <Button asChild disabled={!userBook}>
            <a
              href={
                (userBook?.book.metadata as unknown as GutendexResponse)
                  .formats["text/plain; charset=us-ascii"]
              }
              download
            >
              Download Book
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
