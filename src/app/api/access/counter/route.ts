import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type CompanionRow = {
  id?: string;
  is_child?: boolean;
};

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

export async function GET() {
  const { data: checkInRows, error: checkInError } = await supabaseServer
    .from("rsvps")
    .select("role")
    .or("role.eq.checkin_main,role.like.checkin_companion:%");

  if (checkInError) {
    return NextResponse.json(
      { error: "No se pudo obtener el contador de ingresos." },
      { status: 500 },
    );
  }

  const rows = Array.isArray(checkInRows)
    ? checkInRows.filter(Boolean).map((row) => ({
        role: typeof row.role === "string" ? row.role : undefined,
      }))
    : [];

  const adultsFromMain = rows.filter(
    (row) => row.role === "checkin_main",
  ).length;

  const companionCheckInIds = Array.from(
    new Set(
      rows
        .map(
          (row) => readString(row.role)?.match(/^checkin_companion:(.+)$/)?.[1],
        )
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  if (companionCheckInIds.length === 0) {
    return NextResponse.json({
      adults: adultsFromMain,
      children: 0,
      total: adultsFromMain,
    });
  }

  const { data: companionRows, error: companionError } = await supabaseServer
    .from("rsvps")
    .select("id, is_child")
    .in("id", companionCheckInIds);

  if (companionError) {
    return NextResponse.json(
      { error: "No se pudo obtener el detalle de acompañantes ingresados." },
      { status: 500 },
    );
  }

  const checkedInCompanions: CompanionRow[] = Array.isArray(companionRows)
    ? companionRows.filter(Boolean).map((row) => ({
        id: typeof row.id === "string" ? row.id : undefined,
        is_child: typeof row.is_child === "boolean" ? row.is_child : undefined,
      }))
    : [];

  const children = checkedInCompanions.filter((row) => row.is_child).length;
  const adultsFromCompanions = checkedInCompanions.filter(
    (row) => !row.is_child,
  ).length;
  const adults = adultsFromMain + adultsFromCompanions;

  return NextResponse.json({
    adults,
    children,
    total: adults + children,
  });
}
