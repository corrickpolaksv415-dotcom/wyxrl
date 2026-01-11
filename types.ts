export interface User {
  id: string;
  name: string;
  avatar: string;
  provider: 'email' | 'google' | 'qq';
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  content: string; // HTML or Text content
  tags: string[];
  createdAt: number;
  uploaderId: string;
}

export enum ViewState {
  HOME = 'HOME',
  READ = 'READ',
  UPLOAD = 'UPLOAD',
  LOGIN = 'LOGIN'
}

export interface ImageGenerationConfig {
  prompt: string;
  size: '1K' | '2K' | '4K';
}
