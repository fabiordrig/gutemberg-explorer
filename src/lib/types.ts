import { type Book, type UserBooks } from "@prisma/client";

export interface GutendexResponse {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright?: boolean;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
  publication_year?: number;
}

export type UserBook = UserBooks & { book: Book };
