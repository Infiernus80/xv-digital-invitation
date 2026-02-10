import { RSVPConfig } from "./constants";

type RSVPGuest = {
  is_child: boolean;
  child_age?: number | null;
};

/**
 * Calcula el número de boletos necesarios basándose en los invitados
 * - Adultos: 1 boleto cada uno
 * - Menores >= childTicketAgeLimit: 1 boleto cada uno
 * - Menores < childTicketAgeLimit: 2 niños = 1 boleto (redondeado hacia arriba)
 */
export function calculateTickets(guests: RSVPGuest[]): {
  totalTickets: number;
  adults: number;
  childrenAsAdults: number;
  youngChildren: number;
  childTickets: number;
} {
  let adults = 0;
  let childrenAsAdults = 0; // Niños >= 12 años
  let youngChildren = 0; // Niños < 12 años

  guests.forEach((guest) => {
    if (!guest.is_child) {
      adults++;
    } else {
      const age = guest.child_age ?? 0;
      if (age >= RSVPConfig.childTicketAgeLimit) {
        childrenAsAdults++;
      } else {
        youngChildren++;
      }
    }
  });

  // Calcular boletos de niños pequeños (2 niños = 1 boleto)
  const childTickets = Math.ceil(youngChildren / 2);

  // Total de boletos
  const totalTickets = adults + childrenAsAdults + childTickets;

  return {
    totalTickets,
    adults,
    childrenAsAdults,
    youngChildren,
    childTickets,
  };
}

/**
 * Obtiene la edad límite configurada para boletos infantiles
 */
export function getChildTicketAgeLimit(): number {
  return RSVPConfig.childTicketAgeLimit;
}
