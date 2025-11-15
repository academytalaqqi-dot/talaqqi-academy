export interface Speaker {
  name: string;
  title?: string;
  photo?: string;
}

export interface EventTime {
  date: string;
  startTime: string;
  endTime: string;
}

export interface EventBenefit {
  title: string;
  description?: string;
}

export interface VoucherCode {
  code: string;
  discount: number;
}

export type EventStatus = "Pendaftaran" | "Berjalan" | "Selesai";
export type RegistrationStatus = "Pending" | "Approved" | "Rejected";
export type ParticipationType = "Gratis" | "Berbayar";
export type VoucherStatus = "Aktif" | "Tidak Aktif";

export interface EventData {
  id: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: Speaker[];
  tema: string;
  waktuEvent: EventTime[];
  jenisKepesertaan: ParticipationType;
  nominalInfaq: number;
  benefit: EventBenefit[];
  kodeVoucher?: VoucherCode[];
  flyerImage?: string;
  linkGrupWa?: string;
  statusEvent: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendaftaranData {
  id: string;
  namaPendaftar: string;
  kotaDomisili: string;
  umur: number;
  noWhatsapp: string;
  eventId: string;
  jenisKepesertaan: ParticipationType;
  nominalPembayaran: number;
  kodeVoucher?: string;
  buktiTransfer?: string;
  waktuPendaftaran: Date;
  status: RegistrationStatus;
}
