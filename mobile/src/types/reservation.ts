export type ReservationStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";

export type ReservationCourseStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED";

export type MyReservation = {
  id: string;
  status: ReservationStatus;
  amountCents: number;
  createdAt: string;
  updatedAt: string;

  course: {
    id: string;
    title: string;
    discipline: string;
    startAt: string;
    durationMinutes: number;
    status: ReservationCourseStatus;

    studio: {
      id: string;
      name: string;
      city: string;
    };
  };
};

export type ReservationsResponse = {
  reservations: MyReservation[];
};

export type CreateReservationResponse = {
  message: string;
  reservation: {
    id: string;
    status: ReservationStatus;
    amountCents: number;
    createdAt: string;

    course: {
      id: string;
      title: string;
      discipline: string;
      startAt: string;
      durationMinutes: number;

      studio: {
        id: string;
        name: string;
        city: string;
      };
    };
  };
};