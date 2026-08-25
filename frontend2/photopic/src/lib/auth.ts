export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  return {
    user: {
      uid: 'mock-google-user',
      email: 'google.user@example.com',
      displayName: 'Mock Google User',
      photoURL: null
    },
    accessToken: 'mock-access-token'
  };
};

export const emailSignUp = async (email: string, password: string, displayName: string): Promise<User> => {
  return {
    uid: 'mock-email-user',
    email,
    displayName,
    photoURL: null
  };
};

export const emailSignIn = async (email: string, password: string): Promise<User> => {
  return {
    uid: 'mock-email-user',
    email,
    displayName: email.split('@')[0],
    photoURL: null
  };
};
