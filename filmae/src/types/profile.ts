export type UserProfile = {
  bio: string;
  createdAt: string;
  email: string;
  id: number;
  name: string;
};

export type UserProfilePreferences = {
  receiveRecommendationsByEmail: boolean;
  spoilerModeEnabled: boolean;
};

export type UserProfilePayload = {
  preferences: UserProfilePreferences;
  user: UserProfile;
};

export type UpdateUserProfileRequest = {
  bio: string;
  name: string;
};
