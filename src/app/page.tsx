/* eslint-disable react-hooks/exhaustive-deps */
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
  const [userId, setUserId] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      const id = localStorage.getItem("userId");

      if (!id) {
        const newUserId = Math.random().toString(36).substring(7);
        setUserId(newUserId);
        localStorage.setItem("userId", newUserId);
      } else {
        setUserId(id);
      }

      setLoading(true);
      const response = await fetch("/api/books", {
        headers: { "x-user-id": id ?? userId! },
      });
      const data: UserBook[] = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchBooks();
  }, [userId]);

  const handleSearch = async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId!,
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
  };

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
      {!!books.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((userBook) => (
            <Card key={userBook.id} className="shadow-lg">
              <CardHeader>
                <h2 className="text-xl font-bold">{userBook.book.title}</h2>
                <p className="text-sm text-gray-500">
                  By {userBook.book.author}
                </p>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-gray-700">
                  {userBook.book.summary ?? "No summary available."}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/${userBook.bookId}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="ml-4 text-lg font-medium">Loading books...</p>
        </div>
      ) : (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className="p-8 text-center shadow-lg">
            <p className="text-lg font-medium text-gray-500">
              No books found. Try adding a book using its ID.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
