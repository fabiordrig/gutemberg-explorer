"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type UserBook } from "@/lib/types";
import Link from "next/link";
import { type SetStateAction, useEffect, useState } from "react";

export default function MainPage() {
  const [bookId, setBookId] = useState("");
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchBooks() {
    const response = await fetch("/api/books", {
      headers: { "x-user-id": "demo-user" },
    });
    const data: UserBook[] = await response.json();
    setBooks(data);
  }

  useEffect(() => {
    void fetchBooks();
  }, []);

  async function handleSearch() {
    try {
      if (!bookId) return;
      setLoading(true);

      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user",
        },
        body: JSON.stringify({ bookId }),
      });

      if (response.ok) {
        setBookId("");
        await fetchBooks();
      }
    } catch (error) {
      console.error("Error searching for book:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-4xl font-bold">Gutenberg Explorer</h1>
      <div className="mb-8 flex gap-4">
        <Input
          type="text"
          value={bookId}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setBookId(e.target.value)
          }
          placeholder="Enter book ID"
          className="w-full"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((userBook) => (
          <Card key={userBook.id} className="shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-bold">{userBook.book.title}</h2>
              <p className="text-sm text-gray-500">By {userBook.book.author}</p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-gray-700">
                {userBook.book.summary ?? "No summary available."}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/${userBook.bookId}`} className="btn btn-secondary">
                View Details
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
