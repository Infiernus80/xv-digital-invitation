import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { calculateTickets, getChildTicketAgeLimit } from "@/lib/ticketUtils";

type CheckInBody = {
  inviteCode?: string;
  qrToken?: string;
  personType?: "main" | "companion";
  companionId?: string;
  companionName?: string;
  sourceTable?: string;
};

type GuestRow = {
  id?: string;
  invite_code?: string;
  qr_token?: string;
  status?: string;
  alias?: string;
};

type RsvpRow = {
  id?: string;
  role?: string;
  is_child?: boolean;
  child_age?: number;
};

const parseGuest = (row: Record<string, unknown>): GuestRow => ({
  id: typeof row.id === "string" ? row.id : undefined,
  invite_code:
    typeof row.invite_code === "string" ? row.invite_code : undefined,
  qr_token: typeof row.qr_token === "string" ? row.qr_token : undefined,
  status: typeof row.status === "string" ? row.status : undefined,
  alias: typeof row.alias === "string" ? row.alias : undefined,
});

const isMainRole = (role?: string) => {
  const normalized = (role || "").toLowerCase();
  return normalized === "main" || normalized === "titular";
};

const isCheckInCompanionRole = (role?: string) =>
  (role || "").startsWith("checkin_companion:");

const normalizeRsvp = (row: Record<string, unknown>): RsvpRow => ({
  id: typeof row.id === "string" ? row.id : undefined,
  role: typeof row.role === "string" ? row.role : undefined,
  is_child: typeof row.is_child === "boolean" ? row.is_child : undefined,
  child_age: typeof row.child_age === "number" ? row.child_age : undefined,
});

const buildCounter = (params: {
  rsvps: RsvpRow[];
  includeMain?: boolean;
  includeCompanionId?: string;
}) => {
  const { rsvps, includeMain = false, includeCompanionId } = params;

  const companions = rsvps.filter(
    (row) =>
      !!row.id &&
      !isMainRole(row.role) &&
      row.role !== "checkin_main" &&
      !isCheckInCompanionRole(row.role),
  );

  const allowedTickets = calculateTickets([
    { is_child: false },
    ...companions.map((row) => ({
      is_child: !!row.is_child,
      child_age: row.child_age,
    })),
  ]).totalTickets;

  const hasMainCheckIn = rsvps.some((row) => row.role === "checkin_main");
  const checkedCompanionIds = new Set(
    rsvps
      .map((row) => row.role || "")
      .filter((role) => role.startsWith("checkin_companion:"))
      .map((role) => role.replace("checkin_companion:", ""))
      .filter((id) => id.length > 0),
  );

  const checkedGuests = [
    ...(hasMainCheckIn || includeMain ? [{ is_child: false }] : []),
    ...companions
      .filter((row) => {
        if (!row.id) {
          return false;
        }

        return checkedCompanionIds.has(row.id) || row.id === includeCompanionId;
      })
      .map((row) => ({
        is_child: !!row.is_child,
        child_age: row.child_age,
      })),
  ];

  const usedTickets = calculateTickets(checkedGuests).totalTickets;

  return {
    allowedTickets,
    usedTickets,
    remainingTickets: Math.max(allowedTickets - usedTickets, 0),
    youngChildAgeLimit: getChildTicketAgeLimit(),
  };
};

const upsertRsvpCheckIn = async (params: {
  guestId: string;
  role: string;
  fullName: string;
}) => {
  const { guestId, role, fullName } = params;

  const { data: existingRows, error: existingError } = await supabaseServer
    .from("rsvps")
    .select("id")
    .eq("guest_id", guestId)
    .eq("role", role)
    .limit(1);

  if (existingError) {
    return { ok: false as const };
  }

  const existingId =
    Array.isArray(existingRows) && existingRows.length > 0
      ? typeof existingRows[0]?.id === "string"
        ? existingRows[0].id
        : undefined
      : undefined;

  if (existingId) {
    const { error } = await supabaseServer
      .from("rsvps")
      .update({ created_at: new Date().toISOString() })
      .eq("id", existingId);

    return error ? { ok: false as const } : { ok: true as const };
  }

  const { error } = await supabaseServer.from("rsvps").insert({
    guest_id: guestId,
    role,
    full_name: fullName,
    is_child: false,
  });

  return error ? { ok: false as const } : { ok: true as const };
};

const markMainCheckIn = async (guest: GuestRow) => {
  if (!guest.id) {
    return { ok: false as const };
  }

  return upsertRsvpCheckIn({
    guestId: guest.id,
    role: "checkin_main",
    fullName: guest.alias?.trim() || "Titular",
  });
};

const markCompanionCheckIn = async (params: {
  companionId?: string;
  companionName?: string;
  sourceTable?: string;
}) => {
  const { companionId, companionName, sourceTable } = params;

  if (!companionId || sourceTable !== "rsvps") {
    return { ok: false as const };
  }

  const { data: companionRow, error: companionError } = await supabaseServer
    .from("rsvps")
    .select("id, guest_id, full_name")
    .eq("id", companionId)
    .single();

  if (companionError || !companionRow?.guest_id) {
    return { ok: false as const };
  }

  const resolvedName =
    typeof companionRow.full_name === "string" &&
    companionRow.full_name.trim().length > 0
      ? companionRow.full_name.trim()
      : companionName?.trim() || "Acompanante";

  return upsertRsvpCheckIn({
    guestId: companionRow.guest_id,
    role: `checkin_companion:${companionId}`,
    fullName: resolvedName,
  });
};

export async function POST(req: Request) {
  const body = (await req.json()) as CheckInBody;
  const inviteCode = body.inviteCode?.trim() ?? "";
  const personType = body.personType ?? "main";

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
      { error: "Invitacion no encontrada." },
      { status: 404 },
    );
  }

  const guest = parseGuest(data as Record<string, unknown>);

  if (guest.status && guest.status !== "confirmed") {
    return NextResponse.json(
      { error: "La invitacion no esta confirmada." },
      { status: 409 },
    );
  }

  const sentQrToken = body.qrToken?.trim() ?? "";
  const expectedFallback = `token-${guest.invite_code ?? inviteCode}`;
  const knownToken = guest.qr_token?.trim();

  if (sentQrToken.length > 0) {
    const validByStoredToken = knownToken ? sentQrToken === knownToken : false;
    const validByFallback = sentQrToken === expectedFallback;

    if (!validByStoredToken && !validByFallback) {
      return NextResponse.json({ error: "QR invalido." }, { status: 401 });
    }
  }

  const { data: rsvpsRows, error: rsvpsError } = guest.id
    ? await supabaseServer
        .from("rsvps")
        .select("id, role, is_child, child_age")
        .eq("guest_id", guest.id)
    : { data: null, error: null };

  if (rsvpsError) {
    return NextResponse.json(
      { error: "No se pudo validar el aforo para esta invitación." },
      { status: 500 },
    );
  }

  const rsvps = Array.isArray(rsvpsRows)
    ? rsvpsRows
        .filter(Boolean)
        .map((row) => normalizeRsvp(row as Record<string, unknown>))
    : [];

  if (personType === "main") {
    const preview = buildCounter({ rsvps, includeMain: true });

    if (preview.usedTickets > preview.allowedTickets) {
      return NextResponse.json(
        {
          error:
            "Se supera el aforo permitido para esta invitación al marcar al titular.",
        },
        { status: 409 },
      );
    }
  }

  if (personType === "companion") {
    const companionId = body.companionId?.trim();

    if (!companionId) {
      return NextResponse.json(
        { error: "El acompañante a marcar es obligatorio." },
        { status: 400 },
      );
    }

    const preview = buildCounter({ rsvps, includeCompanionId: companionId });

    if (preview.usedTickets > preview.allowedTickets) {
      return NextResponse.json(
        {
          error: `Aforo completo para este código. Cupos usados: ${preview.usedTickets}/${preview.allowedTickets}. Regla niños 2x1 para ${preview.youngChildAgeLimit - 1} años o menos.`,
        },
        { status: 409 },
      );
    }

    const companionResult = await markCompanionCheckIn({
      companionId,
      companionName: body.companionName?.trim(),
      sourceTable: body.sourceTable?.trim(),
    });

    if (!companionResult.ok) {
      return NextResponse.json(
        {
          error:
            "No se pudo marcar el ingreso del acompanante en rsvps. Verifica que exista el registro y que source_table sea rsvps.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: `Ingreso registrado para ${body.companionName?.trim() || "acompanante"}.`,
      checkedAt: new Date().toISOString(),
      counter: buildCounter({ rsvps, includeCompanionId: companionId }),
    });
  }

  const mainResult = await markMainCheckIn(guest);

  if (!mainResult.ok) {
    return NextResponse.json(
      {
        error:
          "No se pudo marcar la entrada en rsvps. Verifica que la tabla rsvps permita insertar role=checkin_main.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Entrada marcada correctamente.",
    checkedAt: new Date().toISOString(),
    counter: buildCounter({ rsvps, includeMain: true }),
  });
}
