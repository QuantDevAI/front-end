export type RegistrationAccount = {
  email: string;
  name: string;
  password: string;
};

export type RegistrationPayload = RegistrationAccount & {
  cinephileStory: string;
  favoriteMovieIds: string[];
  genreIds: string[];
};

export type RegistrationResult = {
  userId: string;
};
