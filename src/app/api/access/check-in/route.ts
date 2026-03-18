import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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
};

const parseGuest = (row: Record<string, unknown>): GuestRow => ({
  id: typeof row.id === "string" ? row.id : undefined,
  invite_code:
    typeof row.invite_code === "string" ? row.invite_code : undefined,
  qr_token: typeof row.qr_token === "string" ? row.qr_token : undefined,
  status: typeof row.status === "string" ? row.status : undefined,
});

const buildCheckInPayloads = (
  atIso: string,
): Array<Record<string, unknown>> => {
  return [
    { checked_in: true, checked_in_at: atIso },
    { checked_in_at: atIso },
    { entered_at: atIso },
    { entry_at: atIso },
    { is_checked_in: true, checked_in_at: atIso },
  ];
};

const upsertRsvpCheckIn = async (params: {
  guestId: string;
  role: string;
  fullName?: string;
}) => {
  const { guestId, role, fullName } = params;

  const { data: existing, error: existingError } = await supabaseServer
    .from("rsvps")
    .select("id")
    .eq("guest_id", guestId)
    .eq("role", role)
    .maybeSingle();

  if (existingError) {
    return { ok: false as const };
  }

  if (existing?.id) {
    const { error } = await supabaseServer
      .from("rsvps")
      .update({ created_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (!error) {
      return { ok: true as const };
    }

    return { ok: false as const };
  }

  const { error } = await supabaseServer.from("rsvps").insert({
    guest_id: guestId,
    role,
    full_name: fullName ?? "",
    is_child: false,
  });

  return error ? { ok: false as const } : { ok: true as const };
};

const markGuestCheckIn = async (inviteCode: string) => {
  const checkedAt = new Date().toISOString();

  for (const payload of buildCheckInPayloads(checkedAt)) {
    const { error } = await supabaseServer
      .from("guests")
      .update(payload)
      .eq("invite_code", inviteCode);

    if (!error) {
      return { ok: true as const, checkedAt };
    }
  }

  const { data: guest, error: guestError } = await supabaseServer
    .from("guests")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (!guestError && guest?.id) {
    const rsvpCheckIn = await upsertRsvpCheckIn({
      guestId: guest.id,
      role: "checkin_main",
    });

    if (rsvpCheckIn.ok) {
      return { ok: true as const, checkedAt };
    }

    const { error: insertError } = await supabaseServer
      .from("guest_checkins")
      .insert({
        guest_id: guest.id,
        invite_code: inviteCode,
        checked_in_at: checkedAt,
      });

    if (!insertError) {
      return { ok: true as const, checkedAt };
    }
  }

  return { ok: false as const };
};

const tryMarkCompanionInKnownTables = async (
  companionId: string,
  inviteCode: string,
  sourceTable?: string,
) => {
  const checkedAt = new Date().toISOString();

  if (sourceTable === "rsvps") {
    const { data: companionRow, error: companionError } = await supabaseServer
      .from("rsvps")
      .select("id, guest_id, full_name")
      .eq("id", companionId)
      .maybeSingle();

    if (!companionError && companionRow?.guest_id) {
      const upsertCheckIn = await upsertRsvpCheckIn({
        guestId: companionRow.guest_id,
        role: `checkin_companion:${companionId}`,
        fullName:
          typeof companionRow.full_name === "string"
            ? companionRow.full_name
            : undefined,
      });

      if (upsertCheckIn.ok) {
        return { ok: true as const, checkedAt };
      }
    }
  }

  const tables = sourceTable
    ? [sourceTable]
    : [
        "rsvp_companions",
        "guest_companions",
        "companions",
        "rsvp_attendees",
        "rsvp_guests",
      ];

  const payloads: Array<Record<string, unknown>> = [
    { checked_in: true, checked_in_at: checkedAt },
    { entered_at: checkedAt },
    { entry_at: checkedAt },
    { is_checked_in: true, checked_in_at: checkedAt },
  ];

  for (const table of tables) {
    for (const payload of payloads) {
      const { error } = await supabaseServer
        .from(table)
        .update(payload)
        .eq("id", companionId)
        .eq("invite_code", inviteCode);

      if (!error) {
        return { ok: true as const, checkedAt };
      }
    }
  }

  return { ok: false as const, checkedAt };
};

const insertCompanionCheckInLog = async (
  inviteCode: string,
  companionId?: string,
  companionName?: string,
) => {
  const checkedAt = new Date().toISOString();
  const payloads = [
    {
      invite_code: inviteCode,
      companion_id: companionId,
      companion_name: companionName,
      checked_in_at: checkedAt,
    },
    {
      invite_code: inviteCode,
      companion_id: companionId,
      companion_name: companionName,
      entered_at: checkedAt,
    },
  ];

  for (const payload of payloads) {
    const { error } = await supabaseServer
      .from("companion_checkins")
      .insert(payload);

    if (!error) {
      return { ok: true as const, checkedAt };
    }
  }

  return { ok: false as const };
};

export async function POST(req: Request) {
  const body = (await req.json()) as CheckInBody;
  const inviteCode = body.inviteCode?.trim() ?? "";
  const personType = body.personType ?? "main";

  if (!inviteCode) {
    return NextResponse.json(
      { error: "El código de invitación es obligatorio." },
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
      { error: "Invitación no encontrada." },
      { status: 404 },
    );
  }

  const guest = parseGuest(data as Record<string, unknown>);

  if (guest.status && guest.status !== "confirmed") {
    return NextResponse.json(
      { error: "La invitación no está confirmada." },
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
      return NextResponse.json({ error: "QR inválido." }, { status: 401 });
    }
  }

  if (personType === "companion") {
    const companionId = body.companionId?.trim();
    const sourceTable = body.sourceTable?.trim();
    const companionName = body.companionName?.trim();

    if (companionId) {
      const companionResult = await tryMarkCompanionInKnownTables(
        companionId,
        inviteCode,
        sourceTable,
      );

      if (companionResult.ok) {
        return NextResponse.json({
          message: `Ingreso registrado para ${companionName || "acompanante"}.`,
          checkedAt: companionResult.checkedAt,
        });
      }
    }

    const fallbackLogResult = await insertCompanionCheckInLog(
      inviteCode,
      companionId,
      companionName,
    );

    if (!fallbackLogResult.ok) {
      return NextResponse.json(
        {
          error:
            "No se pudo marcar el ingreso del acompanante. Verifica columnas de check-in o la tabla companion_checkins.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: `Ingreso registrado para ${companionName || "acompanante"}.`,
      checkedAt: fallbackLogResult.checkedAt,
    });
  }

  const checkInResult = await markGuestCheckIn(inviteCode);

  if (!checkInResult.ok) {
    return NextResponse.json(
      {
        error:
          "No se pudo marcar la entrada. Verifica que exista un campo de check-in en la tabla guests o una tabla guest_checkins.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Entrada marcada correctamente.",
    checkedAt: checkInResult.checkedAt,
  });
}
