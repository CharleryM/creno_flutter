export type OwnerCourseStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED";

export type OwnerCourse = {
  id: string;
  studioId: string;
  title: string;
  discipline: string;
  description: string | null;
  startAt: string;
  durationMinutes: number;
  priceCents: number;
  capacity: number;
  status: OwnerCourseStatus;
  createdAt: string;
  updatedAt: string;

  studio: {
    id: string;
    name: string;
    city: string;
  };
};

export type MyCoursesResponse = {
  courses: OwnerCourse[];
};

export type CourseMutationResponse = {
  message: string;
  course: OwnerCourse;
};