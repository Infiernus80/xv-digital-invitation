"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type GuestItem = {
  id?: string;
  alias?: string;
  invite_code?: string;
  status?: string;
  max_companions?: number;
  checked_in?: boolean;
  checked_in_at?: string;
};

type CompanionItem = {
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
  companions: CompanionItem[];
};

type ScannerControls = {
  stop: () => void;
};

const parseInviteCodeFromScan = (
  rawValue: string,
): { inviteCode: string; qrToken?: string } | null => {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      inviteCode?: string;
      qrToken?: string;
    };

    if (!parsed.inviteCode || parsed.inviteCode.trim().length === 0) {
      return null;
    }

    return {
      inviteCode: parsed.inviteCode.trim(),
      qrToken: parsed.qrToken?.trim() || undefined,
    };
  } catch {
    return { inviteCode: trimmed };
  }
};

export const AccessControlPanel = () => {
  const [query, setQuery] = useState<string>("");
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState<boolean>(false);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [isStartingScanner, setIsStartingScanner] = useState<boolean>(false);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [isMarkingEntry, setIsMarkingEntry] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [details, setDetails] = useState<GuestDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [scanHint, setScanHint] = useState<string>(
    "Escanea un QR o busca por código/nombre.",
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const scanLockRef = useRef<boolean>(false);

  const selectedGuest = useMemo(() => {
    return guests.find((guest) => guest.invite_code === selectedCode);
  }, [guests, selectedCode]);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    scanLockRef.current = false;
    setIsScannerActive(false);
  }, []);

  const fetchGuests = useCallback(
    async (q: string) => {
      setIsLoadingGuests(true);

      try {
        const search = q.trim();
        const res = await fetch(
          `/api/access/guests${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        );
        const data = (await res.json()) as {
          guests?: GuestItem[];
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error || "No se pudo cargar la lista.");
        }

        const list = Array.isArray(data.guests) ? data.guests : [];
        setGuests(list);

        if (
          list.length > 0 &&
          !list.some((g) => g.invite_code === selectedCode)
        ) {
          setSelectedCode(list[0].invite_code ?? "");
        }

        if (list.length === 0) {
          setSelectedCode("");
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Error cargando invitados.",
        );
      } finally {
        setIsLoadingGuests(false);
      }
    },
    [selectedCode],
  );

  const fetchGuestDetails = useCallback(async (inviteCode: string) => {
    if (!inviteCode) {
      setDetails(null);
      return;
    }

    setIsLoadingDetails(true);

    try {
      const response = await fetch(
        `/api/access/guest-details?code=${encodeURIComponent(inviteCode)}`,
      );
      const data = (await response.json()) as GuestDetails & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener el detalle RSVP.");
      }

      setDetails({
        ...data,
        companions: Array.isArray(data.companions) ? data.companions : [],
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo obtener detalle del invitado.",
      );
      setDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const markEntry = useCallback(
    async (params: {
      inviteCode: string;
      qrToken?: string;
      personType: "main" | "companion";
      companionId?: string;
      companionName?: string;
      sourceTable?: string;
    }) => {
      const {
        inviteCode,
        qrToken,
        personType,
        companionId,
        companionName,
        sourceTable,
      } = params;
      if (!inviteCode) {
        return;
      }

      setIsMarkingEntry(true);
      setErrorMessage("");
      setFeedback("");

      try {
        const res = await fetch("/api/access/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteCode,
            qrToken,
            personType,
            companionId,
            companionName,
            sourceTable,
          }),
        });

        const data = (await res.json()) as {
          message?: string;
          error?: string;
          checkedAt?: string;
        };

        if (!res.ok) {
          throw new Error(data.error || "No se pudo marcar la entrada.");
        }

        const checkedAtLabel = data.checkedAt
          ? new Date(data.checkedAt).toLocaleTimeString("es-PE", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        setFeedback(
          `${data.message || "Entrada registrada"}${checkedAtLabel ? ` (${checkedAtLabel})` : ""}.`,
        );
        setSelectedCode(inviteCode);
        await fetchGuests(query);
        await fetchGuestDetails(inviteCode);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "No se pudo marcar entrada.",
        );
      } finally {
        setIsMarkingEntry(false);
      }
    },
    [fetchGuestDetails, fetchGuests, query],
  );

  const handleScanResult = useCallback(
    async (rawValue: string) => {
      if (scanLockRef.current) {
        return;
      }

      const parsed = parseInviteCodeFromScan(rawValue);

      if (!parsed) {
        setErrorMessage(
          "QR inválido: no se pudo leer el código de invitación.",
        );
        return;
      }

      scanLockRef.current = true;
      setScanHint(`Detectado: ${parsed.inviteCode}`);
      setSelectedCode(parsed.inviteCode);
      stopScanner();
      setFeedback(
        `Código detectado: ${parsed.inviteCode}. Selecciona a quién marcar.`,
      );
      await fetchGuestDetails(parsed.inviteCode);
    },
    [fetchGuestDetails, stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    const isSecureContextAllowed =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const hasGetUserMedia =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!isSecureContextAllowed || !hasGetUserMedia) {
      setErrorMessage(
        "Este navegador no puede abrir la cámara en este contexto. Usa HTTPS en el celular o escanea desde foto.",
      );
      setScanHint("Cámara no disponible. Usa el botón de foto.");
      return;
    }

    setErrorMessage("");
    setFeedback("");
    setIsStartingScanner(true);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            const text = result.getText();
            void handleScanResult(text);
          }
        },
      );

      controlsRef.current = controls as ScannerControls;
      setIsScannerActive(true);
      setScanHint("Cámara activa. Acerca el QR al recuadro.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la cámara.",
      );
      setIsScannerActive(false);
    } finally {
      setIsStartingScanner(false);
    }
  }, [handleScanResult]);

  const handleImageScan = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      setErrorMessage("");
      setFeedback("");
      setIsStartingScanner(true);

      const objectUrl = URL.createObjectURL(file);

      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const result = await reader.decodeFromImageUrl(objectUrl);

        if (!result) {
          throw new Error("No se detecto ningun codigo QR en la imagen.");
        }

        await handleScanResult(result.getText());
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo escanear la imagen.",
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
        event.target.value = "";
        setIsStartingScanner(false);
      }
    },
    [handleScanResult],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchGuests(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchGuests, query]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (!selectedCode) {
      setDetails(null);
      return;
    }

    void fetchGuestDetails(selectedCode);
  }, [fetchGuestDetails, selectedCode]);

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#fff7ed,#f8fafc_45%,#e2e8f0)] px-4 py-6 text-slate-800 md:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-lg shadow-slate-200/80 backdrop-blur md:p-6">
          <h1 className="font-moon-time text-5xl text-rose-500">
            Control de acceso
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Busca invitados, escanea su QR y registra su ingreso.
          </p>

          <label
            className="mt-5 block text-sm font-semibold text-slate-700"
            htmlFor="search-guests"
          >
            Buscador
          </label>
          <input
            id="search-guests"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: FAM001 o Apellido"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-rose-200 transition focus:ring"
          />

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              {isLoadingGuests ? "Buscando..." : `${guests.length} resultados`}
            </span>
            <span>
              {selectedGuest?.invite_code
                ? `Seleccionado: ${selectedGuest.invite_code}`
                : "Sin selección"}
            </span>
          </div>

          <div className="mt-3 max-h-[52dvh] space-y-2 overflow-auto pr-1">
            {guests.map((guest) => {
              const code = guest.invite_code ?? "";
              const isSelected = code.length > 0 && code === selectedCode;

              return (
                <button
                  key={guest.id ?? code}
                  type="button"
                  onClick={() => setSelectedCode(code)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-rose-300 bg-rose-50"
                      : "border-slate-200 bg-white hover:border-rose-200"
                  }`}
                >
                  <p className="font-semibold text-slate-800">
                    {guest.alias || "Sin alias"}
                  </p>
                  <p className="text-xs tracking-[0.18em] text-slate-600">
                    {code || "SIN CÓDIGO"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                      RSVP: {guest.status || "sin estado"}
                    </span>
                    {guest.checked_in ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                        Ingresó
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-lg shadow-slate-200/80 backdrop-blur md:p-6">
          <h2 className="font-bad-script text-4xl text-slate-700">
            Escáner QR
          </h2>
          <p className="text-sm text-slate-600">{scanHint}</p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/90">
            <video
              ref={videoRef}
              className="h-64 w-full object-cover"
              muted
              playsInline
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!isScannerActive ? (
              <button
                type="button"
                onClick={() => {
                  void startScanner();
                }}
                disabled={isStartingScanner}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                {isStartingScanner ? "Iniciando cámara..." : "Iniciar escáner"}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Detener escáner
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStartingScanner}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
            >
              Escanear desde foto
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => {
                void handleImageScan(event);
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (selectedGuest?.invite_code) {
                  void markEntry({
                    inviteCode: selectedGuest.invite_code,
                    personType: "main",
                  });
                }
              }}
              disabled={!selectedGuest?.invite_code || isMarkingEntry}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingEntry ? "Marcando..." : "Marcar entrada manual"}
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Invitado seleccionado
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {selectedGuest?.alias || "Ninguno"}
            </p>
            <p className="text-sm tracking-[0.16em] text-slate-600">
              {selectedGuest?.invite_code || "-"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              RSVP: {selectedGuest?.status || "sin estado"}
            </p>
            <p className="text-sm text-slate-600">
              Ingreso: {selectedGuest?.checked_in ? "Registrado" : "Pendiente"}
            </p>

            <button
              type="button"
              onClick={() => {
                if (selectedGuest?.invite_code) {
                  void markEntry({
                    inviteCode: selectedGuest.invite_code,
                    personType: "main",
                  });
                }
              }}
              disabled={!selectedGuest?.invite_code || isMarkingEntry}
              className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingEntry ? "Marcando..." : "Marcar titular"}
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Acompañantes RSVP
            </p>

            {isLoadingDetails ? (
              <p className="mt-2 text-sm text-slate-500">
                Cargando acompañantes...
              </p>
            ) : null}

            {!isLoadingDetails && details?.companions?.length ? (
              <div className="mt-3 space-y-2">
                {details.companions.map((companion) => (
                  <div
                    key={companion.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {companion.full_name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {companion.is_child
                            ? `Menor${typeof companion.child_age === "number" ? ` (${companion.child_age} años)` : ""}`
                            : "Adulto"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedGuest?.invite_code) {
                            return;
                          }

                          void markEntry({
                            inviteCode: selectedGuest.invite_code,
                            personType: "companion",
                            companionId: companion.id,
                            companionName: companion.full_name,
                            sourceTable: companion.source_table,
                          });
                        }}
                        disabled={isMarkingEntry}
                        className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
                      >
                        {companion.checked_in
                          ? "Actualizar ingreso"
                          : "Marcar ingreso"}
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-600">
                      Estado: {companion.checked_in ? "Ingresó" : "Pendiente"}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoadingDetails &&
            selectedCode &&
            (!details || details.companions.length === 0) ? (
              <p className="mt-2 text-sm text-slate-500">
                No hay acompañantes registrados en RSVP para este código.
              </p>
            ) : null}
          </div>

          {feedback ? (
            <p className="mt-4 text-sm font-semibold text-emerald-700">
              {feedback}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-3 text-sm font-semibold text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
};
