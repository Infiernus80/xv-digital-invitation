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
  main_full_name?: string;
  matched_name?: string;
  matched_role?: string;
};

type RsvpLite = {
  guest_id?: string;
  full_name?: string;
  role?: string;
  created_at?: string;
};

const isMainRole = (role?: string) => {
  const normalized = (role || "").toLowerCase();
  return normalized === "main" || normalized === "titular";
};

const isCheckInRole = (role?: string) => {
  return (role || "").toLowerCase().startsWith("checkin_");
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

  const selectGuestsBase = () =>
    supabaseServer.from("guests").select("*").limit(50).order("alias", {
      ascending: true,
    });

  const [directGuestsResult, matchedRsvpsResult] =
    rawQuery.length > 0
      ? await Promise.all([
          selectGuestsBase().or(
            `invite_code.ilike.%${rawQuery}%,alias.ilike.%${rawQuery}%`,
          ),
          supabaseServer
            .from("rsvps")
            .select("guest_id, full_name, role")
            .ilike("full_name", `%${rawQuery}%`)
            .not("role", "like", "checkin_%")
            .limit(100),
        ])
      : await Promise.all([
          selectGuestsBase(),
          Promise.resolve({ data: null, error: null }),
        ]);

  if (directGuestsResult.error) {
    return NextResponse.json(
      { error: "No se pudo obtener la lista de invitados." },
      { status: 500 },
    );
  }

  if (matchedRsvpsResult.error) {
    return NextResponse.json(
      { error: "No se pudo obtener coincidencias por RSVP." },
      { status: 500 },
    );
  }

  const directGuests = Array.isArray(directGuestsResult.data)
    ? directGuestsResult.data
    : [];

  const matchedRsvps = Array.isArray(matchedRsvpsResult.data)
    ? matchedRsvpsResult.data
        .filter((row): row is Record<string, unknown> => !!row)
        .map((row) => ({
          guest_id: typeof row.guest_id === "string" ? row.guest_id : undefined,
          full_name:
            typeof row.full_name === "string" ? row.full_name : undefined,
          role: typeof row.role === "string" ? row.role : undefined,
        }))
    : [];

  const guestIdsFromRsvp = Array.from(
    new Set(
      matchedRsvps
        .map((row) => row.guest_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  const guestsFromRsvpMatch =
    guestIdsFromRsvp.length > 0
      ? await selectGuestsBase().in("id", guestIdsFromRsvp)
      : { data: [], error: null as unknown as null };

  if (guestsFromRsvpMatch.error) {
    return NextResponse.json(
      { error: "No se pudo obtener invitados vinculados a RSVP." },
      { status: 500 },
    );
  }

  const guestRows = [
    ...directGuests,
    ...(Array.isArray(guestsFromRsvpMatch.data)
      ? guestsFromRsvpMatch.data
      : []),
  ];

  const guestsByKey = new Map<string, Record<string, unknown>>();

  for (const row of guestRows) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const record = row as Record<string, unknown>;
    const key =
      (typeof record.id === "string" && record.id) ||
      (typeof record.invite_code === "string" && record.invite_code);

    if (!key || guestsByKey.has(key)) {
      continue;
    }

    guestsByKey.set(key, record);
  }

  const mergedGuestRows = Array.from(guestsByKey.values());

  const guests = mergedGuestRows
    .map(normalizeGuest)
    .sort((a, b) =>
      (a.main_full_name || a.alias || "").localeCompare(
        b.main_full_name || b.alias || "",
        "es",
      ),
    );

  const guestIds = guests
    .map((guest) => guest.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (guestIds.length === 0) {
    return NextResponse.json({ guests });
  }

  const { data: rsvpRows, error: rsvpRowsError } = await supabaseServer
    .from("rsvps")
    .select("guest_id, full_name, role, created_at")
    .in("guest_id", guestIds);

  if (rsvpRowsError) {
    return NextResponse.json(
      { error: "No se pudo obtener la data de RSVP." },
      { status: 500 },
    );
  }

  const rsvps = Array.isArray(rsvpRows)
    ? rsvpRows
        .filter((row): row is Record<string, unknown> => !!row)
        .map(
          (row): RsvpLite => ({
            guest_id:
              typeof row.guest_id === "string" ? row.guest_id : undefined,
            full_name:
              typeof row.full_name === "string" ? row.full_name : undefined,
            role: typeof row.role === "string" ? row.role : undefined,
            created_at:
              typeof row.created_at === "string" ? row.created_at : undefined,
          }),
        )
    : [];

  const mainByGuest = new Map<string, string>();
  const checkInByGuest = new Map<string, string>();
  const matchedByGuest = new Map<
    string,
    { full_name?: string; role?: string }
  >();

  for (const row of rsvps) {
    if (!row.guest_id) {
      continue;
    }

    if (
      isMainRole(row.role) &&
      row.full_name &&
      !mainByGuest.has(row.guest_id)
    ) {
      mainByGuest.set(row.guest_id, row.full_name);
    }

    if (row.role === "checkin_main" && row.created_at) {
      checkInByGuest.set(row.guest_id, row.created_at);
    }
  }

  if (rawQuery.length > 0) {
    const matchesByGuest = new Map<
      string,
      { full_name?: string; role?: string; priority: number }
    >();

    for (const row of matchedRsvps) {
      if (!row.guest_id) {
        continue;
      }

      const priority = isMainRole(row.role) ? 1 : 2;
      const current = matchesByGuest.get(row.guest_id);

      if (!current || priority > current.priority) {
        matchesByGuest.set(row.guest_id, {
          full_name: row.full_name,
          role: row.role,
          priority,
        });
      }
    }

    for (const [guestId, match] of matchesByGuest) {
      matchedByGuest.set(guestId, {
        full_name: match.full_name,
        role: match.role,
      });
    }
  }

  for (const guest of guests) {
    if (!guest.id) {
      continue;
    }

    const mainFullName = mainByGuest.get(guest.id);
    const checkedInAt = checkInByGuest.get(guest.id);
    const matched = matchedByGuest.get(guest.id);

    if (mainFullName) {
      guest.main_full_name = mainFullName;
    }

    if (checkedInAt) {
      guest.checked_in = true;
      guest.checked_in_at = checkedInAt;
    }

    if (matched?.full_name) {
      guest.matched_name = matched.full_name;
      guest.matched_role = matched.role;
    }
  }

  return NextResponse.json({ guests });
}
