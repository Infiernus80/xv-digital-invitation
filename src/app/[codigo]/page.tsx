import { InvitationClient } from "@/components/page/Invitacion";

type PageProps = {
  params: Promise<{ codigo: string }>;
};

export default async function Page({ params }: PageProps) {
  const { codigo } = await params;

  return <InvitationClient inviteCode={codigo} autoOpenModal />;
}
