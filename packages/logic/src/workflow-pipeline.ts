import { SuratStatus, UserRole } from './types.js';

/**
 * Validasi apakah suatu role berhak mengubah status surat tertentu.
 */
export function canChangeStatus(
  currentStatus: SuratStatus,
  role: UserRole
): boolean {
  if (role === 'admin') return true;

  switch (currentStatus) {
    case 'menunggu_rt':
      return role === 'rt';
    case 'menunggu_rw':
      return role === 'rw';
    case 'siap_diambil':
      return role === 'rt' || role === 'rw' || role === 'staff_kecamatan';
    default:
      return false;
  }
}

/**
 * Mendapatkan status berikutnya setelah disetujui
 */
export function getNextStatusOnApprove(
  currentStatus: SuratStatus,
  role: UserRole
): SuratStatus {
  if (role === 'admin' || role === 'rt') {
    if (currentStatus === 'menunggu_rt') {
      return 'menunggu_rw';
    }
  }
  if (role === 'admin' || role === 'rw') {
    if (currentStatus === 'menunggu_rw') {
      return 'siap_diambil';
    }
  }
  if (currentStatus === 'siap_diambil' && (role === 'rt' || role === 'rw' || role === 'staff_kecamatan' || role === 'admin')) {
    return 'selesai';
  }
  return currentStatus;
}

/**
 * Mendapatkan status berikutnya setelah ditolak
 */
export function getNextStatusOnReject(
  currentStatus: SuratStatus,
  role: UserRole
): SuratStatus {
  if (currentStatus === 'menunggu_rt' && (role === 'rt' || role === 'admin')) {
    return 'ditolak_rt';
  }
  if (currentStatus === 'menunggu_rw' && (role === 'rw' || role === 'admin')) {
    return 'ditolak_rw';
  }
  return currentStatus;
}

/**
 * Format status ke label UI yang ramah dibaca manusia
 */
export function formatStatusLabel(status: SuratStatus): string {
  switch (status) {
    case 'menunggu_rt':
      return 'Menunggu Persetujuan RT';
    case 'ditolak_rt':
      return 'Ditolak oleh RT';
    case 'menunggu_rw':
      return 'Menunggu Persetujuan RW';
    case 'ditolak_rw':
      return 'Ditolak oleh RW';
    case 'siap_diambil':
      return 'Dokumen Siap Diambil di RW';
    case 'selesai':
      return 'Selesai / Pengantar Diterbitkan';
    default:
      return status;
  }
}

/**
 * Format status ke warna badge Tailwind
 */
export function getStatusBadgeClass(status: SuratStatus): string {
  switch (status) {
    case 'menunggu_rt':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'menunggu_rw':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'siap_diambil':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'selesai':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'ditolak_rt':
    case 'ditolak_rw':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}
