import { JenisSurat, SuratStatus } from './types.js';

/**
 * Format nomor HP ke standar internasional wa.me (62xxxxxx)
 */
export function formatPhoneNumberForWa(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Membuat tautan WhatsApp untuk mengirim pesan pengantar dari warga ke RT/RW
 */
export function getWaWargaToRtLink(
  rtPhone: string,
  wargaNama: string,
  jenisSurat: JenisSurat,
  keperluan: string
): string {
  const number = formatPhoneNumberForWa(rtPhone);
  const text = `Halo Pak RT, saya *${wargaNama}* baru saja mengajukan permohonan *${jenisSurat}* (Keperluan: ${keperluan}) melalui platform *E-Warga*. Mohon bantuannya untuk melakukan verifikasi berkas pengantar saya. Terima kasih! 🙏`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Membuat tautan WhatsApp pemberitahuan status dokumen dari RT/RW ke Warga
 */
export function getWaStatusUpdateLink(
  wargaPhone: string,
  wargaNama: string,
  jenisSurat: JenisSurat,
  newStatus: SuratStatus,
  catatan?: string
): string {
  const number = formatPhoneNumberForWa(wargaPhone);
  let msg = `Halo Bung *${wargaNama}*,\n\n`;

  switch (newStatus) {
    case 'menunggu_rw':
      msg += `Pengajuan *${jenisSurat}* Anda telah *DISETUJUI* oleh Ketua RT dan kini diteruskan ke Ketua RW untuk tanda tangan lebih lanjut.`;
      break;
    case 'siap_diambil':
      msg += `Kabar baik! Dokumen pengantar *${jenisSurat}* Anda telah *DISETUJUI & SELESAI DITANDATANGANI* oleh Ketua RW.\n\nSilakan diambil di Kantor Sekretariat RW dengan menyertakan KK/KTP asli.`;
      break;
    case 'ditolak_rt':
      msg += `Pengajuan *${jenisSurat}* Anda *DITOLAK* di tingkat RT.`;
      if (catatan) msg += `\nCatatan alasan ditolak: _"${catatan}"_`;
      break;
    case 'ditolak_rw':
      msg += `Pengajuan *${jenisSurat}* Anda *DITOLAK* di tingkat RW.`;
      if (catatan) msg += `\nCatatan alasan ditolak: _"${catatan}"_`;
      break;
    case 'selesai':
      msg += `Proses pelayanan pengantar *${jenisSurat}* Anda sudah ditandai *SELESAI*. Terima kasih telah menggunakan platform digital E-Warga!`;
      break;
    default:
      msg += `Status pengajuan *${jenisSurat}* Anda saat ini telah diperbarui menjadi: *${newStatus}*.`;
  }

  msg += `\n\nPantau detail pengajuan Anda di dashboard E-Warga. Terima kasih!`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}
