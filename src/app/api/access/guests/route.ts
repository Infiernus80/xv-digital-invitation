import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type GuestRecord = {
  id?: string;
  alias?: string;
  invite_code?: string;
  status?: string;
  max_companions?: number;
  checked_in?: boolean;
  checked_in_at?: string;
};

const normalizeGuest = (row: Record<string, unknown>): GuestRecord => {
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    alias: typeof row.alias === "string" ? row.alias : undefined,
    invite_code:
      typeof row.invite_code === "string" ? row.invite_code : undefined,
    status: typeof row.status === "string" ? row.status : undefined,
    max_companions:
      typeof row.max_companions === "number" ? row.max_companions : undefined,
    checked_in:
      typeof row.checked_in === "boolean" ? row.checked_in : undefined,
    checked_in_at:
      typeof row.checked_in_at === "string" ? row.checked_in_at : undefined,
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q")?.trim() ?? "";

  const baseQuery = supabaseServer
    .from("guests")
    .select("*")
    .limit(50)
    .order("alias", { ascending: true });

  const query =
    rawQuery.length > 0
      ? baseQuery.or(
          `invite_code.ilike.%${rawQuery}%,alias.ilike.%${rawQuery}%`,
        )
      : baseQuery;

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "No se pudo obtener la lista de invitados." },
      { status: 500 },
    );
  }

  const guests = Array.isArray(data)
    ? data
        .filter((row): row is Record<string, unknown> => !!row)
        .map(normalizeGuest)
    : [];

  const guestIds = guests
    .map((guest) => guest.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (guestIds.length > 0) {
    const { data: checkInRows } = await supabaseServer
      .from("rsvps")
      .select("guest_id, created_at")
      .eq("role", "checkin_main")
      .in("guest_id", guestIds);

    if (Array.isArray(checkInRows)) {
      const byGuest = new Map<string, string>();

      for (const row of checkInRows) {
        const guestId = typeof row.guest_id === "string" ? row.guest_id : "";
        const createdAt =
          typeof row.created_at === "string" ? row.created_at : undefined;

        if (guestId && createdAt) {
          byGuest.set(guestId, createdAt);
        }
      }

      for (const guest of guests) {
        if (!guest.id) {
          continue;
        }

        const checkInAt = byGuest.get(guest.id);

        if (checkInAt) {
          guest.checked_in = true;
          guest.checked_in_at = checkInAt;
        }
      }
    }
  }

  return NextResponse.json({ guests });
}
