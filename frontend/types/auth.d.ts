interface User {
  id: string;
  name?: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  link?: string;
  coverImage?: string;
  emailVerified: boolean;
  private?: boolean;
  requestStatus?: string;
  posts: {
    total: number;
    list: {
      meta: PaginationMeta;
      data: Post[];
    };
  };
  followers: {
    total: number;
    list: ReadonlyUser[]; // assuming User is the model for users
  };
  followings: {
    total: number;
    list: ReadonlyUser[];
  };
  requests?: {
    total: number;
    list: ReadonlyUser[];
  };
  favorites?: {
    total: number;
    list: Post[];
  };
  socialLinks: any;
}

// Classic Responses (Don't need to be changed)
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  status: number;
  data?: User;
  error?: string;
}

interface LogoutResponse {
  success: boolean;
  status?: number;
  error?: string;
}
