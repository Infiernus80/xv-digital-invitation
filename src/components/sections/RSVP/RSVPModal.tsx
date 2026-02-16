"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { calculateTickets } from "@/lib/ticketUtils";

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
};

type InviteData = {
  id: string;
  alias: string;
  max_companions: number;
  status: "pending" | "confirmed" | "declined";
};

export const RSVPModal = ({
  isOpen,
  onClose,
  inviteCode = "",
}: RSVPModalProps) => {
  const [code, setCode] = useState(inviteCode);
  const [mainName, setMainName] = useState("");
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  const fetchInviteData = useCallback(async () => {
    if (!code) return;

    setLoadingInvite(true);
    setError("");

    try {
      const response = await fetch(`/api/rsvp/get-invite?code=${code}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invitación no encontrada");
      }

      const data = await response.json();
      setInviteData(data);

      if (data.status === "confirmed") {
        setError("Esta invitación ya ha sido confirmada");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al verificar invitación",
      );
      setInviteData(null);
    } finally {
      setLoadingInvite(false);
    }
  }, [code]);
  useEffect(() => {
    // Cuando llega un inviteCode desde la URL, pásalo al input interno
    if (inviteCode) {
      setCode(inviteCode);
    }
  }, [inviteCode]);

  useEffect(() => {
    if (isOpen && code) {
      fetchInviteData();
    }
  }, [isOpen, code, fetchInviteData]);

  // Calcular boletos en tiempo real
  const ticketInfo = useMemo(() => {
    const allGuests = [
      { is_child: false, child_age: null }, // Invitado principal
      ...companions.map((c) => ({
        is_child: c.is_child,
        child_age: c.child_age ?? null,
      })),
    ];
    return calculateTickets(allGuests);
  }, [companions]);

  const addCompanion = () => {
    if (inviteData && companions.length >= inviteData.max_companions) {
      setError(
        `Solo puedes agregar hasta ${inviteData.max_companions} acompañante(s)`,
      );
      return;
    }

    setCompanions([
      ...companions,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        is_child: false,
        full_name: "",
      },
    ]);
    setError("");
  };

  const removeCompanion = (id: string) => {
    setCompanions(companions.filter((c) => c.id !== id));
  };

  const updateCompanion = (id: string, updates: Partial<Companion>) => {
    setCompanions(
      companions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteData) {
      setError("Primero verifica tu código de invitación");
      return;
    }

    if (inviteData.status === "confirmed") {
      setError("Esta invitación ya ha sido confirmada");
      return;
    }

    if (!mainName.trim()) {
      setError("Debes ingresar tu nombre completo");
      return;
    }

    // Validar que todos los campos estén completos
    for (const companion of companions) {
      if (!companion.full_name.trim()) {
        setError("Todos los acompañantes deben tener nombre completo");
        return;
      }
      if (
        companion.is_child &&
        (!companion.child_age || companion.child_age < 0)
      ) {
        setError("Todos los menores de edad deben tener edad válida");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rsvp/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          main_full_name: mainName,
          companions: companions.map((c) => ({
            is_child: c.is_child,
            child_age: c.is_child ? c.child_age : undefined,
            full_name: c.full_name,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al confirmar asistencia");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!inviteCode) {
      setCode("");
    }
    setMainName("");
    setCompanions([]);
    setSuccess(false);
    setError("");
    setInviteData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 sm:p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-dancing-script text-3xl sm:text-4xl text-slate-700">
            Confirmar Asistencia
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
            type="button"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <div className="mb-2 text-4xl">✓</div>
            <p className="font-bad-script text-xl text-green-700">
              ¡Confirmación exitosa! Gracias por confirmar tu asistencia.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Código de invitación */}
            <div>
              <label
                htmlFor="code"
                className="mb-2 block font-bad-script text-lg text-slate-700"
              >
                Código de invitación
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!!inviteCode || !!inviteData}
                  required
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 disabled:bg-slate-100"
                  placeholder="Ingresa tu código"
                />
                {!inviteCode && !inviteData && (
                  <button
                    type="button"
                    onClick={fetchInviteData}
                    disabled={!code || loadingInvite}
                    className="rounded-lg bg-pink-400 px-6 text-white font-semibold transition hover:bg-pink-500 disabled:opacity-50"
                  >
                    {loadingInvite ? "..." : "Verificar"}
                  </button>
                )}
              </div>
            </div>

            {inviteData && (
              <>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="font-bad-script text-green-700">
                    ✓ Invitación verificada
                    {inviteData.max_companions > 0 && (
                      <>
                        {" "}
                        - Puedes traer hasta{" "}
                        <strong>{inviteData.max_companions}</strong>{" "}
                        acompañante(s)
                      </>
                    )}
                  </p>
                </div>

                {/* Nombre completo */}
                <div>
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
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                    placeholder="Nombre y apellidos"
                  />
                </div>

                {/* Contador de boletos */}
                <div className="rounded-lg border-2 border-pink-200 bg-pink-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bad-script text-lg text-slate-700">
                      Total de boletos:
                    </span>
                    <span className="font-bold text-2xl text-pink-600">
                      {ticketInfo.totalTickets}
                    </span>
                  </div>
                  {ticketInfo.youngChildren > 0 && (
                    <p className="mt-2 text-sm text-slate-600">
                      * Incluye {ticketInfo.youngChildren} niño(s) menor(es) de
                      12 años (2 niños = 1 boleto)
                    </p>
                  )}
                </div>

                {/* Acompañantes */}
                {inviteData.max_companions > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="font-bad-script text-lg text-slate-700">
                        Acompañantes ({companions.length}/
                        {inviteData.max_companions})
                      </label>
                      <button
                        type="button"
                        onClick={addCompanion}
                        disabled={
                          companions.length >= inviteData.max_companions
                        }
                        className="rounded-full bg-pink-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Agregar
                      </button>
                    </div>

                    <div className="space-y-4">
                      {companions.map((companion, index) => (
                        <div
                          key={companion.id}
                          className="rounded-lg border border-slate-200 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bad-script text-slate-700">
                              Acompañante {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCompanion(companion.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </div>

                          {/* Nombre completo - siempre requerido */}
                          <div>
                            <label className="mb-1 block text-sm text-slate-600">
                              Nombre completo *
                            </label>
                            <input
                              type="text"
                              value={companion.full_name}
                              onChange={(e) =>
                                updateCompanion(companion.id, {
                                  full_name: e.target.value,
                                })
                              }
                              placeholder="Nombre y apellidos"
                              required
                              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                            />
                          </div>

                          {/* Checkbox de menor de edad */}
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`child-${companion.id}`}
                              checked={companion.is_child}
                              onChange={(e) =>
                                updateCompanion(companion.id, {
                                  is_child: e.target.checked,
                                  child_age: e.target.checked
                                    ? companion.child_age
                                    : undefined,
                                })
                              }
                              className="h-5 w-5 rounded border-slate-300 text-pink-400 focus:ring-pink-400"
                            />
                            <label
                              htmlFor={`child-${companion.id}`}
                              className="text-slate-700"
                            >
                              Es menor de edad
                            </label>
                          </div>

                          {/* Edad - solo si es menor */}
                          {companion.is_child && (
                            <div>
                              <label className="mb-1 block text-sm text-slate-600">
                                Edad del menor *
                              </label>
                              <input
                                type="number"
                                value={companion.child_age || ""}
                                onChange={(e) =>
                                  updateCompanion(companion.id, {
                                    child_age:
                                      parseInt(e.target.value) || undefined,
                                  })
                                }
                                placeholder="Edad en años"
                                min="0"
                                max="17"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-center">
                    <p className="font-bad-script text-red-700">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-full border-2 border-slate-300 px-6 py-3 font-bad-script text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !inviteData}
                    className="flex-1 rounded-full bg-[#F35A7EB3] px-6 py-3 font-bad-script text-lg font-semibold text-white shadow-lg transition hover:bg-pink-400 disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Confirmar"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
