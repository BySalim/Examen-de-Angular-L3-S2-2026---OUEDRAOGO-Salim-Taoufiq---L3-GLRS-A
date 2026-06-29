export type FactureStatut = 'UNPAID' | 'PAID';

export interface Facture {
  reference: string;
  walletCode: string;
  serviceName: string;
  montant: number;
  devise: string;
  statut: FactureStatut;
  periode: string;
  dateEmission?: string;
  datePaiement?: string | null;
  libelle?: string;
}
