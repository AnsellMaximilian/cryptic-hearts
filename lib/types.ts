export type SharedProfile = {
  recordId: string;
  contextId: string;

  username?: string;
  fullName?: string;
  description?: string;
  dateOfBirth?: string;
  occupation?: string;
  gender?: string;
  city?: string;
  country?: string;
};

export type Following = {
  did: string;
  assignedName: string;
  sharedProfile?: SharedProfile;
};

export type Follower = {
  did: string;
  sharedProfile?: SharedProfile;
};

export type Post = {
  recordId: string;
  content: string;
  image?: string;
  uniqueId: string;
  authorId: string;
  authorLabel: string;
  dateCreated: string;
};
