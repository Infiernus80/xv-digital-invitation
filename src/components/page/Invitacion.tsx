"use client";

import {
  CeremonySection,
  CoverSection,
  DateSection,
  DressCodeSection,
  HeroSection,
  MessageSection,
  MusicSection,
  ParentsSection,
  ReceptionSection,
  RSVPSection,
  SponsorsSection,
} from "@/components/sections";
import { RSVPModal } from "@/components/sections/RSVP/RSVPModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type InviteStatus = "pending" | "confirmed" | "declined";

type Props = {
  inviteCode?: string;
  autoOpenModal?: boolean;
  showCoverByDefault?: boolean;
  redirectToFullOnConfirm?: boolean;
  inviteStatus?: InviteStatus;
};

export const InvitationClient = ({
  inviteCode = "",
  autoOpenModal = false,
  showCoverByDefault = true,
  redirectToFullOnConfirm = false,
  inviteStatus,
}: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCover, setShowCover] = useState<boolean>(showCoverByDefault);
  const [fadeCover, setFadeCover] = useState<boolean>(false);
  const [currentInviteStatus, setCurrentInviteStatus] = useState<
    InviteStatus | undefined
  >(inviteStatus);
  const [qrToken, setQrToken] = useState<string>("");

  useEffect(() => {
    setShowCover(showCoverByDefault);
  }, [showCoverByDefault]);

  useEffect(() => {
    setCurrentInviteStatus(inviteStatus);

    if (inviteStatus === "confirmed" && inviteCode) {
      setQrToken(`token-${inviteCode}`);
    }
  }, [inviteStatus, inviteCode]);

  useEffect(() => {
    if (autoOpenModal && inviteCode) {
      setIsOpen(true);
    }
  }, [autoOpenModal, inviteCode]);

  const handleSealClick = (): void => {
    setFadeCover(true);

    setTimeout(() => {
      setShowCover(false);
    }, 700);
  };

  const handleConfirmed = (): void => {
    setCurrentInviteStatus("confirmed");
    setQrToken(`token-${inviteCode}`);

    if (redirectToFullOnConfirm && inviteCode) {
      router.push(`/invitacion/${encodeURIComponent(inviteCode)}`);
      return;
    }

    setFadeCover(false);
    setShowCover(false);
  };

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-105 overflow-hidden">
        {showCover ? (
          <CoverSection fadeOut={fadeCover} onSealClick={handleSealClick} />
        ) : (
          <>
            <HeroSection />
            <MusicSection />
            <MessageSection />
            <DateSection />
            <SponsorsSection />
            <ParentsSection />
            <CeremonySection />
            <ReceptionSection />
            <DressCodeSection />
            <RSVPSection
              inviteCode={inviteCode}
              inviteStatus={currentInviteStatus}
              qrToken={qrToken}
              onConfirmClick={() => setIsOpen(true)}
            />
          </>
        )}
      </div>

      <RSVPModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        inviteCode={inviteCode}
        onConfirmed={handleConfirmed}
      />
    </main>
  );
};
