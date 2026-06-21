export type UserRole = 'warga' | 'rt' | 'rw' | 'staff_kecamatan' | 'admin';

export interface UserProfile {
  id: string; // Auth ID from Supabase
  nama_lengkap: string;
  nik: string;
  no_kk?: string;
  alamat: string;
  rt: string; // e.g., "001"
  rw: string; // e.g., "002"
  no_wa: string; // WhatsApp number
  role: UserRole;
  status_verifikasi: 'pending' | 'verified' | 'rejected';
  provinsi?: string;
  kecamatan?: string;
  kelurahan?: string;
  kabupaten?: string;
  kampung?: string; // Kampung/Dusun/Blok/Perumahan
  created_at?: string;
  updated_at?: string;
}

export type SuratStatus =
  | 'menunggu_rt'
  | 'ditolak_rt'
  | 'menunggu_rw'
  | 'ditolak_rw'
  | 'siap_diambil'
  | 'selesai';

export type JenisSurat =
  | 'KTP Baru / Perpanjangan'
  | 'Kartu Keluarga (KK)'
  | 'Surat Keterangan Domisili'
  | 'Surat Keterangan Tidak Mampu (SKTM)'
  | 'Surat Pengantar Pindah'
  | 'Surat Kematian';

export interface SuratPengantar {
  id: string;
  warga_id: string;
  warga_nama?: string; // Loaded via join
  warga_rt?: string;
  warga_rw?: string;
  warga_no_wa?: string;
  warga_provinsi?: string;
  warga_kabupaten?: string;
  warga_kecamatan?: string;
  warga_kelurahan?: string;
  warga_kampung?: string;
  jenis_surat: JenisSurat;
  keperluan: string;
  status: SuratStatus;
  catatan_rt?: string;
  catatan_rw?: string;
  nomor_surat_rt?: string;
  nomor_surat_rw?: string;
  file_ktp?: string; // Storage URL
  file_kk?: string; // Storage URL
  created_at: string;
  updated_at: string;
}

export interface WorkflowTransitionLog {
  id: string;
  surat_id: string;
  actor_id: string;
  actor_nama: string;
  actor_role: UserRole;
  status_sebelum: SuratStatus;
  status_sesudah: SuratStatus;
  catatan?: string;
  created_at: string;
}
