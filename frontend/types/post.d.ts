// Post Types
type Attachment = {
  gifs: string[];
  images: string[];
  videos: string[];
};

type AttachmentType = "gif" | "image" | "video";

type PostStatus = "draft" | "published" | "archived";

type PostVisibility = "public" | "private" | "followers";

type Post = {
  id: string; // Changed to string for UUID
  content: string;
  attachments: {
    // Post Types
    gifs: string[];
    images: string[];
    videos: string[];
  };
  authorId: string;
  author: PostViewUser;
  createdAt: string;
  updatedAt: string;
  shares: InteractionResponse[];
  favorites: InteractionResponse[];
  likes: InteractionResponse[];
  status: PostStatus;
  visibility: PostVisibility;
};

// Readonly User:
type PostViewUser = {
  id: string;
  name?: string;
  username: string;
  avatar?: string;
  private: boolean;
};

// Index Pagination
type PaginationMeta = {
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
  firstPage?: number;
  firstPageUrl?: string;
  lastPageUrl?: string;
  nextPageUrl?: string;
  previousPageUrl?: string;
};
