import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type CompanionInput = {
  is_child: boolean;
  child_age?: number;
  full_name?: string;
};

type ConfirmBody = {
  code: string;
  main_full_name: string;
  companions: CompanionInput[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as ConfirmBody;

  // La base de datos calculará los boletos automáticamente
  const { data, error } = await supabaseServer.rpc("confirm_rsvp", {
    p_invite_code: body.code,
    p_main_full_name: body.main_full_name,
    p_companions: body.companions ?? [],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
