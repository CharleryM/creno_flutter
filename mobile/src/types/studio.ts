export type OwnerStudio = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string;
  postalCode: string;
  city: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;

  _count: {
    courses: number;
  };
};

export type MyStudiosResponse = {
  studios: OwnerStudio[];
};

export type StudioMutationResponse = {
  message: string;
  studio: OwnerStudio;
};