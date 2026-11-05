export type StudioSummary = {
  id: string;
  name: string;
  city: string;
};

export type PublicCourse = {
  id: string;
  studioId: string;
  title: string;
  discipline: string;
  description: string | null;
  startAt: string;
  durationMinutes: number;
  priceCents: number;
  capacity: number;
  availablePlaces: number;
  status: "PUBLISHED";
  createdAt: string;
  updatedAt: string;

  studio: StudioSummary;
};

export type CoursesResponse = {
  courses: PublicCourse[];
};

export type CourseDetailStudio = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  postalCode: string;
  city: string;
};

export type CourseDetail = Omit<
  PublicCourse,
  "studio"
> & {
  studio: CourseDetailStudio;
};

export type CourseResponse = {
  course: CourseDetail;
};