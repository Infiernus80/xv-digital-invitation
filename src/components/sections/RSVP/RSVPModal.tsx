"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Companion = {
  id: string;
  is_child: boolean;
  child_age?: number;
  full_name: string;
};

type RSVPModalProps = {
  isOpen: boolean;
  onClose: () => void;
  inviteCode?: string;
  onConfirmed?: () => void;
};

type InviteData = {
  id: string;
  alias: string;
  max_companions: number;
  status: "pending" | "confirmed" | "declined";
};

type Step = 1 | 2 | 3;

const createCompanion = (): Companion => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  is_child: false,
  full_name: "",
});

export const RSVPModal = ({
  isOpen,
  onClose,
  inviteCode = "",
  onConfirmed,
}: RSVPModalProps) => {
  const [step, setStep] = useState<Step>(1);

  const [code, setCode] = useState(inviteCode);
  const [mainName, setMainName] = useState("");
  const [companions, setCompanions] = useState<Companion[]>([]);

  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  // Sync code from URL

  useEffect(() => {
    if (inviteCode) setCode(inviteCode);
  }, [inviteCode]);

  const resetForm = useCallback(() => {
    setStep(1);
    if (!inviteCode) setCode("");
    setMainName("");
    setCompanions([]);
    setSuccess(false);
    setError("");
    setInviteData(null);
  }, [inviteCode]);

  const handleClose = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  const fetchInviteData = useCallback(async () => {
    if (!code.trim()) return;

    setLoadingInvite(true);
    setError("");

    try {
      const response = await fetch(
        `/api/rsvp/get-invite?code=${encodeURIComponent(code.trim())}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Invitación no encontrada");
      }

      setInviteData(data);

      if (data.status === "confirmed") {
        setError("Esta invitación ya ha sido confirmada.");
        return;
      }

      setStep(2);
    } catch (err) {
      setInviteData(null);
      setError(
        err instanceof Error ? err.message : "Error al verificar invitación",
      );
    } finally {
      setLoadingInvite(false);
    }
  }, [code]);

  // Auto-verify if modal opens with code
  useEffect(() => {
    if (!isOpen) return;
    if (inviteCode && inviteCode.trim()) {
      fetchInviteData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Acompañantes activos (solo los que tienen nombre)
  const activeCompanions = useMemo(
    () => companions.filter((c) => c.full_name.trim().length > 0),
    [companions],
  );

  // Crear slots automáticamente al entrar al paso 3
  useEffect(() => {
    if (step !== 3) return;
    if (!inviteData) return;
    if (inviteData.max_companions <= 0) return;

    // Si ya existen, no los recrees
    if (companions.length > 0) return;

    const slots = Array.from({ length: inviteData.max_companions }, () =>
      createCompanion(),
    );
    setCompanions(slots);
  }, [step, inviteData, companions.length]);

  const updateCompanion = useCallback(
    (id: string, updates: Partial<Companion>) => {
      setCompanions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [],
  );

  const clearCompanionSlot = useCallback(
    (id: string) => {
      updateCompanion(id, {
        full_name: "",
        is_child: false,
        child_age: undefined,
      });
    },
    [updateCompanion],
  );

  const validateStep = useCallback(
    (targetStep: Step): boolean => {
      setError("");

      if (targetStep >= 2) {
        if (!inviteData) {
          setError("Primero verifica tu código de invitación.");
          return false;
        }
        if (inviteData.status === "confirmed") {
          setError("Esta invitación ya ha sido confirmada.");
          return false;
        }
      }

      if (targetStep >= 3) {
        if (!mainName.trim()) {
          setError("Debes ingresar tu nombre completo.");
          return false;
        }
      }

      return true;
    },
    [inviteData, mainName],
  );

  const goNext = useCallback(() => {
    const next = (step + 1) as Step;
    if (!validateStep(next)) return;
    setStep(next);
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setError("");
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  }, []);

  const validateAll = useCallback((): boolean => {
    setError("");

    if (!inviteData) {
      setError("Primero verifica tu código de invitación.");
      return false;
    }
    if (inviteData.status === "confirmed") {
      setError("Esta invitación ya ha sido confirmada.");
      return false;
    }
    if (!mainName.trim()) {
      setError("Debes ingresar tu nombre completo.");
      return false;
    }

    for (const companion of activeCompanions) {
      if (companion.is_child) {
        if (
          companion.child_age === undefined ||
          companion.child_age === null ||
          companion.child_age < 0
        ) {
          setError("Todos los menores de edad deben tener una edad válida.");
          return false;
        }
      }
    }

    return true;
  }, [activeCompanions, inviteData, mainName]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateAll()) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/rsvp/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim(),
            main_full_name: mainName.trim(),
            companions: activeCompanions.map((c) => ({
              is_child: c.is_child,
              child_age: c.is_child ? c.child_age : undefined,
              full_name: c.full_name.trim(),
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Error al confirmar asistencia");
        }

        setSuccess(true);
        onConfirmed?.();
        setTimeout(() => {
          handleClose();
        }, 1600);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [activeCompanions, code, handleClose, mainName, onConfirmed, validateAll],
  );

  if (!isOpen) return null;

  const stepLabel =
    step === 1 ? "Código" : step === 2 ? "Tu nombre" : "Acompañantes";
  const progress = step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full";

  // Evitar mostrar el modal si la invitación ya está confirmada
  if (inviteData && inviteData.status === "confirmed") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4">
      <div className="mx-auto flex min-h-svh max-w-180 items-center justify-center">
        {/* ✅ Se ajusta al contenido, pero con tope y scroll interno */}
        <div className="w-full h-auto max-h-[92svh] sm:max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
          {/* ✅ Header fijo (no necesita sticky porque el scroll está en el body) */}
          <div className="shrink-0 border-b border-slate-100 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h2 className="font-dancing-script text-[clamp(28px,6vw,40px)] leading-none text-slate-700">
                  Confirmar asistencia
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Paso {step} de 3 · {stepLabel}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="rounded-full px-3 py-2 text-slate-400 hover:text-slate-600"
                type="button"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="h-1 w-full bg-slate-100">
              <div
                className={`h-1 ${progress} bg-pink-400 transition-all duration-300`}
              />
            </div>
          </div>

          {/* ✅ Body con scroll interno */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* ✅ Si el contenido es corto (paso 1/2), céntralo para evitar “espacio muerto” */}
            <div
              className={`min-h-full ${
                success || step === 3 ? "" : "flex items-center"
              }`}
            >
              <div className="w-full">
                {success ? (
                  <div className="rounded-2xl bg-green-50 p-6 text-center">
                    <div className="mb-2 text-4xl">✓</div>
                    <p className="font-bad-script text-xl text-green-700">
                      ¡Confirmación exitosa! Gracias por confirmar tu
                      asistencia.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* STEP 1 */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <label
                            htmlFor="code"
                            className="mb-2 block font-bad-script text-lg text-slate-700"
                          >
                            Código de invitación
                          </label>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                            <input
                              id="code"
                              type="text"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              disabled={!!inviteCode || loadingInvite}
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 disabled:bg-slate-100"
                              placeholder="Ej. H9K7V2C6"
                            />
                            <button
                              type="button"
                              onClick={fetchInviteData}
                              disabled={!code.trim() || loadingInvite}
                              className="rounded-xl bg-pink-400 px-6 py-3 font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50"
                            >
                              {loadingInvite ? "Verificando..." : "Verificar"}
                            </button>
                          </div>

                          {inviteData && inviteData.status !== "confirmed" && (
                            <div className="mt-4 rounded-xl bg-green-50 p-3">
                              <p className="text-sm text-green-700">
                                ✓ Invitación verificada
                                {inviteData.max_companions > 0 ? (
                                  <>
                                    {" "}
                                    · Puedes registrar hasta{" "}
                                    <strong>
                                      {inviteData.max_companions}
                                    </strong>{" "}
                                    acompañante(s)
                                  </>
                                ) : (
                                  <> · Sin acompañantes</>
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                          Ingresa tu código y presiona{" "}
                          <strong>Verificar</strong>. Luego continuarás con tu
                          nombre y acompañantes.
                        </div>
                      </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <label
                            htmlFor="mainName"
                            className="mb-2 block font-bad-script text-lg text-slate-700"
                          >
                            Tu nombre completo
                          </label>
                          <input
                            id="mainName"
                            type="text"
                            value={mainName}
                            onChange={(e) => setMainName(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                            placeholder="Nombre y apellidos"
                            autoComplete="name"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border-2 border-pink-200 bg-pink-50 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-bad-script text-lg text-slate-700">
                                Confirmando como:{" "}
                                <strong>{mainName || "—"}</strong>
                              </p>
                            </div>
                          </div>
                        </div>

                        {inviteData?.max_companions ? (
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <p className="font-bad-script text-lg text-slate-700">
                              Acompañantes
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Si no llevarás a alguien, deja ese espacio en
                              blanco.
                            </p>

                            <div className="mt-4 space-y-4">
                              {companions.map((c, index) => {
                                const hasName = c.full_name.trim().length > 0;

                                return (
                                  <div
                                    key={c.id}
                                    className="rounded-2xl border border-slate-200 p-4"
                                  >
                                    <p className="mb-3 font-bad-script text-slate-700">
                                      Acompañante {index + 1}
                                    </p>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                      <div className="sm:col-span-2">
                                        <label className="mb-1 block text-sm text-slate-600">
                                          Nombre completo{" "}
                                          {hasName ? (
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          ) : null}
                                        </label>
                                        <input
                                          type="text"
                                          value={c.full_name}
                                          onChange={(e) =>
                                            updateCompanion(c.id, {
                                              full_name: e.target.value,
                                            })
                                          }
                                          className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                                          placeholder="Nombre y apellidos (opcional)"
                                        />
                                      </div>

                                      <label className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={c.is_child}
                                          onChange={(e) =>
                                            updateCompanion(c.id, {
                                              is_child: e.target.checked,
                                              child_age: e.target.checked
                                                ? c.child_age
                                                : undefined,
                                            })
                                          }
                                          disabled={!hasName}
                                          className="h-5 w-5 rounded border-slate-300 text-pink-400 focus:ring-pink-400 disabled:opacity-50"
                                        />
                                        <span
                                          className={`text-slate-700 ${
                                            !hasName ? "opacity-50" : ""
                                          }`}
                                        >
                                          Es menor
                                        </span>
                                      </label>

                                      {c.is_child && hasName ? (
                                        <div>
                                          <label className="mb-1 block text-sm text-slate-600">
                                            Edad{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </label>
                                          <input
                                            type="number"
                                            value={c.child_age ?? ""}
                                            onChange={(e) =>
                                              updateCompanion(c.id, {
                                                child_age: Number.isFinite(
                                                  Number(e.target.value),
                                                )
                                                  ? Number(e.target.value)
                                                  : undefined,
                                              })
                                            }
                                            min={0}
                                            max={17}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                                            placeholder="Ej. 10"
                                            required
                                          />
                                        </div>
                                      ) : (
                                        <div className="hidden sm:block" />
                                      )}
                                    </div>

                                    {hasName && (
                                      <button
                                        type="button"
                                        onClick={() => clearCompanionSlot(c.id)}
                                        className="mt-3 text-sm font-semibold text-slate-500 hover:text-slate-700"
                                      >
                                        Dejar este espacio vacío
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            Esta invitación no permite acompañantes.
                          </div>
                        )}
                      </div>
                    )}

                    {error && (
                      <div className="rounded-2xl bg-red-50 p-4 text-center">
                        <p className="font-bad-script text-red-700">{error}</p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Footer fijo (siempre visible) */}
          {!success && (
            <div className="shrink-0 border-t border-slate-100 bg-white/95 backdrop-blur px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={step === 1 ? handleClose : goBack}
                  className="w-full rounded-full border-2 border-slate-300 px-6 py-3 font-bad-script text-lg font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-1/2"
                >
                  {step === 1 ? "Cerrar" : "Atrás"}
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={step === 1 && (loadingInvite || !inviteData)}
                    className="w-full rounded-full bg-[#F35A7EB3] px-6 py-3 font-bad-script text-lg font-semibold text-white shadow-lg transition hover:bg-pink-400 disabled:opacity-50 sm:w-1/2"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={(e) =>
                      handleSubmit(e as unknown as React.FormEvent)
                    }
                    disabled={loading || !inviteData}
                    className="w-full rounded-full bg-[#F35A7EB3] px-6 py-3 font-bad-script text-lg font-semibold text-white shadow-lg transition hover:bg-pink-400 disabled:opacity-50 sm:w-1/2"
                  >
                    {loading ? "Guardando..." : "Confirmar"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSVPModal;
