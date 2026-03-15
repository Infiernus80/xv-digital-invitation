"use client";

import { useState } from "react";

import type { ConfirmationSectionProps } from "@/types/invitation";
import { InvitationQr } from "../InvitationQr/InvitationQr";

export const ConfirmationSection = ({
  inviteCode,
  qrToken,
  initialConfirmed = false,
}: ConfirmationSectionProps) => {
  const [isConfirmed, setIsConfirmed] = useState<boolean>(initialConfirmed);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConfirm = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      // Aquí después irá tu llamada real al backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsConfirmed(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Ocurrió un error al confirmar la asistencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center rounded-4xl bg-white/80 px-6 py-10 shadow-sm">
      <h2 className="text-center text-4xl font-semibold italic text-slate-600">
        Dress Code Formal
      </h2>

      <div className="mt-8 flex items-center justify-center gap-8">
        <div className="text-center text-slate-500">
          <p className="text-6xl">👗</p>
        </div>

        <div className="text-center text-slate-500">
          <p className="text-6xl">🤵</p>
        </div>
      </div>

      <p className="mt-8 text-center text-lg italic leading-8 text-slate-700">
        Por favor evitemos el color rosa en cualquier tono, lo reservaremos para
        la quinceañera.
      </p>

      {!isConfirmed ? (
        <div className="mt-8 flex w-full flex-col items-center gap-4">
          <button
            type="button"
            onClick={(): void => {
              void handleConfirm();
            }}
            disabled={isSubmitting}
            className="inline-flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-pink-400 px-6 text-xl font-semibold text-white shadow-md transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar"}
          </button>

          {errorMessage ? (
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
          ) : null}
        </div>
      ) : (
        <InvitationQr inviteCode={inviteCode} qrToken={qrToken} />
      )}

      <div className="mt-10 h-px w-full max-w-xs bg-rose-200" />
    </section>
  );
};
