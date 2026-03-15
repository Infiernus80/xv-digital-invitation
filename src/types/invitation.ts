export interface QrPayload {
  inviteCode: string;
  qrToken: string;
}

export interface ConfirmationSectionProps {
  inviteCode: string;
  qrToken: string;
  initialConfirmed?: boolean;
}

export interface InvitationQrProps {
  inviteCode: string;
  qrToken: string;
}
