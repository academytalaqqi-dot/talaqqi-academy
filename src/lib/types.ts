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
  kode: string;
  potongan: number;
  jenisPotongan: 'persen' | 'rupiah';
}

export interface ParticipationType {
  nama: string;
  harga: number;
  linkGrupWa: string;
  benefit: string[];
}

export type EventStatus = "Pendaftaran" | "Berjalan" | "Selesai";
export type RegistrationStatus = "Pending" | "Approved" | "Rejected";
export type VoucherStatus = "Aktif" | "Tidak Aktif";

export interface EventData {
  id: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: Speaker[];
  tema: string;
  waktuEvent: EventTime[];
  jenisKepesertaan: ParticipationType[];
  benefit: EventBenefit[];
  kodeVoucher?: VoucherCode[];
  flyerImage?: string;
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
  jenisKepesertaan: string;
  nominalPembayaran: number;
  kodeVoucher?: string;
  buktiTransfer?: string;
  waktuPendaftaran: Date;
  status: RegistrationStatus;
}
