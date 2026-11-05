export type PreparePaymentResponse = {
  alreadyPaid: boolean;
  reservationId: string;
  clientSecret: string | null;
  amountCents: number;
};

export type ConfirmPaymentResponse = {
  message: string;

  reservation: {
    id: string;
    status: "PAID";
    amountCents: number;
  };
};

export type CancelPaymentResponse = {
  message: string;
};