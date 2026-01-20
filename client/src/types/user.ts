export interface User {
  id: string;
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  // Gelecekte buraya avatar, bio vb. eklemek çok kolay olacak
}

export type UserSearchResponse = {
  success: boolean;
  exists: boolean;
  data: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
  } | null;
};