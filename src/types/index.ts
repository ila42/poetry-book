export interface Poem {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  audioUrl?: string;
  epigraph?: string;
  dedication?: string;
  date?: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
}

export interface Author {
  name: string;
  fullName: string;
  birthYear: number;
  deathYear?: number;
  photoUrl: string;
  biography: string;
  shortBio: string;
}

export interface BookInfo {
  title: string;
  subtitle?: string;
  author: string;
  year: number;
  introduction: string;
  dedication?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type PageType = 
  | 'cover'
  | 'title'
  | 'dedication'
  | 'toc'
  | 'about'
  | 'introduction'
  | 'chapter-title'
  | 'poem'
  | 'contact'
  | 'back-cover';

export interface BookPage {
  type: PageType;
  content?: Poem | Chapter | string;
  pageNumber?: number;
}
