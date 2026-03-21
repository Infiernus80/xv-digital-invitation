import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { calculateTickets, getChildTicketAgeLimit } from "@/lib/ticketUtils";

type Companion = {
  id: string;
  full_name: string;
  is_child: boolean;
  child_age?: number;
  checked_in?: boolean;
  checked_in_at?: string;
  source_table?: string;
};

type GuestDetails = {
  id?: string;
  invite_code?: string;
  alias?: string;
  status?: string;
  checked_in?: boolean;
  checked_in_at?: string;
  main_full_name?: string;
  companions: Companion[];
  counter: {
    allowed_tickets: number;
    used_tickets: number;
    remaining_tickets: number;
    entered_adults: number;
    entered_young_children: number;
    young_child_age_limit: number;
  };
};

type RsvpRow = {
  id?: string;
  guest_id?: string;
  role?: string;
  full_name?: string;
  is_child?: boolean;
  child_age?: number;
  created_at?: string;
};

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const readBool = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const readNumber = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

const normalizeRsvp = (row: Record<string, unknown>): RsvpRow => ({
  id: readString(row.id),
  guest_id: readString(row.guest_id),
  role: readString(row.role),
  full_name: readString(row.full_name),
  is_child: readBool(row.is_child),
  child_age: readNumber(row.child_age),
  created_at: readString(row.created_at),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inviteCode = searchParams.get("code")?.trim() ?? "";

  if (!inviteCode) {
    return NextResponse.json(
      { error: "El codigo de invitacion es obligatorio." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseServer
    .from("guests")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Invitado no encontrado." },
      { status: 404 },
    );
  }

  const guestRow = data as Record<string, unknown>;
  const guestId = readString(guestRow.id);

  const { data: rsvpsData, error: rsvpsError } = guestId
    ? await supabaseServer.from("rsvps").select("*").eq("guest_id", guestId)
    : { data: null, error: null };

  if (rsvpsError) {
    return NextResponse.json(
      { error: "No se pudo obtener la data de RSVP." },
      { status: 500 },
    );
  }

  const rsvps = Array.isArray(rsvpsData)
    ? rsvpsData
        .filter((row): row is Record<string, unknown> => !!row)
        .map(normalizeRsvp)
    : [];

  const mainRsvp =
    rsvps.find((row) => row.role?.toLowerCase() === "main") ??
    rsvps.find((row) => row.role?.toLowerCase() === "titular");

  const mainCheckInRow = rsvps.find((row) => row.role === "checkin_main");

  const companions: Companion[] = rsvps
    .filter(
      (row) =>
        !!row.id &&
        !!row.full_name &&
        row.role !== "main" &&
        row.role !== "titular" &&
        row.role !== "checkin_main" &&
        !String(row.role ?? "").startsWith("checkin_companion:"),
    )
    .map((row) => {
      const checkInRow = rsvps.find(
        (candidate) => candidate.role === `checkin_companion:${row.id}`,
      );

      return {
        id: row.id as string,
        full_name: row.full_name as string,
        is_child: row.is_child ?? false,
        child_age: row.child_age,
        checked_in: !!checkInRow,
        checked_in_at: checkInRow?.created_at,
        source_table: "rsvps",
      };
    });

  const youngChildAgeLimit = getChildTicketAgeLimit();

  const allowedTickets = calculateTickets([
    { is_child: false },
    ...companions.map((companion) => ({
      is_child: companion.is_child,
      child_age: companion.child_age,
    })),
  ]).totalTickets;

  const enteredAdults =
    (mainCheckInRow ? 1 : 0) +
    companions.filter(
      (companion) =>
        companion.checked_in &&
        (!companion.is_child ||
          (typeof companion.child_age === "number" &&
            companion.child_age >= youngChildAgeLimit)),
    ).length;

  const enteredYoungChildren = companions.filter(
    (companion) =>
      companion.checked_in &&
      companion.is_child &&
      typeof companion.child_age === "number" &&
      companion.child_age < youngChildAgeLimit,
  ).length;

  const usedTickets = enteredAdults + Math.ceil(enteredYoungChildren / 2);
  const remainingTickets = Math.max(allowedTickets - usedTickets, 0);

  const details: GuestDetails = {
    id: guestId,
    invite_code: readString(guestRow.invite_code),
    alias: readString(guestRow.alias),
    status: readString(guestRow.status),
    checked_in: !!mainCheckInRow,
    checked_in_at: mainCheckInRow?.created_at,
    main_full_name:
      mainRsvp?.full_name ??
      readString(guestRow.alias) ??
      readString(guestRow.name),
    companions,
    counter: {
      allowed_tickets: allowedTickets,
      used_tickets: usedTickets,
      remaining_tickets: remainingTickets,
      entered_adults: enteredAdults,
      entered_young_children: enteredYoungChildren,
      young_child_age_limit: youngChildAgeLimit,
    },
  };

  return NextResponse.json(details);
}
