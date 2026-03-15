"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import Image from "next/image";
import { InvitationQrProps, QrPayload } from "@/types/invitation";

export const InvitationQr = ({ inviteCode, qrToken }: InvitationQrProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const generateQr = async (): Promise<void> => {
      const payload: QrPayload = {
        inviteCode,
        qrToken,
      };

      const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
        width: 220,
        margin: 2,
      });

      setQrDataUrl(dataUrl);
    };

    void generateQr();
  }, [inviteCode, qrToken]);

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <h3 className="text-center text-lg font-semibold text-slate-700">
        Tu código de acceso
      </h3>

      <p className="max-w-xs text-center text-sm text-slate-500">
        Muestra este código al llegar al evento.
      </p>

      {qrDataUrl ? (
        <Image
          src={qrDataUrl}
          alt="Código QR de invitación"
          className="rounded-2xl border border-rose-200 bg-white p-3 shadow-sm"
          width={200}
          height={200}
        />
      ) : (
        <div className="flex h-55 w-55 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
          Generando QR...
        </div>
      )}

      <p className="text-sm font-semibold tracking-[0.2em] text-slate-700">
        {inviteCode}
      </p>
    </div>
  );
};
