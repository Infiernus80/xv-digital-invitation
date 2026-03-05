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
  const [isOpen, setIsOpen] = useState(false);
  const [showCover, setShowCover] = useState(showCoverByDefault);
  const [fadeCover, setFadeCover] = useState(false);
  const [currentInviteStatus, setCurrentInviteStatus] = useState<
    InviteStatus | undefined
  >(inviteStatus);

  useEffect(() => {
    setShowCover(showCoverByDefault);
  }, [showCoverByDefault]);

  useEffect(() => {
    setCurrentInviteStatus(inviteStatus);
  }, [inviteStatus]);

  useEffect(() => {
    if (autoOpenModal && inviteCode) {
      setIsOpen(true);
    }
  }, [autoOpenModal, inviteCode]);

  // Handler para click en el sello
  const handleSealClick = () => {
    setFadeCover(true);
    setTimeout(() => {
      setShowCover(false);
    }, 700); // Debe coincidir con la duración del fadeOut
  };

  const handleConfirmed = () => {
    setCurrentInviteStatus("confirmed");

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
        {showCover && (
          <CoverSection fadeOut={fadeCover} onSealClick={handleSealClick} />
        )}
        {!showCover && (
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
