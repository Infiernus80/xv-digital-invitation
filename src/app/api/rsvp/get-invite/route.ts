import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("guests")
    .select("id, alias, max_companions, status")
    .eq("invite_code", code)
    .single();

  console.log(error);
  console.log(data);

  if (error || !data) {
    return NextResponse.json(
      { error: "Invitación no encontrada" },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}
