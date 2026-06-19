import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  ShieldCheck,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCcw,
  Database,
  ArrowRight,
  Info,
  Phone,
  AlertTriangle,
  FileCheck,
  Smartphone,
  Lock,
  ExternalLink,
  ChevronRight,
  Upload,
  Clock,
  LogOut,
  Sliders,
  Settings,
  Megaphone,
  Trash2,
  Edit2,
  PlusCircle,
  DollarSign,
  Fingerprint,
  Shield,
  Check,
  Search,
  Users
} from 'lucide-react';

import {
  formatStatusLabel,
  getStatusBadgeClass,
  canChangeStatus,
  getNextStatusOnApprove,
  getNextStatusOnReject,
  getWaStatusUpdateLink,
  getWaWargaToRtLink,
  UserRole,
  UserProfile,
  SuratPengantar,
  JenisSurat,
  SuratStatus
} from '@e-warga/logic';

import { getSupabase, hasSupabaseConfig } from '@e-warga/supabase';
import { compressImage } from './imageUtils.js';

// Define sponsors type
interface AdSponsor {
  id: string;
  category: 'Sponsor Warung' | 'Sponsor Kuliner' | 'Sponsor Fotokopi' | 'Lainnya';
  title: string;
  desc: string;
  waLink: string;
}

// Regional database for West Java (Provinsi Jawa Barat) formatted as Kabupaten/Kota -> Kecamatan -> Kelurahan/Desa
const REGIONAL_JABAR_DATA: Record<string, Record<string, string[]>> = {
  'Kota Bandung': {
    'Coblong': ['Dago', 'Lebak Siliwangi', 'Sekeloa', 'Sadang Serang', 'Cipaganti', 'Coblong'],
    'Sukasari': ['Sarijadi', 'Sukarasa', 'Gegerkalong', 'Isola'],
    'Lengkong': ['Burangrang', 'Cijagra', 'Malabar', 'Paledang', 'Turangga', 'Cikawao'],
    'Cibeunying Kaler': ['Cigadung', 'Cihaurgeulis', 'Neglasari', 'Sukaluyu'],
    'Buahbatu': ['Margasari', 'Cijawura', 'Jatisari', 'Sekejati'],
    'Sumur Bandung': ['Braga', 'Kebongedang', 'Merdeka', 'Babakan Ciamis'],
    'Regol': ['Ancol', 'Balonggede', 'Ciseureuh', 'Pasirluyu', 'Pungkur'],
    'Antapani': ['Antapani Wetan', 'Antapani Kulon', 'Antapani Tengah', 'Antapani Kidul']
  },
  'Kabupaten Bogor': {
    'Cibinong': ['Cibinong', 'Cirimekar', 'Harapan Jaya', 'Karadenan', 'Pabuaran', 'Nanggewer'],
    'Ciawi': ['Ciawi', 'Banjar Waru', 'Bitung Sari', 'Bojong Murni', 'Cileungsi'],
    'Babakan Madang': ['Babakan Madang', 'Sentul', 'Cijayanti', 'Kadumangu', 'Cipambuan'],
    'Jonggol': ['Jonggol', 'Singajaya', 'Sukagalih', 'Weninggalih', 'Sirnagalih'],
    'Cisarua': ['Cisarua', 'Tugu Utara', 'Tugu Selatan', 'Citeko', 'Cibeureum']
  },
  'Kota Bekasi': {
    'Bekasi Barat': ['Bintara', 'Bintara Jaya', 'Jakasampurna', 'Kota Baru', 'Kranji'],
    'Bekasi Selatan': ['Jakamulya', 'Jakasetia', 'Kayuringin Jaya', 'Marga Jaya', 'Pekayon Jaya'],
    'Bekasi Timur': ['Aren Jaya', 'Bekasi Jaya', 'Duren Jaya', 'Margahayu'],
    'Pondok Gede': ['Jatibening', 'Jatibening Baru', 'Jaticempaka', 'Jatimakmur', 'Jatiwaringin'],
    'Jatiasih': ['Jatiasih', 'Jatibening', 'Jatikramat', 'Jatiluhur', 'Jatimekar', 'Jatisari']
  },
  'Kota Depok': {
    'Beji': ['Beji', 'Beji Timur', 'Kemiri Muka', 'Pondok Cina', 'Tanah Baru', 'Kukusan'],
    'Pancoran Mas': ['Depok', 'Depok Jaya', 'Mampang', 'Pancoran Mas', 'Rangkapan Jaya'],
    'Cimanggis': ['Harjamukti', 'Curug', 'Mekarsari', 'Pasir Gunung Selatan', 'Tugu'],
    'Sawangan': ['Sawangan Baru', 'Sawangan Lama', 'Bedahan', 'Cinangka', 'Pengasinan'],
    'Sukmajaya': ['Abadijaya', 'Baktijaya', 'Cisalak', 'Mekarjaya', 'Sukmajaya', 'Tirtajaya']
  },
  'Kabupaten Garut': {
    'Garut Kota': ['Kota Kulon', 'Kota Wetan', 'Margajaya', 'Sukanegla', 'Regol', 'Paminggir'],
    'Tarogong Kidul': ['Sukagalih', 'Taratara', 'Haurpanggung', 'Jayaraga', 'Patriot'],
    'Wanaraja': ['Wanaraja', 'Sindangmekar', 'Cinunuk', 'Wanamekar', 'Wanasari'],
    'Leles': ['Leles', 'Cangkuang', 'Haruman', 'Kandit', 'Sukarame']
  },
  'Kota Cirebon': {
    'Harjamukti': ['Harjamukti', 'Kalijaga', 'Argasunya', 'Kecapi', 'Larangan'],
    'Kejaksan': ['Kejaksan', 'Kesenden', 'Sukapura', 'Kebonbaru'],
    'Kesambi': ['Kesambi', 'Karyamulya', 'Pekiringan', 'Sunyaragi', 'Drajat'],
    'Lemahwungkuk': ['Lemahwungkuk', 'Pegambiran']
  },
  'Kabupaten Bandung': {
    'Soreang': ['Soreang', 'Sekarwangi', 'Sadu', 'Pamekaran', 'Karanganyar'],
    'Baleendah': ['Baleendah', 'Jelekong', 'Andir', 'Wargamekar', 'Malakasari'],
    'Dayeuhkolot': ['Dayeuhkolot', 'Citeureup', 'Pasawahan', 'Cangkuang Kulon'],
    'Margahayu': ['Margahayu Selatan', 'Margahayu Tengah', 'Sayati', 'Sulaiman']
  },
  'Kota Tasikmalaya': {
    'Cihideung': ['Argasari', 'Cilembang', 'Nagarawangi', 'Tugujaya', 'Yudanagara'],
    'Cipedes': ['Cipedes', 'Mitrabatik', 'Panglayungan', 'Sukamanah'],
    'Indihiang': ['Indihiang', 'Panyingkiran', 'Sirnagalih', 'Sukamaju']
  },
  'Kabupaten Tasikmalaya': {
    'Singaparna': ['Singaparna', 'Cikunir', 'Ciputri', 'Sukaherang', 'Sukamulya', 'Cintaraja', 'Singasari'],
    'Ciawi': ['Ciawi', 'Gombong', 'Bugel', 'Citamba', 'Kertamukti', 'Pasirhuni', 'Pakemitan', 'Pakemitan Kidul'],
    'Taraju': ['Taraju', 'Purwaraharja', 'Deudeul', 'Pageralam', 'Banyuasih'],
    'Manonjaya': ['Manonjaya', 'Batusumur', 'Cibeuti', 'Cihaur', 'Kalimanggis', 'Margaluyu'],
    'Karangnunggal': ['Karangnunggal', 'Ciawi', 'Karangmekar', 'Sarimukti', 'Sukawangun'],
    'Padakembang': ['Padakembang', 'Cisaruni', 'Mekarjaya', 'Cilampunghilir', 'Rancapaku']
  },
  'Kota Bogor': {
    'Bogor Timur': ['Baranangsiang', 'Katulampa', 'Sindangrasa', 'Sindangsari', 'Tajur'],
    'Bogor Barat': ['Menteng', 'Balumbangjaya', 'Bubulak', 'Cilendek', 'Margajaya'],
    'Bogor Tengah': ['Babakan', 'Babakan Pasar', 'Cibogor', 'Ciomas', 'Paledang']
  },
  'Kabupaten Karawang': {
    'Karawang Barat': ['Karawang Kulon', 'Tanjungpura', 'Tanjungmekar', 'Tunggilis'],
    'Karawang Timur': ['Karawang Wetan', 'Adiarsa Timur', 'Palumbonsari', 'Kondangjaya'],
    'Cikampek': ['Cikampek Kota', 'Cikampek Pusaka', 'Cikampek Barat', 'Cikampek Timur']
  },
  'Kota Cimahi': {
    'Cimahi Utara': ['Cibabat', 'Cipageran', 'Citeureup', 'Pasirkaliki'],
    'Cimahi Tengah': ['Baros', 'Cigugur Tengah', 'Cimahi', 'Karangmekar', 'Padasuka'],
    'Cimahi Selatan': ['Cibeber', 'Cibeureum', 'Leuwigajah', 'Melong', 'Utama']
  },
  'Kabupaten Sukabumi': {
    'Cibadak': ['Cibadak', 'Pamuruyan', 'Karangtengah', 'Neglasari', 'Batununggal'],
    'Cisaat': ['Cisaat', 'Cibolang', 'Cenang', 'Sukamanah', 'Sukaresmi'],
    'Palabuhanratu': ['Palabuhanratu', 'Citepus', 'Citarik', 'Buniwangi']
  },
  'Kabupaten Purwakarta': {
    'Purwakarta': ['Purwamekar', 'Nagrikidul', 'Nagrikaler', 'Ciseureuh', 'Sindangkasih'],
    'Jatiluhur': ['Jatiluhur', 'Bunder', 'Cibinong', 'Cikaum', 'Kembangsari']
  },
  'Kabupaten Cianjur': {
    'Cianjur': ['Cianjur', 'Pamoyanan', 'Solokpandan', 'Sawah Gede', 'Boher'],
    'Cipanas': ['Cipanas', 'Cimacan', 'Sindanglaya', 'Sindangjaya']
  },
  'Kabupaten Sumedang': {
    'Sumedang Utara': ['Talun', 'Situ', 'Kotakulon', 'Kotawetan', 'Mulyasari'],
    'Jatinangor': ['Cikeruh', 'Ciseureuh', 'Hegarmanah', 'Sayang', 'Cisempur']
  },
  'Kabupaten Majalengka': {
    'Majalengka': ['Majalengka Kulon', 'Majalengka Wetan', 'Cicurug', 'Cigasong'],
    'Jatiwangi': ['Jatiwangi', 'Sutawangi', 'Jatisura', 'Loji', 'Mekarwangi']
  },
  'Kabupaten Subang': {
    'Subang': ['Subang', 'Karanganyar', 'Cigadung', 'Soklat', 'Pasirkareumbi'],
    'Kalijati': ['Kalijati Timur', 'Kalijati Barat', 'Marengmang', 'Kaliangsana']
  },
  'Kabupaten Indramayu': {
    'Indramayu': ['Indramayu', 'Karanganyar', 'Margadadi', 'Kepandean', 'Lemahmekar'],
    'Jatibarang': ['Jatibarang', 'Jatibarang Baru', 'Bulak', 'Pilangsari']
  },
  'Kabupaten Ciamis': {
    'Ciamis': ['Ciamis', 'Maleber', 'Sindangrasa', 'Kertasari', 'Benteng'],
    'Kawali': ['Kawali', 'Kawalimukti', 'Winduraja', 'Talagasari']
  },
  'Kabupaten Kuningan': {
    'Kuningan': ['Kuningan', 'Cijoho', 'Winduhaji', 'Ancaran', 'Purwawinangun'],
    'Ciawigebang': ['Ciawigebang', 'Cipicung', 'Sidaraja', 'Kadatuan']
  },
  'Kabupaten Pangandaran': {
    'Pangandaran': ['Pangandaran', 'Pananjung', 'Babakan', 'Sukahurip'],
    'Parigi': ['Parigi', 'Karangjaladri', 'Selasari', 'Ciliang']
  },
  'Kota Banjar': {
    'Pataruman': ['Pataruman', 'Hegarmanah', 'Karyamukti', 'Mulyasari'],
    'Banjar': ['Banjar', 'Balokang', 'Situbatu', 'Jatireja']
  }
};

// Define initial demo profile database including Super Admin
const INITIAL_PROFILES_DEMO: UserProfile[] = [
  {
    id: 'warga-test-id',
    nama_lengkap: 'Budi Santoso',
    nik: '3171012304910002',
    no_kk: '3171011212080015',
    alamat: 'Jl. Kancil No. 24, RT 003 / RW 004',
    rt: '003',
    rw: '004',
    no_wa: '081234567890',
    role: 'warga',
    status_verifikasi: 'verified'
  },
  {
    id: 'rt-test-id',
    nama_lengkap: 'Haji Slamet (Pak RT)',
    nik: '3171010305800003',
    no_kk: '3171011505050012',
    alamat: 'Jl. Kancil No. 1, RT 003 / RW 004',
    rt: '003',
    rw: '004',
    no_wa: '085711112222',
    role: 'rt',
    status_verifikasi: 'verified'
  },
  {
    id: 'rw-test-id',
    nama_lengkap: 'Pak Bambang (Pak RW)',
    nik: '3171010101700001',
    no_kk: '3171010210020008',
    alamat: 'Jl. Elang Raya No. 10, RW 004',
    rt: '000',
    rw: '004',
    no_wa: '089988887777',
    role: 'rw',
    status_verifikasi: 'verified'
  },
  {
    id: 'admin-test-id',
    nama_lengkap: 'Ardi Blokchine (Super Admin)',
    nik: '3171999901010001',
    no_kk: '3171999901010002',
    alamat: 'Kantor Kelurahan E-Warga Utama, RW 004',
    rt: '000',
    rw: '004',
    no_wa: '081122334455',
    role: 'admin',
    status_verifikasi: 'verified'
  }
];

const INITIAL_SURAT_DEMO: SuratPengantar[] = [
  {
    id: 'surat-1',
    warga_id: 'warga-test-id',
    warga_nama: 'Budi Santoso',
    warga_rt: '003',
    warga_rw: '004',
    warga_no_wa: '081234567890',
    jenis_surat: 'KTP Baru / Perpanjangan',
    keperluan: 'Perpanjangan KTP karena masa berlaku habis & rusak fisik',
    status: 'menunggu_rt',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'surat-2',
    warga_id: 'warga-test-id',
    warga_nama: 'Budi Santoso',
    warga_rt: '003',
    warga_rw: '004',
    warga_no_wa: '081234567890',
    jenis_surat: 'Kartu Keluarga (KK)',
    keperluan: 'Penambahan anggota keluarga baru (anak ketiga)',
    status: 'siap_diambil',
    nomor_surat_rt: 'PM/045/RT-03/VI/2026',
    nomor_surat_rw: 'PM-K/099/RW-04/VI/2026',
    catatan_rt: 'Formulir KK harus dicetak lengkap',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'dev_console' | 'registration_portal'>('simulation');
  const [currentRole, setCurrentRole] = useState<UserRole>('warga');
  
  // Registration and verified warga management states
  const [activeRegTab, setActiveRegTab] = useState<'register' | 'manage'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [registerForm, setRegisterForm] = useState({
    nama_lengkap: '',
    nik: '',
    no_kk: '',
    alamat: '',
    rt: '001',
    rw: '004',
    no_wa: '',
    role: 'warga' as UserRole,
    file_ktp: '',
    file_kk: '',
    ktpSize: 0,
    kkSize: 0,
    kecamatan: 'Coblong',
    kelurahan: 'Dago',
    kabupaten: 'Kota Bandung',
    kampung: ''
  });

  // Database Configuration status
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [dbConfig, setDbConfig] = useState({
    url: localStorage.getItem('E_WARGA_SUPABASE_URL') || '',
    anonKey: localStorage.getItem('E_WARGA_SUPABASE_ANON_KEY') || '',
    connString: localStorage.getItem('E_WARGA_POSTGRES_CONN') || ''
  });

  // State arrays (uses local Storage fallback/mock engine for immediate playability)
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [suratList, setSuratList] = useState<SuratPengantar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- CHAT INTER-KAMPUNG & EMERGENCIES (SIAGA DARURAT) ---
  const [panicActive, setPanicActive] = useState<boolean>(false);
  const [panicWarga, setPanicWarga] = useState<string>('Budi Santoso');
  const [gatesStatus, setGatesStatus] = useState({
    gate03: false, // false = TERBUKA, true = DIBLOKIR 🚧
    gate04: false,
    gateUtama: false
  });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Budi Santoso (Warga RT 03)', role: 'warga', message: 'Maling motor matic hitam kabur ke arah gerbang luar! Woy tolong dihadang beda kampung!', time: '02:40' },
    { id: 2, sender: 'Pak RT Haji Slamet', role: 'rt', message: 'Ronda RT 03 sudah siaga bawa senter! Warga RT 04 mohon langsung blokir akses gapura utara sekarang!', time: '02:41' },
    { id: 3, sender: 'Pak RW Bambang', role: 'rw', message: 'Instruksi diterima, portal utama RW 04 segera dipalang brikade! Linmas tolong merapat!', time: '02:42' }
  ]);
  const [newChatText, setNewChatText] = useState<string>('');

  // --- SPONSOR RUNNING TEXT ADS STATE ---
  const [sponsors, setSponsors] = useState<AdSponsor[]>(() => {
    const cached = localStorage.getItem('E_WARGA_SPONSORS_ADS');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to defaults
      }
    }
    return [
      { id: '1', category: 'Sponsor Warung', title: 'Toko Kelontong Bu Minah RT 03', desc: 'Sembako murah & Isi ulang gallon higienis antar gratis! Hub wa.me/0812345678', waLink: '0812345678' },
      { id: '2', category: 'Sponsor Kuliner', title: 'Warung Sate Mas Slamet RW 04', desc: 'Sate kambing bumbu kecap meresap maknyus, diskon 11% pakai PWA E-Warga! Hub wa.me/0812345679', waLink: '0812345679' },
      { id: '3', category: 'Sponsor Fotokopi', title: 'Fotokopi Berkah Abadi', desc: 'Cetak berkas pengantar RTRW diskon khusus warga RT 03/RW04! Hub wa.me/0812345670', waLink: '0812345670' }
    ];
  });

  const [newSponsorForm, setNewSponsorForm] = useState<{
    category: 'Sponsor Warung' | 'Sponsor Kuliner' | 'Sponsor Fotokopi' | 'Lainnya';
    title: string;
    desc: string;
    waLink: string;
  }>({
    category: 'Sponsor Warung',
    title: '',
    desc: '',
    waLink: ''
  });

  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);

  // Helper to save sponsors to local storage
  const saveSponsorsState = (updatedSponsors: AdSponsor[]) => {
    setSponsors(updatedSponsors);
    localStorage.setItem('E_WARGA_SPONSORS_ADS', JSON.stringify(updatedSponsors));
  };

  const handleAddOrUpdateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorForm.title.trim() || !newSponsorForm.desc.trim()) {
      triggerFeedback('error', 'Nama sponsor dan deskripsi wajib diisi!');
      return;
    }

    if (editingSponsorId) {
      const updatedSponsors = sponsors.map(s => s.id === editingSponsorId ? {
        ...s,
        category: newSponsorForm.category,
        title: newSponsorForm.title.trim(),
        desc: newSponsorForm.desc.trim(),
        waLink: newSponsorForm.waLink.trim()
      } : s);
      saveSponsorsState(updatedSponsors);
      setEditingSponsorId(null);
      triggerFeedback('success', `Berhasil mendaur ulang / update data Sponsor: ${newSponsorForm.title}`);
    } else {
      const newAd: AdSponsor = {
        id: 'ad-' + Date.now(),
        category: newSponsorForm.category,
        title: newSponsorForm.title.trim(),
        desc: newSponsorForm.desc.trim(),
        waLink: newSponsorForm.waLink.trim()
      };
      const updatedSponsors = [...sponsors, newAd];
      saveSponsorsState(updatedSponsors);
      triggerFeedback('success', `Berhasil memasukkan sponsor baru: ${newAd.title} | Slot iklan ditayangkan!`);
    }

    // Reset Form
    setNewSponsorForm({
      category: 'Sponsor Warung',
      title: '',
      desc: '',
      waLink: ''
    });
  };

  const handleDeleteSponsor = (id: string) => {
    const sName = sponsors.find(s => s.id === id)?.title || 'Sponsor';
    const updated = sponsors.filter(s => s.id !== id);
    saveSponsorsState(updated);
    triggerFeedback('success', `Sponsor "${sName}" berhasil dihentikan tayang & dihapus dari slot.`);
  };

  const handleEditSponsor = (ad: AdSponsor) => {
    setEditingSponsorId(ad.id);
    setNewSponsorForm({
      category: ad.category,
      title: ad.title,
      desc: ad.desc,
      waLink: ad.waLink
    });
    triggerFeedback('success', `Sedang mengedit sponsor: ${ad.title}`);
  };

  const handleToggleGate = (gate: 'gate03' | 'gate04' | 'gateUtama') => {
    setGatesStatus(prev => ({ ...prev, [gate]: !prev[gate] }));
    const targetName = gate === 'gate03' ? 'Portal Gapura RT 03' : gate === 'gate04' ? 'Portal Gapura RT 04' : 'Akses Blokade Jalan Utama';
    const statusText = !gatesStatus[gate] ? 'DIBLOKIR 🚧' : 'DIBUAT TERBUKA 🔓';
    const currentProfile = profiles.find((p) => p.role === currentRole) || INITIAL_PROFILES_DEMO[0];
    
    // Add coordination chat notification
    const systemMsg = {
      id: Date.now(),
      sender: `📢 SYSTEM (${currentProfile.nama_lengkap})`,
      role: currentRole,
      message: `${targetName} berhasil ${statusText}! Koordinasi siaga tetap aktif.`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, systemMsg]);
    triggerFeedback('success', `${targetName} kini ${statusText}`);
  };

  const handleTriggerPanic = () => {
    const currentProfile = profiles.find((p) => p.role === currentRole) || INITIAL_PROFILES_DEMO[0];
    setPanicActive(true);
    setPanicWarga(currentProfile.nama_lengkap);
    
    // Post high alert text to chat
    const alertMsg = {
      id: Date.now(),
      sender: `🚨 EMERGENCY ALARM (${currentProfile.nama_lengkap})`,
      role: 'warga',
      message: `TOLONG! Ada maling berkeliaran atau mencurigakan di wilayah RT ${currentProfile.rt}! Segera siagakan warga kampung sebelah dan blokir akses jalan keluar masuk!`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, alertMsg]);
    triggerFeedback('error', '⚠️ ALARM DARURAT AKTIF! Sirene visual berputar! Notifikasi darurat lari ke room rt/rw.');
  };

  const handleDeactivatePanic = () => {
    setPanicActive(false);
    const currentProfile = profiles.find((p) => p.role === currentRole) || INITIAL_PROFILES_DEMO[0];
    const clearMsg = {
      id: Date.now(),
      sender: `✅ SECURE CLEAR (${currentProfile.nama_lengkap})`,
      role: currentRole,
      message: `Keadaan kondusif & aman kembali. Alarm darurat dinonaktifkan. Terima kasih atas kesiapsiagaan seluruh RT/RW!`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, clearMsg]);
    triggerFeedback('success', 'Status aman diaktifkan kembali. Sirene darurat dinonaktifkan.');
  };

  const handleSendSiagaChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const currentProfile = profiles.find((p) => p.role === currentRole) || INITIAL_PROFILES_DEMO[0];
    const textLower = newChatText.toLowerCase();
    
    let updatedGates = { ...gatesStatus };
    let note = "";

    // Intelligent word auto-detect
    if (textLower.includes('tutup rt 03') || textLower.includes('blokir rt 03')) {
      updatedGates.gate03 = true;
      note = " (Sinyal AI: Portal RT 03 Otomatis Ditutup! 🚧)";
    } else if (textLower.includes('buka rt 03')) {
      updatedGates.gate03 = false;
      note = " (Sinyal AI: Portal RT 03 Otomatis Dibuka! 🔓)";
    }

    if (textLower.includes('tutup rt 04') || textLower.includes('blokir rt 04')) {
      updatedGates.gate04 = true;
      note = " (Sinyal AI: Portal RT 04 Otomatis Ditutup! 🚧)";
    } else if (textLower.includes('buka rt 04')) {
      updatedGates.gate04 = false;
      note = " (Sinyal AI: Portal RT 04 Otomatis Dibuka! 🔓)";
    }

    if (textLower.includes('tutup jalan') || textLower.includes('blokir jalan')) {
      updatedGates.gateUtama = true;
      note = " (Sinyal AI: Blokade Jalan utama diaktifkan! 🚧)";
    } else if (textLower.includes('buka jalan')) {
      updatedGates.gateUtama = false;
      note = " (Sinyal AI: Blokade Jalan utama dibersihkan! 🔓)";
    }

    if (note) {
      setGatesStatus(updatedGates);
    }

    const newMsg = {
      id: Date.now(),
      sender: `${currentProfile.nama_lengkap} (${currentProfile.role.toUpperCase()})`,
      role: currentRole,
      message: newChatText.trim() + note,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setNewChatText('');
  };

  // New Submission Form
  const [newSuratForm, setNewSuratForm] = useState<{
    jenis_surat: JenisSurat;
    keperluan: string;
    file_ktp: string;
    file_kk: string;
    ktpSize: number;
    kkSize: number;
  }>({
    jenis_surat: 'KTP Baru / Perpanjangan',
    keperluan: '',
    file_ktp: '',
    file_kk: '',
    ktpSize: 0,
    kkSize: 0
  });

  // Fetch real data from Supabase if connected
  const fetchFromSupabase = async () => {
    if (!hasSupabaseConfig()) return;
    setLoading(true);
    try {
      const supabase = getSupabase();
      
      // 1. Fetch real profiles ordered by creation
      const { data: dbProfiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) {
        console.error('Error fetching profiles from Supabase:', pError);
      } else if (dbProfiles && dbProfiles.length > 0) {
        const mappedProfiles = dbProfiles.map((p: any) => ({
          id: p.id,
          nama_lengkap: p.nama_lengkap,
          nik: p.nik || '',
          no_kk: p.no_kk || '',
          alamat: p.alamat || '',
          rt: p.rt || '001',
          rw: p.rw || '004',
          no_wa: p.no_wa || '',
          role: (p.role || 'warga') as UserRole,
          status_verifikasi: p.status_verifikasi || 'pending',
          kabupaten: p.kabupaten || 'Kota Bandung',
          kecamatan: p.kecamatan || 'Coblong',
          kelurahan: p.kelurahan || 'Dago',
          kampung: p.kampung || ''
        }));
        setProfiles(mappedProfiles);
        localStorage.setItem('E_WARGA_MOCK_PROFILES', JSON.stringify(mappedProfiles));
      }

      // 2. Fetch submissions joined with profiles
      const { data: dbSubmissions, error: sError } = await supabase
        .from('surat_pengantar')
        .select('*, profiles(nama_lengkap, rt, rw, no_wa)')
        .order('created_at', { ascending: false });

      if (sError) {
        console.error('Error fetching submissions from Supabase:', sError);
      } else if (dbSubmissions) {
        const mappedSubmissions = dbSubmissions.map((s: any) => ({
          id: s.id,
          warga_id: s.warga_id,
          warga_nama: s.profiles?.nama_lengkap || 'Warga Anonim',
          warga_rt: s.profiles?.rt || '001',
          warga_rw: s.profiles?.rw || '001',
          warga_no_wa: s.profiles?.no_wa || '',
          jenis_surat: s.jenis_surat,
          keperluan: s.keperluan,
          status: s.status,
          catatan_rt: s.catatan_rt || '',
          catatan_rw: s.catatan_rw || '',
          nomor_surat_rt: s.nomor_surat_rt || '',
          nomor_surat_rw: s.nomor_surat_rw || '',
          file_ktp: s.file_ktp || '',
          file_kk: s.file_kk || '',
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
        setSuratList(mappedSubmissions);
        localStorage.setItem('E_WARGA_MOCK_SURAT', JSON.stringify(mappedSubmissions));
      }
    } catch (err: any) {
      console.error('Gagal sinkronisasi data dari Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load state
  useEffect(() => {
    const isConnected = hasSupabaseConfig();
    setSupabaseConnected(isConnected);

    // Initial cache-load
    const cachedProfiles = localStorage.getItem('E_WARGA_MOCK_PROFILES');
    const cachedSurat = localStorage.getItem('E_WARGA_MOCK_SURAT');

    if (cachedProfiles) {
      setProfiles(JSON.parse(cachedProfiles));
    } else {
      setProfiles(INITIAL_PROFILES_DEMO);
      localStorage.setItem('E_WARGA_MOCK_PROFILES', JSON.stringify(INITIAL_PROFILES_DEMO));
    }

    if (cachedSurat) {
      setSuratList(JSON.parse(cachedSurat));
    } else {
      setSuratList(INITIAL_SURAT_DEMO);
      localStorage.setItem('E_WARGA_MOCK_SURAT', JSON.stringify(INITIAL_SURAT_DEMO));
    }

    // Try live load
    if (isConnected) {
      fetchFromSupabase();
    }
  }, []);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  // Safe save config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('E_WARGA_SUPABASE_URL', dbConfig.url.trim());
      localStorage.setItem('E_WARGA_SUPABASE_ANON_KEY', dbConfig.anonKey.trim());
      localStorage.setItem('E_WARGA_POSTGRES_CONN', dbConfig.connString.trim());
      
      const configured = !!(dbConfig.url.trim() && dbConfig.anonKey.trim());
      setSupabaseConnected(configured);
      
      if (configured) {
        // Trigger live refresh in override
        (window as any).__SUPABASE_URL_OVERRIDE__ = dbConfig.url.trim();
        (window as any).__SUPABASE_ANON_KEY_OVERRIDE__ = dbConfig.anonKey.trim();
        triggerFeedback('success', 'Konfigurasi Supabase Client disimpan! Mensinkronkan data...');
        // Force evaluation bypass
        setTimeout(() => {
          fetchFromSupabase();
        }, 300);
      } else {
        triggerFeedback('success', 'Konfigurasi dibersihkan. Aplikasi akan berjalan pada Demo Sandbox!');
      }
    } catch (err: any) {
      triggerFeedback('error', 'Gagal menyimpan konfigurasi: ' + err.message);
    }
  };

  // Run Supabase Postgres Migration endpoint execution
  const runDbMigration = async () => {
    if (!dbConfig.connString.trim()) {
      triggerFeedback('error', 'Silakan isi postgres URI connection string terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/db-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: dbConfig.connString.trim() })
      });
      const data = await response.json();
      if (data.status === 'ok') {
        triggerFeedback('success', 'Sukses! Migrasi berhasil dijalankan. Struktur tabel, trigger, dan kebijakan RLS di Supabase Anda kini aktif!');
      } else {
        triggerFeedback('error', 'Migrasi Gagal: ' + data.error);
      }
    } catch (err: any) {
      triggerFeedback('error', 'Koneksi error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Warga submits new request
  const handleCreateSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuratForm.keperluan.trim()) {
      triggerFeedback('error', 'Keperluan surat wajib diisi!');
      return;
    }

    const wargaUser = profiles.find((p) => p.role === 'warga') || INITIAL_PROFILES_DEMO[0];

    const newSurat: SuratPengantar = {
      id: 'surat-' + Date.now(),
      warga_id: wargaUser.id,
      warga_nama: wargaUser.nama_lengkap,
      warga_rt: wargaUser.rt,
      warga_rw: wargaUser.rw,
      warga_no_wa: wargaUser.no_wa,
      jenis_surat: newSuratForm.jenis_surat,
      keperluan: newSuratForm.keperluan,
      status: 'menunggu_rt',
      file_ktp: newSuratForm.file_ktp,
      file_kk: newSuratForm.file_kk,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save locally
    const updated = [newSurat, ...suratList];
    setSuratList(updated);
    localStorage.setItem('E_WARGA_MOCK_SURAT', JSON.stringify(updated));

    // Submit live to Supabase if connected
    if (hasSupabaseConfig()) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wargaUser.id);
      
      if (!isUuid) {
        triggerFeedback('error', 'Waduh bro! Sinyal Supabase aktif, tapi Akun Warga saat ini masih profil demo (bukan UUID asli). Daftarkan warga baru di "Pendaftaran Mandiri Warga" terlebih dahulu ya untuk tes live!');
        return;
      }

      setLoading(true);
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('surat_pengantar')
          .insert([{
            warga_id: wargaUser.id,
            jenis_surat: newSurat.jenis_surat,
            keperluan: newSurat.keperluan,
            status: 'menunggu_rt',
            file_ktp: newSurat.file_ktp,
            file_kk: newSurat.file_kk
          }]);

        if (error) {
          triggerFeedback('error', 'Gagal menyimpan surat ke Supabase: ' + error.message);
        } else {
          triggerFeedback('success', 'Keren bro! Pengajuan disimpan ke Supabase & RLS diaktifkan gratis otomatis!');
          await fetchFromSupabase();
        }
      } catch (err: any) {
        triggerFeedback('error', 'Exception Supabase: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      triggerFeedback('success', 'Pengajuan surat pengantar berhasil di-submit (Sandbox Mode)! Menunggu persetujuan RT.');
    }

    // Reset Form
    setNewSuratForm({
      jenis_surat: 'KTP Baru / Perpanjangan',
      keperluan: '',
      file_ktp: '',
      file_kk: '',
      ktpSize: 0,
      kkSize: 0
    });
  };

  // Image upload handling with automatic compression
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'kk') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const originalSizeKb = Math.round(file.size / 1024);
      // Compress
      const compressedDataUrl = await compressImage(file, 800, 0.6);
      
      // Calculate approximate size of base64
      const compressedSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

      setNewSuratForm((prev) => ({
        ...prev,
        [type === 'ktp' ? 'file_ktp' : 'file_kk']: compressedDataUrl,
        [type === 'ktp' ? 'ktpSize' : 'kkSize']: compressedSizeKb
      }));

    } catch (err: any) {
      triggerFeedback('error', 'Kompresi file gagal: ' + err.message);
    }
  };

  // Approve operation (Worthy for RT / RW)
  const handleApprove = async (suratId: string, customDocNo?: string, comment?: string) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(suratId);

    const sTarget = suratList.find(s => s.id === suratId);
    if (!sTarget) return;
    const nextStatus = getNextStatusOnApprove(sTarget.status, currentRole);

    const updated = suratList.map((s) => {
      if (s.id === suratId) {
        return {
          ...s,
          status: nextStatus,
          nomor_surat_rt: currentRole === 'rt' ? customDocNo || `PM/${Math.floor(Math.random() * 100)}/RT-${s.warga_rt}/VI/2026` : s.nomor_surat_rt,
          nomor_surat_rw: currentRole === 'rw' ? customDocNo || `PM-K/${Math.floor(Math.random() * 100)}/RW-${s.warga_rw}/VI/2026` : s.nomor_surat_rw,
          catatan_rt: currentRole === 'rt' && comment ? comment : s.catatan_rt,
          catatan_rw: currentRole === 'rw' && comment ? comment : s.catatan_rw,
          updated_at: new Date().toISOString()
        };
      }
      return s;
    });

    setSuratList(updated);
    localStorage.setItem('E_WARGA_MOCK_SURAT', JSON.stringify(updated));

    if (hasSupabaseConfig() && isUuid) {
      setLoading(true);
      try {
        const supabase = getSupabase();
        const updateObj: any = {
          status: nextStatus,
          updated_at: new Date().toISOString()
        };

        if (currentRole === 'rt') {
          updateObj.nomor_surat_rt = customDocNo || `PM/${Math.floor(Math.random() * 100)}/RT-${sTarget.warga_rt}/VI/2026`;
          if (comment) updateObj.catatan_rt = comment;
        } else if (currentRole === 'rw') {
          updateObj.nomor_surat_rw = customDocNo || `PM-K/${Math.floor(Math.random() * 100)}/RW-${sTarget.warga_rw}/VI/2026`;
          if (comment) updateObj.catatan_rw = comment;
        }

        const { error } = await supabase
          .from('surat_pengantar')
          .update(updateObj)
          .eq('id', suratId);

        if (error) {
          triggerFeedback('error', 'Gagal mensinkronisasikan persetujuan ke Supabase: ' + error.message);
        } else {
          triggerFeedback('success', `Mantap! Nomor surat & status ${nextStatus.toUpperCase()} ter-update langsung di live Supabase!`);
          await fetchFromSupabase();
        }
      } catch (err: any) {
        triggerFeedback('error', 'Exception persetujuan: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      triggerFeedback('success', `Dokumen berhasil disetujui & dialihkan oleh ${currentRole.toUpperCase()} (Sandbox Mode)!`);
    }
  };

  // Reject operation (RT / RW)
  const handleReject = async (suratId: string, comment: string) => {
    if (!comment) {
      triggerFeedback('error', 'Alasan penolakan / catatan wajib diisi jika menolak!');
      return;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(suratId);
    const sTarget = suratList.find(s => s.id === suratId);
    if (!sTarget) return;
    const nextStatus = getNextStatusOnReject(sTarget.status, currentRole);

    const updated = suratList.map((s) => {
      if (s.id === suratId) {
        return {
          ...s,
          status: nextStatus,
          catatan_rt: currentRole === 'rt' ? comment : s.catatan_rt,
          catatan_rw: currentRole === 'rw' ? comment : s.catatan_rw,
          updated_at: new Date().toISOString()
        };
      }
      return s;
    });

    setSuratList(updated);
    localStorage.setItem('E_WARGA_MOCK_SURAT', JSON.stringify(updated));

    if (hasSupabaseConfig() && isUuid) {
      setLoading(true);
      try {
        const supabase = getSupabase();
        const updateObj: any = {
          status: nextStatus,
          updated_at: new Date().toISOString()
        };

        if (currentRole === 'rt') {
          updateObj.catatan_rt = comment;
        } else if (currentRole === 'rw') {
          updateObj.catatan_rw = comment;
        }

        const { error } = await supabase
          .from('surat_pengantar')
          .update(updateObj)
          .eq('id', suratId);

        if (error) {
          triggerFeedback('error', 'Gagal menyimpan penolakan ke Supabase: ' + error.message);
        } else {
          triggerFeedback('success', `Dokumen ditolak & status dialihkan di live Supabase!`);
          await fetchFromSupabase();
        }
      } catch (err: any) {
        triggerFeedback('error', 'Exception penolakan: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      triggerFeedback('success', `Pengajuan berhasil didokumentasikan sebagai ditolak oleh ${currentRole.toUpperCase()} (Sandbox Mode)`);
    }
  };

  // Reset simulator
  const handleResetSandbox = () => {
    localStorage.removeItem('E_WARGA_MOCK_PROFILES');
    localStorage.removeItem('E_WARGA_MOCK_SURAT');
    setProfiles(INITIAL_PROFILES_DEMO);
    setSuratList(INITIAL_SURAT_DEMO);
    triggerFeedback('success', 'Sandbox simulasi berhasil di-reset ke kondisi awal!');

    if (hasSupabaseConfig()) {
      fetchFromSupabase();
    }
  };

  // Registration Portal custom helper functions (E-Warga System Integration)
  const handleKabupatenChange = (kab: string) => {
    const listKec = Object.keys(REGIONAL_JABAR_DATA[kab] || {});
    const firstKec = listKec[0] || '';
    const listKel = REGIONAL_JABAR_DATA[kab]?.[firstKec] || [];
    setRegisterForm(prev => ({
      ...prev,
      kabupaten: kab,
      kecamatan: firstKec,
      kelurahan: listKel[0] || ''
    }));
  };

  const handleKecamatanChange = (kec: string) => {
    const activeKab = registerForm.kabupaten || 'Kota Bandung';
    const listKelurahan = REGIONAL_JABAR_DATA[activeKab]?.[kec] || [];
    setRegisterForm(prev => ({
      ...prev,
      kecamatan: kec,
      kelurahan: listKelurahan[0] || ''
    }));
  };

  const handleRegFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'kk') => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file, 800, 0.6);
      const compressedSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setRegisterForm(prev => ({
        ...prev,
        [type === 'ktp' ? 'file_ktp' : 'file_kk']: compressedDataUrl,
        [type === 'ktp' ? 'ktpSize' : 'kkSize']: compressedSizeKb
      }));
      triggerFeedback('success', `Bagus! File ${type.toUpperCase()} dikompresi gratis otomatis oleh E-Warga Engine menjadi ${compressedSizeKb}KB!`);
    } catch (err: any) {
      triggerFeedback('error', 'Kompresi file registrasi gagal: ' + err.message);
    }
  };

  const handleRegisterWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.nama_lengkap.trim() || !registerForm.nik.trim()) {
      triggerFeedback('error', 'Waduh bro, Nama lengkap dan NIK wajib diisi lengkap ya!');
      return;
    }
    if (registerForm.nik.length !== 16) {
      triggerFeedback('error', 'Error: Format NIK harus tepat 16 digit angka, coba cek lagi bro!');
      return;
    }
    if (profiles.some(p => p.nik === registerForm.nik.trim())) {
      triggerFeedback('error', 'NIK tersebut sudah pernah terdaftar di database E-Warga!');
      return;
    }

    const compiledAddress = registerForm.alamat.trim() || 
      `${registerForm.kampung ? registerForm.kampung.trim() + ', ' : ''}Kel. ${registerForm.kelurahan}, Kec. ${registerForm.kecamatan}, ${registerForm.kabupaten}`;

    const newProfile: UserProfile = {
      id: 'warga-' + Date.now(),
      nama_lengkap: registerForm.nama_lengkap.trim(),
      nik: registerForm.nik.trim(),
      no_kk: registerForm.no_kk.trim() || undefined,
      alamat: compiledAddress,
      rt: registerForm.rt,
      rw: registerForm.rw,
      no_wa: registerForm.no_wa.trim() || '08123456789',
      role: registerForm.role,
      status_verifikasi: 'pending',
      kecamatan: registerForm.kecamatan,
      kelurahan: registerForm.kelurahan,
      kabupaten: registerForm.kabupaten,
      kampung: registerForm.kampung.trim()
    };

    // Save locally
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('E_WARGA_MOCK_PROFILES', JSON.stringify(updated));

    // Live Sync with Supabase if connected
    if (hasSupabaseConfig()) {
      setLoading(true);
      try {
        const supabase = getSupabase();
        const mockEmail = `${registerForm.nik}@ewarga.id`;
        const mockPassword = `Pass-${registerForm.nik}#`;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: mockEmail,
          password: mockPassword,
          options: {
            data: {
              nama_lengkap: registerForm.nama_lengkap.trim(),
              nik: registerForm.nik.trim(),
              no_kk: registerForm.no_kk.trim(),
              alamat: compiledAddress,
              rt: registerForm.rt,
              rw: registerForm.rw,
              no_wa: registerForm.no_wa.trim() || '08123456789',
              role: registerForm.role,
              kabupaten: registerForm.kabupaten,
              kecamatan: registerForm.kecamatan,
              kelurahan: registerForm.kelurahan,
              kampung: registerForm.kampung.trim()
            }
          }
        });

        if (authError) {
          triggerFeedback('error', 'Gagal mendaftar ke Supabase Auth: ' + authError.message);
        } else {
          triggerFeedback('success', `Mantap! Akun ${registerForm.nama_lengkap} berhasil terdaftar di live Supabase! Email login otomatis: ${mockEmail}`);
          await fetchFromSupabase();
        }
      } catch (err: any) {
        triggerFeedback('error', 'Exception pendaftaran Supabase: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      triggerFeedback('success', `Mantap! Akun ${newProfile.nama_lengkap} berhasil didaftarkan di ${newProfile.kelurahan} RT ${newProfile.rt}/RW ${newProfile.rw} (Sandbox Mode). Hubungi RT/RW Anda untuk verifikasi identitas resmi.`);
    }

    // Reset Form
    setRegisterForm({
      nama_lengkap: '',
      nik: '',
      no_kk: '',
      alamat: '',
      rt: '001',
      rw: '004',
      no_wa: '',
      role: 'warga',
      file_ktp: '',
      file_kk: '',
      ktpSize: 0,
      kkSize: 0,
      kecamatan: 'Coblong',
      kelurahan: 'Dago',
      kabupaten: 'Kota Bandung',
      kampung: ''
    });
  };

  const handleVerifyProfile = async (profileId: string, action: 'verified' | 'rejected') => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);

    const updated = profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, status_verifikasi: action };
      }
      return p;
    });
    setProfiles(updated);
    localStorage.setItem('E_WARGA_MOCK_PROFILES', JSON.stringify(updated));

    if (hasSupabaseConfig() && isUuid) {
      setLoading(true);
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('profiles')
          .update({ status_verifikasi: action })
          .eq('id', profileId);

        if (error) {
          triggerFeedback('error', 'Gagal update status verifikasi di Supabase: ' + error.message);
        } else {
          triggerFeedback('success', `Status verifikasi warga di Supabase di-update ke: ${action.toUpperCase()}`);
          await fetchFromSupabase();
        }
      } catch (err: any) {
        triggerFeedback('error', 'Exception verifikasi: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      triggerFeedback('success', `Status verifikasi warga berhasil diubah menjadi: ${action.toUpperCase()} (Sandbox Mode)`);
    }
  };

  const handleUpdateProfileRole = (profileId: string, newRole: UserRole) => {
    const updated = profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, role: newRole };
      }
      return p;
    });
    setProfiles(updated);
    localStorage.setItem('E_WARGA_MOCK_PROFILES', JSON.stringify(updated));
    triggerFeedback('success', `Jabatan / Role warga berhasil di-update menjadi ${newRole.toUpperCase()} secara instan!`);
  };

  const handleDeleteProfile = (profileId: string) => {
    const matched = profiles.find(p => p.id === profileId);
    if (!matched) return;
    if (matched.id === 'admin-test-id') {
      triggerFeedback('error', 'Super Admin utama kedaulatan E-Warga tidak boleh dihapus bro!');
      return;
    }
    const updated = profiles.filter(p => p.id !== profileId);
    setProfiles(updated);
    localStorage.setItem('E_WARGA_MOCK_PROFILES', JSON.stringify(updated));
    triggerFeedback('success', `Akun warga "${matched.nama_lengkap}" berhasil diretas/dihapus dari database.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* 1. TOP HEADER BRAND */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">E-WARGA</h1>
                <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                  Monorepo v2.0 (Tasikmalaya Live)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold text-slate-600">Sistem Pengantar Surat RT, RW & Kecamatan Terintegrasi (Kabupaten Tasikmalaya Aktif!)</p>
            </div>
          </div>

          {/* Core Navigation Panels */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'simulation'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Simulasi PWA
            </button>
            <button
              onClick={() => setActiveTab('registration_portal')}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'registration_portal'
                  ? 'bg-white text-purple-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-purple-600" />
              Portal Registrasi E-Warga
            </button>
            <button
              onClick={() => setActiveTab('dev_console')}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dev_console'
                  ? 'bg-white text-slate-800 shadow-sm animate-pulse'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Supabase Integrasi & SQL Setup
            </button>
          </div>

        </div>
      </header>

      {/* DYNAMIC SCROLLING SPONSOR & CHAT EMERGENCY RUNNING TEXT */}
      <style>{`
        @keyframes marquee_scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-scroll {
          animation: marquee_scroll 35s linear infinite;
        }
      `}</style>

      <div className={`py-2 text-xs font-mono font-bold overflow-hidden whitespace-nowrap border-b relative ${
        panicActive 
          ? 'bg-rose-600 text-white border-rose-700 shadow-lg shadow-rose-200 animate-pulse' 
          : 'bg-slate-900 text-amber-400 border-slate-800'
      }`}>
        <div className="inline-block animate-marquee-scroll whitespace-nowrap">
          {panicActive ? (
            <span className="flex items-center gap-4">
              🚨 SIAGA DARURAT KAMPUNG: TERDETEKSI ADANYA INSIDEN MALING / KECURIGAAN DI WILAYAH RT 03! WARGA DIKORIDINASIKAN UNTUK SEGERA SISKAMLING! 🚨 STATUS PORTAL RT 03: [{gatesStatus.gate03 ? 'DIBLOKIR 🚧' : 'BUKA 🔓'}] | STATUS PORTAL RT 04: [{gatesStatus.gate04 ? 'DIBLOKIR 🚧' : 'BUKA 🔓'}] | AKSES KELURAHAN: [{gatesStatus.gateUtama ? 'TUTUP 🚧' : 'BUKA 🔓'}] 🚨 SEGERA TUTUP SEMUA AKSES GAPURA KELUAR MASUK KAMPUNG!
            </span>
          ) : (
            <span className="flex items-center gap-4">
              📢 RUNNING INFO E-WARGA: Sponsor & Kas Kas RT menjaga platform tetap 100% gratis!
              {sponsors.length === 0 ? (
                <span className="text-yellow-300">💡 [Ad Space Tersedia] Pasang iklan UMKM RT/RW Anda untuk kas perawatan server! Hubungi Pengurus.</span>
              ) : (
                sponsors.map((ad, idx) => {
                  const badgeColor = ad.category === 'Sponsor Warung' ? 'bg-emerald-600' :
                        ad.category === 'Sponsor Kuliner' ? 'bg-blue-600' :
                        ad.category === 'Sponsor Fotokopi' ? 'bg-amber-500' : 'bg-purple-600';
                  return (
                    <span key={ad.id} className="inline-flex items-center gap-2">
                      <span className="text-slate-400">•</span>
                      <span className={`text-white ${badgeColor} px-1.5 py-0.5 rounded text-[10px] uppercase font-sans`}>{ad.category}</span>
                      <span className="text-slate-200">[{ad.title}]</span> {ad.desc}
                    </span>
                  );
                })
              )}
              <span className="text-slate-400">•</span>
              <span className="text-yellow-300">💡 [Ad Space Tersedia]</span> Pasang iklan UMKM RT/RW Anda untuk kas perawatan server! Chat admin di WhatsApp Kelurahan.
            </span>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`px-4 py-3.5 text-sm flex items-center justify-between border-b ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <p className="font-semibold">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* 2. CORE CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full flex flex-col gap-6">

        {/* ==================== TAB 1: WORKSPACE SIMULATION ==================== */}
        {activeTab === 'simulation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SIMULATOR ROLE TOGGLE SWITCHER PANELS */}
            <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Simulator Hub Peran</h3>
                  <p className="text-xs text-slate-500">Ganti peran untuk memproses alur surat pengantar dari hulu ke hilir</p>
                </div>
              </div>

              {/* Roles list selectors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                <button
                  onClick={() => setCurrentRole('warga')}
                  className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all ${
                    currentRole === 'warga'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  👩 Warga
                </button>
                <button
                  onClick={() => setCurrentRole('rt')}
                  className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all ${
                    currentRole === 'rt'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-100'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🧑 Ketua RT
                </button>
                <button
                  onClick={() => setCurrentRole('rw')}
                  className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all ${
                    currentRole === 'rw'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  👴 Ketua RW
                </button>
                <button
                  onClick={() => setCurrentRole('admin')}
                  className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all ${
                    currentRole === 'admin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-150'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  👑 Super Admin
                </button>
              </div>
            </div>

            {/* Left Column: Input Form / Management Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* CURRENT PROFILE SUMMARY */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Akun Simulasi</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentRole === 'warga' ? 'bg-emerald-100 text-emerald-800' : 
                    currentRole === 'rt' ? 'bg-amber-100 text-amber-800' : 
                    currentRole === 'rw' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {currentRole.toUpperCase()}
                  </span>
                </div>

                {(() => {
                  const currentProfile = profiles.find((p) => p.role === currentRole) || INITIAL_PROFILES_DEMO[0];
                  return (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 shrink-0">
                        {currentProfile.nama_lengkap.charAt(0)}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{currentProfile.nama_lengkap}</p>
                        <p className="text-xs text-slate-500 font-mono">NIK: {currentProfile.nik || '-'}</p>
                        <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                          <p>🏠 <span className="font-medium">Alamat:</span> {currentProfile.alamat}</p>
                          {(currentProfile.kabupaten || currentProfile.kecamatan || currentProfile.kelurahan) && (
                            <p className="text-[10px] bg-purple-50 text-purple-950 px-2 py-1 rounded border border-purple-100 flex flex-wrap gap-1 mt-1 font-semibold">
                              <span>🗺️ {currentProfile.kabupaten || '-'}</span> | 
                              <span>{currentProfile.kecamatan || '-'}</span> | 
                              <span>{currentProfile.kelurahan || '-'}</span>
                              {currentProfile.kampung && <span> | {currentProfile.kampung}</span>}
                            </p>
                          )}
                          <p>📍 <span className="font-medium">RT / RW:</span> {currentProfile.rt} / {currentProfile.rw}</p>
                          <p>💬 <span className="font-medium">WhatsApp:</span> {currentProfile.no_wa}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-4 pt-4 border-t border-slate-150 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">DB Status: {supabaseConnected ? '🟢 Live Supabase' : '🟡 Offline Demo'}</span>
                  <button
                    onClick={handleResetSandbox}
                    className="text-[10px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <RefreshCcw className="w-2.5 h-2.5" /> Reset Simulasi
                  </button>
                </div>
              </div>

              {/* FORM: SUBMIT SURAT PENGANTAR (ACTIVE ONLY FOR WARGA) */}
              {currentRole === 'warga' ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-600" />
                      Buat Pengajuan Pengantar
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Lengkapi data di bawah untuk dikirim ke Ketua RT</p>
                  </div>

                  <form onSubmit={handleCreateSurat} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Surat Pengantar</label>
                      <select
                        value={newSuratForm.jenis_surat}
                        onChange={(e) => setNewSuratForm(prev => ({ ...prev, jenis_surat: e.target.value as JenisSurat }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="KTP Baru / Perpanjangan">KTP Baru / Perpanjangan</option>
                        <option value="Kartu Keluarga (KK)">Kartu Keluarga (KK)</option>
                        <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                        <option value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
                        <option value="Surat Pengantar Pindah">Surat Pengantar Pindah</option>
                        <option value="Surat Kematian">Surat Kematian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Keperluan Dokumen</label>
                      <textarea
                        value={newSuratForm.keperluan}
                        onChange={(e) => setNewSuratForm(prev => ({ ...prev, keperluan: e.target.value }))}
                        placeholder="Contoh: Pembuatan KTP baru karena aslinya hilang di jalan raya"
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    {/* TWO FILE ATTACHMENTS WITH AUTOMATIC COMPRESSION & ZERO-COST MENTION */}
                    <div className="space-y-3">
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3.5 text-center">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Unggah Dokumen KTP</p>
                        <p className="text-[10px] text-slate-400 mb-2">Sistem akan mengompresi otomatis &lt; 150KB</p>
                        
                        <div className="flex items-center justify-center gap-3">
                          <label className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            Pilih KTP
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'ktp')}
                              className="hidden"
                            />
                          </label>
                          {newSuratForm.file_ktp && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              ✓ Terkompres ({newSuratForm.ktpSize}KB)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3.5 text-center">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Unggah Dokumen KK</p>
                        <p className="text-[10px] text-slate-400 mb-2">Sistem akan mengompresi otomatis &lt; 150KB</p>
                        
                        <div className="flex items-center justify-center gap-3">
                          <label className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            Pilih KK
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'kk')}
                              className="hidden"
                            />
                          </label>
                          {newSuratForm.file_kk && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              ✓ Terkompres ({newSuratForm.kkSize}KB)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Kirim ke Ketua RT ({profiles.find(p => p.role === 'rt')?.rt})
                    </button>
                  </form>
                </div>
              ) : currentRole === 'admin' ? (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-purple-600" />
                          {editingSponsorId ? 'Edit Sponsor & Iklan' : 'Pasang Iklan Sponsor'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {editingSponsorId ? 'Perbarui data slot iklan terpilih' : 'Pasang Info Sponsor UMKM Baru'}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAddOrUpdateSponsor} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori Sponsor</label>
                        <select
                          value={newSponsorForm.category}
                          onChange={(e) => setNewSponsorForm(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                        >
                          <option value="Sponsor Warung">Sponsor Warung (Hijau)</option>
                          <option value="Sponsor Kuliner">Sponsor Kuliner (Biru)</option>
                          <option value="Sponsor Fotokopi">Sponsor Fotokopi (Kuning)</option>
                          <option value="Lainnya">Sponsor & Donatur Lainnya (Ungu)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama UMKM / Sponsor</label>
                        <input
                          type="text"
                          value={newSponsorForm.title}
                          onChange={(e) => setNewSponsorForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Contoh: Sate Padang Selera Kito RT 04"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi / Slogan Iklan</label>
                        <textarea
                          value={newSponsorForm.desc}
                          onChange={(e) => setNewSponsorForm(prev => ({ ...prev, desc: e.target.value }))}
                          placeholder="Contoh: Diskon porsi gulai sate 15% khusus warga pembawa pengantar E-Warga!"
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kontak WhatsApp Partner</label>
                        <input
                          type="text"
                          value={newSponsorForm.waLink}
                          onChange={(e) => setNewSponsorForm(prev => ({ ...prev, waLink: e.target.value }))}
                          placeholder="Contoh: 0812345678"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        {editingSponsorId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSponsorId(null);
                              setNewSponsorForm({ category: 'Sponsor Warung', title: '', desc: '', waLink: '' });
                            }}
                            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs text-center"
                          >
                            Batal
                          </button>
                        )}
                        <button
                          type="submit"
                          className={`font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 flex-1 text-xs ${
                            editingSponsorId 
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100' 
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100'
                          }`}
                        >
                          {editingSponsorId ? <CheckCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                          {editingSponsorId ? 'Simpan Update' : 'Terbitkan Sponsor'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* ACTIVE SPONSORS LIST CARD */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        Daftar Sponsor Aktif ({sponsors.length})
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Iklan di bawah ini sedang tayang di Running Text secara live</p>
                    </div>

                    {sponsors.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        Belum ada sponsor aktif. Silakan pasang sponsor baru di form atas.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {sponsors.map((ad) => {
                          const badgeColor = ad.category === 'Sponsor Warung' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                                ad.category === 'Sponsor Kuliner' ? 'bg-blue-50 text-blue-800 border-blue-250' :
                                ad.category === 'Sponsor Fotokopi' ? 'bg-amber-50 text-amber-800 border-amber-250' : 'bg-purple-50 text-purple-800 border-purple-250';
                          return (
                            <div key={ad.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl relative group">
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${badgeColor}`}>
                                  {ad.category}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditSponsor(ad)}
                                    className="p-1 hover:bg-slate-200 text-slate-500 hover:text-amber-605 rounded transition"
                                    title="Edit Iklan"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSponsor(ad.id)}
                                    className="p-1 hover:bg-slate-200 text-slate-500 hover:text-red-600 rounded transition"
                                    title="Hapus Iklan"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <h5 className="font-extrabold text-xs text-slate-900">{ad.title}</h5>
                              <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{ad.desc}</p>
                              {ad.waLink && (
                                <p className="text-[9px] text-slate-500 font-mono mt-1">📞 Hub/WA: {ad.waLink}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Panduan Operasional</h4>
                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div className="flex gap-2.5">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <Info className="w-4 h-4" />
                      </div>
                      <p>Sebagai <span className="font-semibold">{currentRole === 'rt' ? 'Ketua RT' : 'Ketua RW'}</span>, Anda dapat memvalidasi dokumen yang masuk dengan membubuhkan nomor surat pengantar resmi.</p>
                    </div>

                    <div className="flex gap-2.5">
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <p>Kirim langsung notifikasi WhatsApp gratis (Click-to-chat) ke warga untuk memberi tahu hasil keputusan persetujuan/penolakan dokumen.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="font-mono text-[11px] text-slate-500 font-bold mb-1.5">Urutan Alur Dokumen:</p>
                      <ul className="space-y-1 text-[11px] list-decimal list-inside text-slate-500">
                        <li>Warga buat permohonan</li>
                        <li>Masuk RT (Status: <code>menunggu_rt</code>)</li>
                        <li>Disetujui RT (Status: <code>menunggu_rw</code>)</li>
                        <li>Disetujui RW (Status: <code>siap_diambil</code>)</li>
                        <li>Warga ambil & mark Selesai</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Dynamic Submissions List Dashboard */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* HEADING SEARCH */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {currentRole === 'warga' ? '📂 Riwayat Pengajuan Saya' : '📋 Antrean Dokumen Pengantar'}
                  </h2>
                  <p className="text-xs text-slate-500">Total: {suratList.filter(s => currentRole === 'warga' ? true : (currentRole === 'rt' ? s.warga_rt === '003' : s.warga_rw === '004')).length} Pengajuan</p>
                </div>
                <div className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mesin: <span className="font-bold">{supabaseConnected ? 'Supabase Postgres' : 'Demo Memory'}</span></span>
                </div>
              </div>

              {/* LIST SUBMISSIONS CARDS */}
              <div className="space-y-4">
                {(() => {
                  // Filter list based on role
                  const filtered = suratList.filter((s) => {
                    if (currentRole === 'warga') return true; // citizen sees their own
                    if (currentRole === 'rt') {
                       // RT only sees submissions matching RT 003
                       return s.warga_rt === '003';
                    }
                    if (currentRole === 'rw') {
                       // RW sees approved RT submissions or anything in RW 004
                       return s.warga_rw === '004';
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                        <FileText className="w-12 h-12 text-slate-200" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Tidak Ada Dokumen</p>
                          <p className="text-xs text-slate-400 mt-1">Belum ada berkas pengantar untuk filter peran saat ini.</p>
                        </div>
                      </div>
                    );
                  }

                  return filtered.map((surat) => {
                     const isWarga = currentRole === 'warga';
                     const canApprove = canChangeStatus(surat.status, currentRole);
                     const waToRtLink = getWaWargaToRtLink(
                       '085711112222', // Mock RT Number
                       surat.warga_nama || 'Warga',
                       surat.jenis_surat,
                       surat.keperluan
                     );

                     // Setup local inline states for form execution
                     return (
                       <div key={surat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition">
                         
                         {/* Header: Jenis and Status */}
                         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                           <div>
                             <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">ID: {surat.id}</span>
                             <h3 className="text-base font-bold text-slate-900 mt-0.5">{surat.jenis_surat}</h3>
                             <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                               <User className="w-3.5 h-3.5" />
                               <span>Pengaju: <strong>{surat.warga_nama}</strong> (RT {surat.warga_rt} / RW {surat.warga_rw})</span>
                             </p>
                           </div>
                           <span className={`text-[11px] font-bold px-3 py-1 rounded-lg self-start ${getStatusBadgeClass(surat.status)}`}>
                             {formatStatusLabel(surat.status)}
                           </span>
                         </div>

                         {/* Details */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                           <div className="space-y-1.5">
                             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Detail Keperluan:</p>
                             <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed text-slate-600">
                               "{surat.keperluan}"
                             </p>
                           </div>

                           <div className="space-y-2">
                             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Data Dokumen Pendukung:</p>
                             <div className="grid grid-cols-2 gap-2">
                               {surat.file_ktp ? (
                                 <a 
                                   href={surat.file_ktp} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="bg-slate-50 border border-slate-200 hover:bg-slate-100 duration-150 p-2 rounded-lg text-center font-bold text-slate-600 truncate flex items-center justify-center gap-1.5"
                                 >
                                   <FileText className="w-3.5 h-3.5 text-emerald-600" /> Lihat KTP
                                 </a>
                               ) : (
                                 <span className="bg-slate-50 border border-slate-100 text-slate-400 p-2 rounded-lg text-center italic">KTP Absen</span>
                               )}

                               {surat.file_kk ? (
                                 <a 
                                   href={surat.file_kk} 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   className="bg-slate-50 border border-slate-200 hover:bg-slate-100 duration-150 p-2 rounded-lg text-center font-bold text-slate-600 truncate flex items-center justify-center gap-1.5"
                                 >
                                   <FileText className="w-3.5 h-3.5 text-indigo-600" /> Lihat KK
                                 </a>
                               ) : (
                                 <span className="bg-slate-50 border border-slate-100 text-slate-400 p-2 rounded-lg text-center italic">KK Absen</span>
                               )}
                             </div>
                           </div>
                         </div>

                         {/* Approval numbers & comments if any */}
                         {(surat.nomor_surat_rt || surat.nomor_surat_rw || surat.catatan_rt || surat.catatan_rw) && (
                           <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-2 text-slate-700">
                             <h4 className="font-extrabold text-slate-900 text-[10px] text-emerald-900 tracking-wider uppercase">Tanda Tangan & Keterangan Pejabat Setempat:</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                               {surat.nomor_surat_rt && (
                                 <div>
                                   <p className="font-bold text-slate-800">🖊️ Surat Pengantar RT:</p>
                                   <p className="font-mono text-[11px] text-slate-600">{surat.nomor_surat_rt}</p>
                                   {surat.catatan_rt && <p className="text-slate-500 italic mt-0.5">"{surat.catatan_rt}"</p>}
                                 </div>
                               )}
                               {surat.nomor_surat_rw && (
                                 <div>
                                   <p className="font-bold text-slate-800">🖊️ Surat Pengantar RW:</p>
                                   <p className="font-mono text-[11px] text-slate-600">{surat.nomor_surat_rw}</p>
                                   {surat.catatan_rw && <p className="text-slate-500 italic mt-0.5">"{surat.catatan_rw}"</p>}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}

                         {/* ACTION PANELS DEPENDING ON ACTIVE ROLE */}
                         <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                           
                           {/* Citizen Info / Quick WA to RT option */}
                           {isWarga && (
                             <div className="flex flex-wrap items-center gap-2 w-full justify-between">
                               <p className="text-xs text-slate-400">Dibuat pada: {new Date(surat.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                               
                               {surat.status === 'menunggu_rt' && (
                                 <a
                                   href={waToRtLink}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 duration-150 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-sm border border-emerald-200"
                                 >
                                   <Phone className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 animate-bounce" />
                                   Hubungi Pak RT via WA
                                 </a>
                               )}

                               {surat.status === 'siap_diambil' && (
                                 <button
                                   onClick={() => handleApprove(surat.id)}
                                   className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
                                 >
                                   <CheckCircle className="w-3.5 h-3.5" /> Tandai Dokumen Diterima (Selesai)
                                 </button>
                               )}
                             </div>
                           )}

                           {/* RT and RW action triggers */}
                           {!isWarga && (
                             <div className="flex items-center justify-between w-full flex-wrap gap-3">
                               
                               {/* Quick notify to Citizen WA links */}
                               <div className="flex items-center gap-1">
                                 <a
                                   href={getWaStatusUpdateLink(
                                     surat.warga_no_wa || '081234567890',
                                     surat.warga_nama || 'Warga',
                                     surat.jenis_surat,
                                     surat.status,
                                     surat.catatan_rt || surat.catatan_rw
                                   )}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                                 >
                                   <Phone className="w-3 h-3 text-emerald-600" /> Kirim Update Status ke WA Warga
                                 </a>
                               </div>

                               <div className="flex items-center gap-2">
                                 {canApprove ? (
                                   <>
                                     <button
                                       onClick={() => {
                                         const reason = prompt('Masukkan alasan penolakan berkas:');
                                         if (reason !== null) handleReject(surat.id, reason);
                                       }}
                                       className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs px-3.5 py-2 rounded-lg border border-rose-200 transition"
                                     >
                                       Tolak Berkas
                                     </button>

                                     <button
                                       onClick={() => {
                                         const prefix = currentRole === 'rt' ? 'RT-03' : 'RW-04';
                                         const customNo = prompt(`Masukkan nomor surat resmi ${currentRole.toUpperCase()} (atau kosongkan untuk auto):`, `PM/0${Math.floor(Math.random() * 90) + 10}/${prefix}/VI/2026`);
                                         if (customNo !== null) {
                                           const comment = prompt('Catatan tambahan (opsional):') || '';
                                           handleApprove(surat.id, customNo, comment);
                                         }
                                       }}
                                       className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow transition"
                                     >
                                       Setujui & Tandatangani
                                     </button>
                                   </>
                                 ) : (
                                   <span className="text-[11px] text-slate-400 italic">Tidak ada tindakan yang diperlukan untuk peran Anda</span>
                                 )}
                               </div>

                             </div>
                           )}

                         </div>

                       </div>
                     );
                  });
                })()}
              </div>

              {/* EMERGENCY PORTAL (POS RONDA DIGITAL - KOORDINASI ANTAR KAMPUNG) */}
              <div className={`mt-6 rounded-2xl border transition duration-300 p-5 shadow-md ${
                panicActive 
                  ? 'border-rose-400 bg-rose-50/70 shadow-rose-100 ring-2 ring-rose-500/20' 
                  : 'border-slate-200 bg-white'
              }`}>
                {/* Header widget */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dashed border-slate-200 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white shadow-sm ${
                      panicActive ? 'bg-rose-600 animate-bounce' : 'bg-slate-800'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
                        Pos Ronda Digital & Siaga Darurat
                        <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                          Inter-RT/RW Room
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Portal koordinasi siaga pencurian/maling & penutupan brikade jalan utama warga secara real-time</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {panicActive ? (
                      <button
                        onClick={handleDeactivatePanic}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow duration-150 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Matikan Alarm / Kondisi Aman
                      </button>
                    ) : (
                      <button
                        onClick={handleTriggerPanic}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl shadow-lg shadow-rose-200 duration-150 flex items-center gap-1.5 animate-pulse"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> 🚨 TOMBOL PANIK (Maling!)
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* LEFT COLUMN: VISUAL VILLAGE MAP & GATE BLOCKS (Simulation) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1 font-sans">
                          📍 Peta Gerbang & Portal Siskamling
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          RT 03 & RT 04
                        </span>
                      </div>

                      {/* Map Schema illustration */}
                      <div className="bg-white border border-slate-150 rounded-xl p-3 space-y-2 relative overflow-hidden shadow-inner">
                        <div className="absolute top-1 right-2"><span className="text-[9px] text-slate-350 font-mono font-bold font-sans">MAP RATIO 1:1</span></div>
                        
                        {/* Interactive Road Blocks Representation */}
                        <div className="space-y-2.5 font-sans">
                          {/* Gate RT 03 Block */}
                          <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition duration-150 ${
                            gatesStatus.gate03 
                              ? 'bg-rose-50 border-rose-200 text-rose-900 font-extrabold' 
                              : 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Lock className={`w-3.5 h-3.5 ${gatesStatus.gate03 ? 'text-rose-600' : 'text-emerald-600'}`} />
                              <div>
                                <p className="font-extrabold text-slate-900">Gerbang Keluar RT 003</p>
                                <p className="text-[10px] text-slate-500 font-normal">Akses menuju Jl. Kancil Luar</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleGate('gate03')}
                              className={`text-[9px] font-extrabold px-2.5 py-1 rounded shadow-sm duration-150 ${
                                gatesStatus.gate03 
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {gatesStatus.gate03 ? 'BUKA 🔓' : 'BLOKIR 🚧'}
                            </button>
                          </div>

                          {/* Gate RT 04 Block */}
                          <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition duration-150 ${
                            gatesStatus.gate04 
                              ? 'bg-rose-50 border-rose-200 text-rose-900 font-extrabold' 
                              : 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Lock className={`w-3.5 h-3.5 ${gatesStatus.gate04 ? 'text-rose-600' : 'text-emerald-600'}`} />
                              <div>
                                <p className="font-extrabold text-slate-900">Gerbang Keluar RT 004</p>
                                <p className="text-[10px] text-slate-500 font-normal">Perbatasan Kampung Seberang</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleGate('gate04')}
                              className={`text-[9px] font-extrabold px-2.5 py-1 rounded shadow-sm duration-150 ${
                                gatesStatus.gate04 
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {gatesStatus.gate04 ? 'BUKA 🔓' : 'BLOKIR 🚧'}
                            </button>
                          </div>

                          {/* Main road Block */}
                          <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition duration-150 ${
                            gatesStatus.gateUtama 
                              ? 'bg-rose-50 border-rose-200 text-rose-900 font-extrabold' 
                              : 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Lock className={`w-3.5 h-3.5 ${gatesStatus.gateUtama ? 'text-rose-600' : 'text-emerald-600'}`} />
                              <div>
                                <p className="font-extrabold text-slate-900">Portal Utama Kelurahan</p>
                                <p className="text-[10px] text-slate-500 font-normal">Pintu gerbang jalan raya utama</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleGate('gateUtama')}
                              className={`text-[9px] font-extrabold px-2.5 py-1 rounded shadow-sm duration-150 ${
                                gatesStatus.gateUtama 
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {gatesStatus.gateUtama ? 'BUKA 🔓' : 'BLOKIR 🚧'}
                            </button>
                          </div>
                        </div>

                        {/* Interactive schema feedback map text */}
                        <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[10px] text-slate-600 flex flex-col gap-1 font-sans">
                          <p className="flex items-center gap-1.5 font-bold">
                            💡 <span className="text-slate-900 font-extrabold">Sinyal Pintu Pintar:</span>
                          </p>
                          <p>Ketik kata kunci <strong>"tutup RT 03"</strong> atau <strong>"tutup jalan"</strong> di chat siskamling sebelah kanan. AI parser akan langsung membaca pesan dan mengaktifkan portal secara otomatis!</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* RIGHT COLUMN: REAL-TIME COORDINATION CHAT FEED (Simulated) */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 flex flex-col justify-between min-h-[320px]">
                      
                      {/* Active online members widget */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-ping"></span>
                          Kamar Koordinasi Siskamling ({currentRole.toUpperCase()})
                        </span>
                        <span className="text-[10px] text-slate-400">Hub aktif: RT 03, RT 04, Kelurahan</span>
                      </div>

                      {/* Chat messages list */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[190px] pr-1">
                        {chatMessages.map((msg) => {
                          const isSystem = msg.sender.includes('SYSTEM') || msg.sender.includes('📢') || msg.sender.includes('📢 SYSTEM');
                          const isWarning = msg.sender.includes('ALARM') || msg.sender.includes('🚨') || msg.sender.includes('🚨 EMERGENCY ALARM');

                          return (
                            <div key={msg.id} className={`p-2 rounded-xl border text-xs leading-relaxed transition-all ${
                              isWarning 
                                ? 'bg-rose-50 border-rose-200 text-rose-950 animate-pulse font-bold' 
                                : isSystem 
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-900 font-medium'
                                : 'bg-white border-slate-150 text-slate-800'
                            }`}>
                              <div className="flex items-center justify-between opacity-75 font-extrabold mb-0.5 text-[10px] border-b border-slate-100 pb-0.5">
                                <span className={
                                  isWarning ? 'text-rose-700' : isSystem ? 'text-indigo-700' : 'text-slate-600'
                                }>
                                  {msg.sender}
                                </span>
                                <span>{msg.time}</span>
                              </div>
                              <p className="mt-1 font-mono">{msg.message}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick preset hotclicks to simulate typing */}
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Pesan Cepat Siskamling (Tinggal Klik):</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewChatText('TOLONG MALINGNYA LARI KE KAMPUNG SEBELAH! HARAP TUTUP RT 04!')}
                            className="text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 px-2 py-1 rounded"
                          >
                            🚨 Maling kabur!
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewChatText('Warga koordinasi siaga, tolong tutup RT 03 sekarang juga!')}
                            className="text-[10px] font-extrabold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 px-2 py-1 rounded"
                          >
                            🚧 Tutup Portal RT 03
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewChatText('Target maling berhasil diamankan tim linmas. Buka jalan utama.')}
                            className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded"
                          >
                            ✅ Maling ketangkep!
                          </button>
                        </div>
                      </div>

                      {/* Interactive form input for sending chat messages */}
                      <form onSubmit={handleSendSiagaChat} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={newChatText}
                          onChange={(e) => setNewChatText(e.target.value)}
                          placeholder="Pesan siaga (Gunakan kata kunci 'tutup RT 03' / 'tutup jalan')..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans"
                        />
                        <button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shrink-0 font-sans"
                        >
                          <Send className="w-3.5 h-3.5" /> Kirim
                        </button>
                      </form>

                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: DEVELOPER CONSOLE & SUPABASE INTEGRATION ==================== */}
        {activeTab === 'dev_console' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            <div className="border-b border-slate-150 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Supabase Database Setup & Auto-Migration Console
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Koneksikan platform E-Warga langsung ke Supabase Anda. Anda dapat menjalankan auto-migrasi untuk membuat tabel, trigger, dan kebijakan RLS di skema Anda secara instan dari sini!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Setup */}
              <form onSubmit={handleSaveConfig} className="lg:col-span-7 space-y-5">
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Koneksi Supabase Client (Frontend)
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3 text-xs text-slate-700">
                    <div>
                      <label className="block font-semibold mb-1">SUPABASE_URL</label>
                      <input
                        type="text"
                        value={dbConfig.url}
                        onChange={(e) => setDbConfig(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://your-supabase-id.supabase.co"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">SUPABASE_ANON_KEY</label>
                      <input
                        type="password"
                        value={dbConfig.anonKey}
                        onChange={(e) => setDbConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200/60 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Koneksi Direct Postgres (Server-side Table Migration)
                  </h4>
                  <p className="text-xs text-slate-500">
                     Diperlukan untuk menjalankan migrasi SQL DDL dari server-side container kami secara aman ke database Supabase Anda. Anda dapat mendapatkannya di panel <strong>Supabase Project Settings → Database → Connection String (URI format - Pooler port 5432)</strong>.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700">Dsn Connection String (URI)</label>
                    <input
                      type="text"
                      value={dbConfig.connString}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, connString: e.target.value }))}
                      placeholder="postgres://postgres.your-id:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-lg shadow duration-150 cursor-pointer"
                  >
                    Simpan Credentials Client
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={runDbMigration}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs px-5 py-3 rounded-lg shadow duration-150 flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                        Sedang Bermigrasi...
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        Jalankan Auto-Migration PostgreSQL
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Right Column: SQL Migration preview & Guide instructions */}
              <div className="lg:col-span-5 space-y-4 text-xs text-slate-700">
                <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-200 space-y-3.5 leading-relaxed">
                  <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">Panduan Aktivasi Supabase</h4>
                  
                  <div className="space-y-3">
                    <p>
                      <strong>1. Buat Tabel Instan:</strong> Klik tombol <span className="text-blue-600 font-bold">"Jalankan Auto-Migration PostgreSQL"</span> setelah mengisi Connection URI dari dashboard Supabase Anda. Anda tidak perlu menyalin SQL manual!
                    </p>
                    <p>
                      <strong>2. Set Up Auth:</strong> Aktifkan "Email SignUp" di panel authentication Supabase Anda. Registrasi baru akan otomatis membuat baris profil di tabel <code>profiles</code> berkat SQL Trigger yang kami pasang.
                    </p>
                    <p>
                      <strong>3. Cost Optimal:</strong> Unggah file KTP/KK langsung terkompresi otomatis &lt; 150KB untuk menghemat ruang gratis 1GB.
                    </p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex gap-2.5 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-amber-900 text-[11px]">Keamanan Zero-Cost Backend</p>
                      <p className="text-[10px] text-amber-800 mt-0.5">Seluruh keamanan database diamankan oleh Row Level Security (RLS) PostgreSQL kami sehingga frontend dapat melakukan query langsung dengan aman.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 space-y-2">
                  <p className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500">Logika Monorepo Workspace:</p>
                  <p className="leading-relaxed">
                    Sesuai dengan filosofi monorepo, semua struktur transisi dan validasi role dipisahkan ke dalam shared package <code>@e-warga/logic</code> dan client instance di <code>@e-warga/supabase</code>. Ini memastikan codebase modular dan dapat dikembangkan dengan mudah di masa depan.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: REGISTRATION PORTAL (ARBLOK DIGITAL HUB) ==================== */}
        {activeTab === 'registration_portal' && (
          <div className="space-y-6">
            
            {/* BRANDING HEADER METADATA */}
            <div className="relative overflow-hidden bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              {/* Matrix-like ambient circles */}
              <div className="absolute right-0 top-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>
              <div className="absolute left-1/3 bottom-0 -mb-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-lg">
                      <Fingerprint className="w-5 h-5 animate-pulse" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      E-WARGA DIGITAL <span className="text-xs font-mono font-extrabold bg-purple-800 text-purple-200 border border-purple-600 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Secure Gateway</span>
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
                    Sistem Manajemen Otentikasi dan Registrasi Warga Mandiri Kedaulatan Kelurahan. Didukung enkripsi end-to-end gratis dan kompresi file multimedia di bawah <span className="font-bold text-amber-400">150KB</span> demi menghemat kuota cloud Supabase database Anda.
                  </p>
                </div>
                
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Node Protokol</p>
                    <p className="text-xs font-bold text-slate-200">E-Warga Core-v2 Live ✅</p>
                    <p className="text-[9px] font-mono text-slate-500">Kriptografi RLS Terproteksi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PORTAL INTERNAL TABS */}
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveRegTab('register')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl transition duration-150 flex-1 sm:flex-initial justify-center ${
                    activeRegTab === 'register'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Pendaftaran Mandiri Warga
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRegTab('manage')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl transition duration-150 flex-1 sm:flex-initial justify-center ${
                    activeRegTab === 'manage'
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Queue Verifikasi & Database Warga ({profiles.length})
                </button>
              </div>

              {/* SIMULATION ROLE REMINDER BANNER */}
              <div className="text-[10px] font-mono px-3.5 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-250 rounded-xl leading-relaxed max-w-md hidden md:block">
                💡 <span className="font-extrabold">Tips Simulasi:</span> Role lu saat ini adalah <span className="font-black underline uppercase text-amber-900">{currentRole}</span>. Ganti ke <span className="font-bold text-purple-900">Admin</span> atau <span className="font-bold text-amber-900">RT/RW</span> di Hub Peran untuk menguji otorisasi verifikasi berkas!
              </div>
            </div>

            {/* MAIN PORTAL BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* === SUBTAB 1: REGISTER REGISTER FORM === */}
              {activeRegTab === 'register' && (
                <>
                  {/* Left Column: Form Register */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        ✍️ Formulir Pendataan Warga Baru Kelurahan
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Isi form ini sesuai kartu identitas asli. Seluruh pendaftaran akan masuk ke antrean verifikasi RT/RW setempat.
                      </p>
                    </div>

                    <form onSubmit={handleRegisterWarga} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Nama Lengkap</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Joko Widodo"
                            value={registerForm.nama_lengkap}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, nama_lengkap: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Nomor WhatsApp Aktif</label>
                          <input
                            type="text"
                            placeholder="Contoh: 08123456789"
                            value={registerForm.no_wa}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, no_wa: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Nomor Induk Kependudukan (NIK)</label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            placeholder="16 Digit NIK KTP Anda"
                            value={registerForm.nik}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, nik: e.target.value.replace(/\D/g, '') }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5">Sistem memvalidasi NIK KTP Anda harus tepat 16 digit angka.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Nomor Kartu Keluarga (KK) - Opsional</label>
                          <input
                            type="text"
                            maxLength={16}
                            placeholder="16 Digit Nomor KK (Kosongkan jika disimpan di lemari)"
                            value={registerForm.no_kk}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, no_kk: e.target.value.replace(/\D/g, '') }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5">KK di simpan terpisah? Kosongkan aja bro, gk wajib!</p>
                        </div>
                      </div>

                      {/* DATA REGIONAL PEMBAGIAN TENAN (KABUPATEN/KOTA, KECAMATAN & DESA / KELURAHAN / KAMPUNG) */}
                      <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4.5 space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                            📍 Sektor Wilayah Jawa Barat (Sovereigntal Multi-Tenant)
                          </h4>
                          <p className="text-[10px] text-purple-750 mt-1 leading-relaxed">
                            Cegah data nyasar! Kami mengklasifisikan wilayah admin per kota/kabupaten, kecamatan, hingga desa/kelurahan sehingga antrean RT/RW 100% akurat.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1 min-h-[30px] flex items-end pb-0.5">Kota / Kabupaten</label>
                            <select
                              value={registerForm.kabupaten || 'Kota Bandung'}
                              onChange={(e) => handleKabupatenChange(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-slate-800"
                            >
                              {Object.keys(REGIONAL_JABAR_DATA).map(kab => (
                                <option key={kab} value={kab}>{kab}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1 min-h-[30px] flex items-end pb-0.5">Kecamatan</label>
                            <select
                              value={registerForm.kecamatan}
                              onChange={(e) => handleKecamatanChange(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-slate-800"
                            >
                              {Object.keys(REGIONAL_JABAR_DATA[registerForm.kabupaten || 'Kota Bandung'] || {}).map(kec => (
                                <option key={kec} value={kec}>{kec}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1 min-h-[30px] flex items-end pb-0.5">Kelurahan / Desa</label>
                            <select
                              value={registerForm.kelurahan}
                              onChange={(e) => setRegisterForm(prev => ({ ...prev, kelurahan: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-slate-800"
                            >
                              {(REGIONAL_JABAR_DATA[registerForm.kabupaten || 'Kota Bandung']?.[registerForm.kecamatan] || []).map(kel => (
                                <option key={kel} value={kel}>{kel}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1 min-h-[30px] flex items-end pb-0.5">Kampung / Blok / Rumah</label>
                            <input
                              type="text"
                              required
                              placeholder="Contoh: Dusun III, Blok RT 3"
                              value={registerForm.kampung}
                              onChange={(e) => setRegisterForm(prev => ({ ...prev, kampung: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Manual Address override & RT selection up to 25 / RW up to 15 */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Alamat KTP Lengkap (Override manual)</label>
                        <textarea
                          rows={1}
                          placeholder="Kosongkan jika ingin generate alamat otomatis dari Kecamatan/Kelurahan di atas"
                          value={registerForm.alamat}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, alamat: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">RT (001 - 025)</label>
                          <select
                            value={registerForm.rt}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, rt: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono font-bold text-slate-800"
                          >
                            {Array.from({ length: 25 }, (_, i) => {
                              const rtStr = String(i + 1).padStart(3, '0');
                              return <option key={rtStr} value={rtStr}>RT {rtStr}</option>;
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">RW (001 - 015)</label>
                          <select
                            value={registerForm.rw}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, rw: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono font-bold text-slate-800"
                          >
                            {Array.from({ length: 15 }, (_, i) => {
                              const rwStr = String(i + 1).padStart(3, '0');
                              return <option key={rwStr} value={rwStr}>RW {rwStr}</option>;
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Simulasi Role</label>
                          <select
                            value={registerForm.role}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-purple-700"
                          >
                            <option value="warga">👩 Warga Biasa</option>
                            <option value="rt">🧑 Ketua RT</option>
                            <option value="rw">👴 Ketua RW</option>
                          </select>
                        </div>
                      </div>

                      {/* Attachment scans powered by E-Warga Compression */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* KTP Upload */}
                        <div className="border border-dashed border-slate-250 bg-slate-50/50 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Scan KTP Asli</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Wajib kompresi gambar otomatis</p>
                            </div>
                            <span className="text-[9px] font-mono bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">E-Warga Opt</span>
                          </div>

                          {registerForm.file_ktp ? (
                            <div className="relative pt-1">
                              <img src={registerForm.file_ktp} alt="KTP preview" className="h-20 w-full object-cover rounded-lg border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => setRegisterForm(prev => ({ ...prev, file_ktp: '', ktpSize: 0 }))}
                                className="absolute top-2 right-2 bg-rose-600 p-1 rounded-full text-white hover:bg-rose-700 cursor-pointer text-[10px]"
                              >
                                ✕
                              </button>
                              <p className="text-[9px] font-mono text-emerald-600 font-semibold mt-1">✓ Berhasil dikompresi: {registerForm.ktpSize} KB</p>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border border-slate-200 rounded-xl py-3 hover:bg-slate-100 cursor-pointer border-dashed bg-white">
                              <Upload className="w-4 h-4 text-slate-450 mb-1" />
                              <span className="text-[10px] font-bold text-slate-655 font-sans">Unggah Foto KTP</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleRegFileUpload(e, 'ktp')} />
                            </label>
                          )}
                        </div>

                        {/* KK Upload */}
                        <div className="border border-dashed border-slate-250 bg-slate-50/50 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Scan KK Terkini</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Otomatis reduksi ukuran piksel</p>
                            </div>
                            <span className="text-[9px] font-mono bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Auto Safe</span>
                          </div>

                          {registerForm.file_kk ? (
                            <div className="relative pt-1">
                              <img src={registerForm.file_kk} alt="KK preview" className="h-20 w-full object-cover rounded-lg border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => setRegisterForm(prev => ({ ...prev, file_kk: '', kkSize: 0 }))}
                                className="absolute top-2 right-2 bg-rose-600 p-1 rounded-full text-white hover:bg-rose-700 cursor-pointer text-[10px]"
                              >
                                ✕
                              </button>
                              <p className="text-[9px] font-mono text-emerald-600 font-semibold mt-1">✓ Berhasil dikompresi: {registerForm.kkSize} KB</p>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border border-slate-200 rounded-xl py-3 hover:bg-slate-100 cursor-pointer border-dashed bg-white">
                              <Upload className="w-4 h-4 text-slate-450 mb-1" />
                              <span className="text-[10px] font-bold text-slate-655 font-sans">Unggah Bukti KK</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleRegFileUpload(e, 'kk')} />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Secure Sign and Submit */}
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow duration-150 flex items-center justify-center gap-2 cursor-pointer border border-purple-500/30"
                      >
                        <Lock className="w-3.5 h-3.5 text-purple-200" />
                        Verifikasi & Daftarkan Melalui E-Warga Secure Core
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Dynamic Preview of electronic KTW */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* ELECTRONIC IDENTITY CARD PREVIEW - (K-TWE) */}
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[250px]">
                      
                      {/* Holographic Watermark lines */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_50%,#fff_50%,#fff_75%,transparent_75%,transparent)] bg-[length:30px_30px] pointer-events-none"></div>
                      
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">REPUBLIK INDONESIA</p>
                          <p className="text-xs font-extrabold tracking-tight text-white mb-0.5">KARTU TANDA WARGA ELEKTRONIK (K-TWE)</p>
                          <p className="text-[7px] font-mono text-purple-400 uppercase tracking-widest">Kombinasi Enkripsi Otentik E-Warga Digital</p>
                        </div>
                        <Fingerprint className="w-8 h-8 text-purple-400 opacity-60 shrink-0" />
                      </div>

                      {/* Mid details / chip */}
                      <div className="relative z-10 flex gap-4 my-4 items-center">
                        <div className="w-8 h-7 bg-amber-400/90 rounded-md border border-amber-300 relative overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                          {/* Microchip veins */}
                          <div className="absolute inset-0 border-r border-b border-amber-600 opacity-40"></div>
                          <div className="w-5 h-4 border border-amber-500 rounded"></div>
                        </div>
                        
                        <div className="text-xs flex-1 min-w-0 space-y-1">
                          <p className="text-[10px] font-mono font-bold text-slate-350 tracking-wider">
                            NIK: <span className="text-white select-all">{registerForm.nik || '3171xxxxxxxxxxxx'}</span>
                          </p>
                          <p className="font-extrabold truncate text-white uppercase text-[11px] font-sans">
                            {registerForm.nama_lengkap || 'NAMA LENGKAP WARGA'}
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-slate-400 pt-0.5">
                            <p>RT/RW: <span className="text-white">{registerForm.rt}/{registerForm.rw}</span></p>
                            <p>WA: <span className="text-white">{registerForm.no_wa || '-'}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer with verification badge */}
                      <div className="relative z-10 border-t border-slate-800 pt-3.5 flex justify-between items-center text-[8px] font-mono">
                        <div>
                          <p className="text-slate-400 leading-none">ALAMAT DOMISILI</p>
                          <p className="font-extrabold truncate text-white mt-0.5 uppercase tracking-wide max-w-[200px]">
                            {registerForm.alamat || 'ALAMAT LENGKAP KELURAHAN'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-full font-bold animate-pulse uppercase tracking-wider text-[8px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                          Pending Gateway
                        </div>
                      </div>

                      {/* E-WARGA WATERMARK BACKGROUND */}
                      <span className="absolute bottom-1 right-2 text-[48px] font-black pointer-events-none text-slate-800/15 font-mono select-none">
                        E-WARGA
                      </span>
                    </div>

                    {/* STATS SUMMARY BOX */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Status Sistem Kependudukan</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-150">
                          <p className="text-slate-500 text-[10px]">Total Warga Terdata</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{profiles.length}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150">
                          <p className="text-slate-500 text-[10px]">Tunda Verifikasi</p>
                          <p className="text-lg font-black text-amber-600 mt-1">{profiles.filter(p => p.status_verifikasi === 'pending').length}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150">
                          <p className="text-slate-500 text-[10px]">Verifikasi Terbit</p>
                          <p className="text-lg font-black text-emerald-600 mt-1">{profiles.filter(p => p.status_verifikasi === 'verified').length}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150">
                          <p className="text-slate-500 text-[10px]">Keamanan Enkripsi</p>
                          <p className="text-xs font-bold text-purple-600 mt-2 uppercase tracking-wide">AES-256 RLS</p>
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
                        <div>
                          <p className="font-bold text-purple-900 text-[11px]">Enkripsi E-Warga Autentikator</p>
                          <p className="text-[10px] text-purple-800 mt-0.5 leading-relaxed">
                            Masing-masing warga memiliki metadata digital kedaulatan yang langsung dikaitkan pada Row Level Security PostgreSQL Supabase. Aman dari pencurian data massal.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* === SUBTAB 2: QUEUE QUEUE MANAGE LIST === */}
              {activeRegTab === 'manage' && (
                <div className="lg:col-span-12 space-y-4">
                  
                  {/* Filter and search utilities */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Cari warga (Nama, NIK, No WA)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap text-xs text-slate-500 font-medium">
                      <span>Quick Info:</span>
                      <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">Admin: RT, RW, Kelurahan</span>
                      <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Warna Profil: Kuning = Pending Terbuka</span>
                    </div>
                  </div>

                  {/* Verifikator queue list */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                            <th className="py-4.5 px-5">Nama Lengkap & NIK</th>
                            <th className="py-4.5 px-4">Kontak WhatsApp</th>
                            <th className="py-4.5 px-4">Alamat Domisili</th>
                            <th className="py-4.5 px-4">RT / RW</th>
                            <th className="py-4.5 px-4">Jabatan (Role)</th>
                            <th className="py-4.5 px-4 text-center">Status Verifikasi</th>
                            <th className="py-4.5 px-5 text-right">Opsi Tindakan (Otorisasi Pengurus)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-xs">
                          {(() => {
                            const filtered = profiles.filter(p => {
                              const matchQuery = 
                                p.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.nik.includes(searchQuery) ||
                                p.no_wa.includes(searchQuery);
                              return matchQuery;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="py-12 text-center text-slate-450 font-medium">
                                    📭 Tidak ada data warga yang cocok dengan pencarian Anda.
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((item) => {
                              const isPending = item.status_verifikasi === 'pending';
                              const isVerified = item.status_verifikasi === 'verified';
                              const isRejected = item.status_verifikasi === 'rejected';

                              return (
                                <tr key={item.id} className="hover:bg-slate-50/50 duration-100">
                                  <td className="py-4 px-5">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-slate-700 ${
                                        isVerified ? 'bg-emerald-50 border-emerald-250 text-emerald-800' :
                                        isRejected ? 'bg-rose-50 border-rose-250 text-rose-800' : 'bg-amber-50 border-amber-250 text-amber-800'
                                      }`}>
                                        {item.nama_lengkap.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900">{item.nama_lengkap}</p>
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">NIK: {item.nik}</p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-4 px-4 font-mono text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                      <span>{item.no_wa || '-'}</span>
                                      <a
                                        href={`https://wa.me/${item.no_wa.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Chat langsung via WhatsApp"
                                        className="text-emerald-600 hover:text-emerald-700 hover:scale-110 transition shrink-0"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </td>

                                  <td className="py-4 px-4 text-slate-650 max-w-[200px] truncate" title={item.alamat}>
                                    {item.alamat}
                                  </td>

                                  <td className="py-4 px-4 font-mono text-slate-700 font-bold">
                                    {item.rt} / {item.rw}
                                  </td>

                                  {/* Role changer dropdown */}
                                  <td className="py-4 px-4">
                                    <select
                                      value={item.role}
                                      onChange={(e) => handleUpdateProfileRole(item.id, e.target.value as UserRole)}
                                      className="bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-[11px] font-bold text-slate-700 focus:outline-none"
                                    >
                                      <option value="warga">👩 Warga</option>
                                      <option value="rt">🧑 Ketua RT</option>
                                      <option value="rw">👴 Ketua RW</option>
                                      <option value="admin">👑 Admin</option>
                                    </select>
                                  </td>

                                  <td className="py-4 px-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                      isVerified ? 'bg-emerald-100 text-emerald-800' :
                                      isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        isVerified ? 'bg-emerald-500' :
                                        isRejected ? 'bg-rose-500' : 'bg-amber-500'
                                      }`}></span>
                                      {isVerified ? 'TERVERIFIKASI' : isRejected ? 'DITOLAK' : 'MENUNGGU'}
                                    </span>
                                  </td>

                                  {/* Quick Approve / Reject action buttons */}
                                  <td className="py-4 px-5 text-right whitespace-nowrap">
                                    <div className="inline-flex gap-1.5">
                                      {/* Approve */}
                                      {!isVerified && (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyProfile(item.id, 'verified')}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                                        >
                                          <Check className="w-3 h-3" /> Setujui
                                        </button>
                                      )}

                                      {/* Reject */}
                                      {!isRejected && (
                                        <button
                                          type="button"
                                          onClick={() => handleVerifyProfile(item.id, 'rejected')}
                                          className="bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                                        >
                                          ✕ Tolak
                                        </button>
                                      )}

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProfile(item.id)}
                                        className="bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 p-1.5 rounded-lg cursor-pointer"
                                        title="Hapus data warga"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-3 leading-relaxed">
                      <p className="flex items-center gap-1.5 font-mono">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        AUDIT REGISTER SECURE GATEWAY (E-WARGA COOPERATIVE PROTOCOL)
                      </p>
                      <p className="text-center sm:text-right">
                        Hak akses role warga disimulasikan secara dinamis. Anda dapat mengubah salah satu jabatan warga menjadi Ketua RT atau RW secara instan di atas!
                      </p>
                    </div>
                  </div>

                  {/* K-TWE ELECTRONIC WALLET BULK PREVIEW */}
                  <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-5">
                    <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-3">Simulasi Kartu Tanda Warga Elektronik (K-TWE) Terbit</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {profiles.filter(p => p.status_verifikasi === 'verified').map(item => (
                        <div key={item.id} className="bg-slate-900 border border-slate-750 p-4.5 rounded-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow">
                          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
                          
                          <div className="flex justify-between items-start text-[8px] font-mono">
                            <div>
                              <p className="text-slate-500 font-extrabold uppercase select-none font-sans">K-TWE DIGITAL CERTIFICATE</p>
                              <p className="text-slate-350 text-[7px] max-w-[150px] font-sans truncate">Terhubung dengan database Supabase</p>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold text-[7px] tracking-wide">
                              ✓ Verified
                            </span>
                          </div>

                          <div className="my-2.5 flex gap-3 items-center">
                            <div className="w-5 h-5 bg-amber-400 rounded relative shrink-0"></div>
                            <div className="text-[10px] flex-1 min-w-0 font-sans space-y-0.5">
                              <p className="font-extrabold text-white uppercase truncate text-xs">{item.nama_lengkap}</p>
                              <p className="text-[9px] text-slate-400 font-mono">NIK: {item.nik}</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-800 pt-2 flex justify-between items-end text-[7px] font-mono text-slate-400">
                            <div>
                              <p>WILAYAH RT/RW: <span className="text-white font-bold">{item.rt}/{item.rw}</span></p>
                              <p className="truncate max-w-[150px]">KAB: {item.alamat}</p>
                            </div>
                            <span className="text-[7px] text-slate-500">Security: E-Warga Secure</span>
                          </div>
                        </div>
                      ))}

                      {profiles.filter(p => p.status_verifikasi === 'verified').length === 0 && (
                        <div className="col-span-1 md:col-span-3 bg-white border border-slate-200 border-dashed rounded-xl py-8 text-center text-xs text-slate-450 font-bold">
                          📭 Belum ada warga yang terverifikasi. Setujui salah satu pendaftaran warga di atas untuk menerbitkan K-TWE!
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* 3. FOOTER SIGNATURE */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400">E-Warga Monorepo Platform © 2026. Handcrafted with Care by <span className="font-bold text-slate-600">Arblok Digital</span>.</p>
          <p className="text-[10px] font-mono text-slate-350">
            Workspaces: 📂 apps/warga-pwa | 📂 packages/logic | 📂 packages/supabase
          </p>
        </div>
      </footer>

    </div>
  );
}
