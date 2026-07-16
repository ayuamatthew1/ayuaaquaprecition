export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};
