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
    return <p>Loading...</p>;
  }

  if (!userBook) {
    return <p>Book not found.</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <h1 className="mb-4 text-4xl font-bold">{userBook.book.title}</h1>
          <p className="text-sm text-gray-500">By {userBook.book.author}</p>
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
