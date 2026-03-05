import { InvitationClient } from "@/components/page/Invitacion";
import { supabaseServer } from "@/lib/supabaseServer";

type PageProps = {
  params: Promise<{ codigo: string }>;
};

export default async function Page({ params }: PageProps) {
  const { codigo } = await params;

  const { data } = await supabaseServer
    .from("guests")
    .select("status")
    .eq("invite_code", codigo)
    .single();

  return (
    <InvitationClient
      inviteCode={codigo}
      autoOpenModal={false}
      showCoverByDefault={false}
      redirectToFullOnConfirm={false}
      inviteStatus={data?.status}
    />
  );
}
