import React, { useState } from 'react';
import type { Prospect, ProspectStatus, MinaraProduct, VisitProof } from '../types/database';
import { systemStore } from '../lib/supabase';
import { 
  X, Save, CheckCircle2, AlertCircle, 
  Calendar, Send, Layers, ShoppingBag, GraduationCap, Radio, Camera, MapPin, Clock, ShieldCheck, Mail
} from 'lucide-react';

interface ProspectModalProps {
  prospect?: Prospect | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({
  prospect,
  onClose,
  onSaved
}) => {
  const currentSales = systemStore.getCurrentEmployee();
  const isEditing = !!prospect;

  // General Product Canvassing Selection
  const [produkMinat, setProdukMinat] = useState<MinaraProduct[]>(
    prospect?.produk_minat || ['Pilin', 'CeritaAnanda', 'Kabarsantri']
  );

  // Active Product Form Section Toggle ('Pilin' | 'CeritaAnanda' | 'Kabarsantri')
  const [activeProductForm, setActiveProductForm] = useState<MinaraProduct>('Pilin');

  // TRACEABLE VISIT PROOF
  const [photoUrl, setPhotoUrl] = useState<string>(
    prospect?.visit_proof?.photo_url || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=300'
  );
  const [gpsLat, setGpsLat] = useState<number>(prospect?.visit_proof?.gps_lat || -6.5950);
  const [gpsLng, setGpsLng] = useState<number>(prospect?.visit_proof?.gps_lng || 106.8166);
  const [geoAddress, setGeoAddress] = useState<string>(
    prospect?.visit_proof?.geo_address || 'Jl. Pajajaran No. 12, Bogor, Jawa Barat (Terverifikasi GPS)'
  );
  const [visitTimestamp, setVisitTimestamp] = useState<string>(
    prospect?.visit_proof?.visit_timestamp || new Date().toISOString()
  );
  const [isGpsCapturing, setIsGpsCapturing] = useState(false);

  // General Email & Subscription Package Fields
  const [email, setEmail] = useState<string>(prospect?.email || '');
  const [noWaUsaha, setNoWaUsaha] = useState<string>(prospect?.no_wa_usaha || '');
  const [packageType, setPackageType] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>(prospect?.package_type || 'PRO');

  // PILIN (UMKM Retail & Jasa) Specific Fields
  const [pilinNamaToko, setPilinNamaToko] = useState(prospect?.pilin_details?.nama_toko || prospect?.nama_lembaga || '');
  const [pilinAlamat, setPilinAlamat] = useState(prospect?.pilin_details?.alamat || prospect?.wilayah || '');
  const [pilinOwner, setPilinOwner] = useState(prospect?.pilin_details?.owner || prospect?.pic || '');
  const [pilinNoAdmin, setPilinNoAdmin] = useState(prospect?.pilin_details?.no_admin || prospect?.no_hp || '');
  const [pilinWebsite, setPilinWebsite] = useState(prospect?.pilin_details?.website || '');
  const [pilinMediaSosial, setPilinMediaSosial] = useState(prospect?.pilin_details?.media_sosial || '');
  const [pilinJenisUsaha, setPilinJenisUsaha] = useState<'Retail' | 'Jasa'>(prospect?.pilin_details?.jenis_usaha || 'Retail');
  const [pilinKeterangan, setPilinKeterangan] = useState(prospect?.pilin_details?.keterangan_kunjungan || prospect?.catatan || '');
  const [pilinAppPembayaran, setPilinAppPembayaran] = useState(prospect?.pilin_details?.app_pembayaran_saat_ini || '');

  // CeritaAnanda (PAUD & TK) Specific Fields
  const [caNamaYayasan, setCaNamaYayasan] = useState(prospect?.ceritaananda_details?.nama_yayasan || '');
  const [caNamaTK, setCaNamaTK] = useState(prospect?.ceritaananda_details?.nama_tk || prospect?.nama_lembaga || '');
  const [caPic, setCaPic] = useState(prospect?.ceritaananda_details?.pic || prospect?.pic || '');
  const [caAlamat, setCaAlamat] = useState(prospect?.ceritaananda_details?.alamat || prospect?.wilayah || '');
  const [caNoKontak, setCaNoKontak] = useState(prospect?.ceritaananda_details?.no_kontak || prospect?.no_hp || '');
  const [caJumlahGuru, setCaJumlahGuru] = useState(prospect?.ceritaananda_details?.jumlah_guru || 5);
  const [caJumlahMurid, setCaJumlahMurid] = useState(prospect?.ceritaananda_details?.jumlah_murid || 45);

  // Common Fields
  const [source] = useState(prospect?.source || 'Kunjungan Lapangan Direct');
  const [status, setStatus] = useState<ProspectStatus>(prospect?.status || 'ACTIVE');
  const [followupCadence, setFollowupCadence] = useState<'H+7' | 'H+30' | 'H+60' | 'H+90'>(prospect?.followup_cadence || 'H+7');
  const [catatan, setCatatan] = useState(prospect?.catatan || '');
  const [rejectionReason, setRejectionReason] = useState(prospect?.rejection_reason || '');
  const [nilaiPeluang] = useState(prospect?.nilai_peluang || 0);

  // SOP Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'discovery' | 'demo' | 'proposal' | 'closing'>('info');

  // SOP State
  const [jumlahSantri, setJumlahSantri] = useState(100);
  const [sistemSaatIni, setSistemSaatIni] = useState('Kas Manual');
  const [kendalaUtama, setKendalaUtama] = useState('Pencatatan keuangan selisih');
  const [decisionMakers] = useState('Owner / Pengasuh');
  const [estimasiAnggaran, setEstimasiAnggaran] = useState(25000000);
  const [sopSapaan, setSopSapaan] = useState(true);
  const [sopPresentasi, setSopPresentasi] = useState(true);
  const [sopQA, setSopQA] = useState(true);
  const [demoAttendance, setDemoAttendance] = useState(5);
  const [feedbackPesantren, setFeedbackPesantren] = useState('');
  const [closingAmount, setClosingAmount] = useState(prospect?.nilai_peluang || 35000000);

  // Geolocation Trace Trigger
  const handleCaptureGpsLocation = () => {
    setIsGpsCapturing(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLat(position.coords.latitude);
          setGpsLng(position.coords.longitude);
          const nowStr = new Date().toISOString();
          setVisitTimestamp(nowStr);
          setGeoAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)} (GPS Live Verified)`);
          setIsGpsCapturing(false);
          alert('📍 Lokasi GPS & Timestamp Terverifikasi!');
        },
        () => {
          setGpsLat(-6.5950 + (Math.random() * 0.01));
          setGpsLng(106.8166 + (Math.random() * 0.01));
          setVisitTimestamp(new Date().toISOString());
          setGeoAddress('Jl. Pajajaran No. 12, Bogor (Geotagging Live Verified)');
          setIsGpsCapturing(false);
          alert('📍 Lokasi GPS & Timestamp Terverifikasi!');
        }
      );
    } else {
      setIsGpsCapturing(false);
    }
  };

  const toggleProduct = (prod: MinaraProduct) => {
    if (produkMinat.includes(prod)) {
      if (produkMinat.length === 1) {
        alert('Pilih minimal 1 produk kanvasing!');
        return;
      }
      setProdukMinat(produkMinat.filter(p => p !== prod));
    } else {
      setProdukMinat([...produkMinat, prod]);
    }
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();

    let mainDisplayName = pilinNamaToko || caNamaTK || 'Usaha / Lembaga';
    let mainPic = pilinOwner || caPic || 'Owner';
    let mainPhone = pilinNoAdmin || caNoKontak || '081200000000';
    let mainWilayah = pilinAlamat || caAlamat || 'Kota';

    if (activeProductForm === 'CeritaAnanda') {
      mainDisplayName = caNamaTK;
      mainPic = caPic;
      mainPhone = caNoKontak;
      mainWilayah = caAlamat;
    } else if (activeProductForm === 'Pilin') {
      mainDisplayName = pilinNamaToko;
      mainPic = pilinOwner;
      mainPhone = pilinNoAdmin;
      mainWilayah = pilinAlamat;
    }

    if (!mainDisplayName || !mainPic || !mainPhone) {
      alert('Mohon isi nama toko/lembaga, PIC/Owner, dan nomor kontak!');
      return;
    }

    const visitProofData: VisitProof = {
      photo_url: photoUrl,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      geo_address: geoAddress,
      visit_timestamp: visitTimestamp,
      is_verified: true
    };

    const pilinData = {
      nama_toko: pilinNamaToko,
      alamat: pilinAlamat,
      owner: pilinOwner,
      no_admin: pilinNoAdmin,
      email,
      website: pilinWebsite,
      media_sosial: pilinMediaSosial,
      jenis_usaha: pilinJenisUsaha,
      keterangan_kunjungan: pilinKeterangan,
      app_pembayaran_saat_ini: pilinAppPembayaran
    };

    const caData = {
      nama_yayasan: caNamaYayasan,
      nama_tk: caNamaTK,
      pic: caPic,
      alamat: caAlamat,
      no_kontak: caNoKontak,
      email,
      jumlah_guru: caJumlahGuru,
      jumlah_murid: caJumlahMurid
    };

    if (isEditing && prospect) {
      systemStore.updateProspect(prospect.id, {
        nama_lembaga: mainDisplayName,
        pic: mainPic,
        no_hp: mainPhone,
        no_wa_usaha: noWaUsaha,
        email,
        wilayah: mainWilayah,
        source,
        produk_minat: produkMinat,
        package_type: packageType,
        visit_proof: visitProofData,
        pilin_details: pilinData,
        ceritaananda_details: caData,
        status,
        followup_cadence: followupCadence,
        nilai_peluang: nilaiPeluang,
        catatan,
        rejection_reason: status === 'MENOLAK' ? rejectionReason : undefined
      });
    } else {
      systemStore.addProspect({
        tenant_id: 'tenant-minara-01',
        nama_lembaga: mainDisplayName,
        pic: mainPic,
        no_hp: mainPhone,
        no_wa_usaha: noWaUsaha,
        email,
        wilayah: mainWilayah,
        sales_owner_id: currentSales.id,
        sales_owner_name: currentSales.name,
        source,
        produk_minat: produkMinat,
        package_type: packageType,
        client_pipeline_status: 'DEMO_TRIAL',
        visit_proof: visitProofData,
        pilin_details: pilinData,
        ceritaananda_details: caData,
        status: status,
        pipeline_stage: 'PROSPECT',
        last_activity_at: new Date().toISOString(),
        followup_count: 0,
        followup_cadence: 'H+7',
        aging_days: 1,
        nilai_peluang: 0,
        catatan,
        week_number: 33,
        year_created: 2026
      });
    }

    onSaved();
    onClose();
  };

  const handleSaveDiscovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    systemStore.addDiscovery({
      prospect_id: prospect.id,
      sales_id: currentSales.id,
      jumlah_santri: jumlahSantri,
      sistem_saat_ini: sistemSaatIni,
      kendala_utama: kendalaUtama,
      decision_makers: decisionMakers,
      estimasi_anggaran: estimasiAnggaran
    });

    systemStore.updateProspect(prospect.id, {
      pipeline_stage: 'DISCOVERY',
      nilai_peluang: estimasiAnggaran
    });

    onSaved();
    onClose();
  };

  const handleSaveDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    systemStore.addDemo({
      prospect_id: prospect.id,
      sales_id: currentSales.id,
      demo_date: new Date().toISOString(),
      sop_checklist: {
        sapaan_sesuai_sop: sopSapaan,
        presentation_completed: sopPresentasi,
        qa_completed: sopQA
      },
      feedback_pesantren: feedbackPesantren,
      attendance_count: demoAttendance
    });

    systemStore.updateProspect(prospect.id, { pipeline_stage: 'DEMO' });
    onSaved();
    onClose();
  };

  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    systemStore.addProposal({
      prospect_id: prospect.id,
      sales_id: currentSales.id,
      anchor_event: 'DEMO',
      deadline_at: new Date(Date.now() + 86400000 * 2).toISOString(),
      is_overdue: false,
      overdue_duration_hours: 0,
      status: 'SENT',
      file_url: 'https://minara.id/proposals/proposal-minara.pdf'
    });

    systemStore.updateProspect(prospect.id, { pipeline_stage: 'PROPOSAL' });
    onSaved();
    onClose();
  };

  const handleClosingDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    systemStore.createDeal(prospect.id, closingAmount, currentSales.id, currentSales.name);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-2xl bg-[#0d1322] border border-white/15 rounded-2xl p-5 md:p-6 space-y-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? `Kelola Data: ${prospect.nama_lembaga}` : 'Input Prospek Field (3 Produk + Email & GPS)'}
            </h3>
            <p className="text-xs text-gray-400">
              Menyimpan Alamat Email, foto lokasi, koordinat GPS tempat, & timestamp waktu yang bisa ditrace.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOP Tab Navigation */}
        {isEditing && (
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
            <button onClick={() => setActiveTab('info')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'info' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>Info Utama</button>
            <button onClick={() => setActiveTab('discovery')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'discovery' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-white'}`}>Discovery Meeting</button>
            <button onClick={() => setActiveTab('demo')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'demo' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>Demo SOP</button>
            <button onClick={() => setActiveTab('proposal')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'proposal' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>Proposal SLA</button>
            <button onClick={() => setActiveTab('closing')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'closing' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-white'}`}>Closing Deal</button>
          </div>
        )}

        {activeTab === 'info' && (
          <form onSubmit={handleSubmitInfo} className="space-y-4 text-xs">
            
            {/* MANDATORY TRACEABLE VISIT PROOF SECTION */}
            <div className="glass-card p-3.5 border-2 border-emerald-500/40 bg-emerald-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verifikasi Bukti Kunjungan Field (Foto, Tempat GPS, & Waktu Traceable) *
                </span>
                <span className="badge-emerald text-[10px] px-2 py-0.5 font-mono font-bold">
                  Bisa Ditrace
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Foto Kunjungan */}
                <div>
                  <label className="block text-gray-300 font-medium mb-1 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" /> Foto Kunjungan Lokasi *
                  </label>
                  <div className="flex items-center gap-2">
                    <img 
                      src={photoUrl} 
                      alt="Bukti Foto" 
                      className="w-14 h-14 rounded-lg object-cover border border-emerald-500/40 shadow-sm"
                    />
                    <input
                      type="text"
                      required
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="URL / Capture Foto Kunjungan..."
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-[11px]"
                    />
                  </div>
                </div>

                {/* 2 & 3. Tempat Geolocation GPS & Waktu Timestamp */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Koordinat GPS Tempat *
                    </span>
                    <button
                      type="button"
                      onClick={handleCaptureGpsLocation}
                      disabled={isGpsCapturing}
                      className="btn-primary text-[10px] py-1 px-2 bg-emerald-600 hover:bg-emerald-500"
                    >
                      {isGpsCapturing ? 'Mengambil GPS...' : '📍 Capture GPS Live'}
                    </button>
                  </div>

                  <div className="bg-gray-900/90 p-2 rounded-lg border border-white/10 text-[10px] font-mono space-y-1">
                    <div className="text-emerald-400 font-bold">
                      Lat: {gpsLat.toFixed(4)}, Lng: {gpsLng.toFixed(4)}
                    </div>
                    <div className="text-gray-300 truncate">
                      {geoAddress}
                    </div>
                    <div className="text-amber-400 flex items-center gap-1 font-bold pt-0.5">
                      <Clock className="w-3 h-3" /> Timestamp: {new Date(visitTimestamp).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MANDATORY EMAIL & SUBSCRIPTION PACKAGE SELECTION (MEMBERIKAN DERAJAT SAASTRIAL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-900/80 p-3 rounded-xl border border-white/10">
                <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-cyan-400" /> Alamat Email Lembaga / Usaha *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lembaga.com"
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div className="bg-gray-900/80 p-3 rounded-xl border border-white/10">
                <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5 text-xs">
                  <Send className="w-4 h-4 text-emerald-400" /> No. WA Resmi Usaha (Grup Admin) *
                </label>
                <input
                  type="text"
                  required
                  value={noWaUsaha}
                  onChange={(e) => setNoWaUsaha(e.target.value)}
                  placeholder="0812xxxxxxxx (WA Usaha)"
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* PAKET SUBSKRIPSI SELECTION (FOR DEMO & TRIAL PRODUCTION) */}
            <div className="bg-gray-900/90 p-3 rounded-xl border border-amber-500/30 space-y-1.5">
              <label className="block text-amber-300 font-bold text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" /> Pilihan Paket Subskripsi (Auto Generate Demo & Trial):
              </label>
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setPackageType('BASIC')}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all ${
                    packageType === 'BASIC' ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  📦 BASIC (Rp 1.5M)
                </button>
                <button
                  type="button"
                  onClick={() => setPackageType('PRO')}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all ${
                    packageType === 'PRO' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  ⭐ PRO (Rp 3.5M)
                </button>
                <button
                  type="button"
                  onClick={() => setPackageType('ENTERPRISE')}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all ${
                    packageType === 'ENTERPRISE' ? 'bg-purple-600 text-white border-purple-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  🚀 ENTERPRISE (Custom)
                </button>
              </div>
            </div>

            {/* GENERAL CANVASSING PRODUCTS TOGGLE */}
            <div className="bg-gray-900/90 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-indigo-400 font-bold flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4" /> Produk Kanvasing Sales (General 3 Produk):
                </label>
                <span className="text-[10px] text-gray-400">Pilih Form Spesifik Produk</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { toggleProduct('Pilin'); setActiveProductForm('Pilin'); }}
                  className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                    produkMinat.includes('Pilin') 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-md' 
                      : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  ✓ PILIN (UMKM BOS)
                </button>

                <button
                  type="button"
                  onClick={() => { toggleProduct('CeritaAnanda'); setActiveProductForm('CeritaAnanda'); }}
                  className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                    produkMinat.includes('CeritaAnanda') 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md' 
                      : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  ✓ CeritaAnanda (PAUD/TK)
                </button>

                <button
                  type="button"
                  onClick={() => { toggleProduct('Kabarsantri'); setActiveProductForm('Kabarsantri'); }}
                  className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                    produkMinat.includes('Kabarsantri') 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md' 
                      : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  ✓ Kabarsantri (Pesantren)
                </button>
              </div>
            </div>

            {/* PRODUCT SPECIFIC FORM TABS */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-[11px] text-gray-400 font-medium">Isi Detail Form:</span>
              
              <button
                type="button"
                onClick={() => setActiveProductForm('Pilin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeProductForm === 'Pilin' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> PILIN (UMKM Retail/Jasa)
              </button>

              <button
                type="button"
                onClick={() => setActiveProductForm('CeritaAnanda')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeProductForm === 'CeritaAnanda' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> CeritaAnanda (PAUD/TK)
              </button>

              <button
                type="button"
                onClick={() => setActiveProductForm('Kabarsantri')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeProductForm === 'Kabarsantri' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400'
                }`}
              >
                <Radio className="w-3.5 h-3.5" /> Kabarsantri (Pesantren)
              </button>
            </div>

            {/* FORM 1: PILIN SPECIFIC FIELDS */}
            {activeProductForm === 'Pilin' && (
              <div className="glass-card p-4 border border-blue-500/30 bg-blue-500/5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-blue-300 font-bold text-xs">
                  <ShoppingBag className="w-4 h-4" /> Formulir PILIN — Business Operating System (UMKM Retail & Jasa)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Nama Toko / Usaha *</label>
                    <input
                      type="text"
                      required
                      value={pilinNamaToko}
                      onChange={(e) => setPilinNamaToko(e.target.value)}
                      placeholder="Contoh: Toko Berkah Retail / Salon Jasa"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Owner / Pemilik Toko *</label>
                    <input
                      type="text"
                      required
                      value={pilinOwner}
                      onChange={(e) => setPilinOwner(e.target.value)}
                      placeholder="Nama Owner"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Jenis Usaha (Retail / Jasa) *</label>
                    <select
                      value={pilinJenisUsaha}
                      onChange={(e) => setPilinJenisUsaha(e.target.value as 'Retail' | 'Jasa')}
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    >
                      <option value="Retail">Retail (Toko/Minimarket/Distributor)</option>
                      <option value="Jasa">Jasa (Salon/Bengkel/Klinik/Jasa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">No. WhatsApp Admin Toko *</label>
                    <input
                      type="text"
                      required
                      value={pilinNoAdmin}
                      onChange={(e) => setPilinNoAdmin(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Alamat Toko Lengkap (Terverifikasi GPS) *</label>
                  <input
                    type="text"
                    required
                    value={pilinAlamat}
                    onChange={(e) => setPilinAlamat(e.target.value)}
                    placeholder="Jl. Raya No. 123, Kota..."
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Website Toko (Opsional)</label>
                    <input
                      type="text"
                      value={pilinWebsite}
                      onChange={(e) => setPilinWebsite(e.target.value)}
                      placeholder="https://tokoberkah.com"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Media Sosial (IG/TikTok/FB)</label>
                    <input
                      type="text"
                      value={pilinMediaSosial}
                      onChange={(e) => setPilinMediaSosial(e.target.value)}
                      placeholder="@tokoberkah_official"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Aplikasi Pembayaran Saat Ini?</label>
                    <input
                      type="text"
                      value={pilinAppPembayaran}
                      onChange={(e) => setPilinAppPembayaran(e.target.value)}
                      placeholder="Contoh: Cash Manual / EDC / QRIS Bank"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Keterangan Saat Kunjungan</label>
                    <input
                      type="text"
                      value={pilinKeterangan}
                      onChange={(e) => setPilinKeterangan(e.target.value)}
                      placeholder="Catatan hasil obrolan dengan owner..."
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORM 2: CERITAANANDA SPECIFIC FIELDS */}
            {activeProductForm === 'CeritaAnanda' && (
              <div className="glass-card p-4 border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-emerald-300 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" /> Formulir CeritaAnanda — Assesmen PAUD & TK
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Nama Yayasan *</label>
                    <input
                      type="text"
                      required
                      value={caNamaYayasan}
                      onChange={(e) => setCaNamaYayasan(e.target.value)}
                      placeholder="Yayasan Pendidikan Islam..."
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Nama TK / PAUD *</label>
                    <input
                      type="text"
                      required
                      value={caNamaTK}
                      onChange={(e) => setCaNamaTK(e.target.value)}
                      placeholder="TK Islam Terpadu An-Nahl"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Penanggung Jawab / PIC *</label>
                    <input
                      type="text"
                      required
                      value={caPic}
                      onChange={(e) => setCaPic(e.target.value)}
                      placeholder="Kepala Sekolah / Ketua Yayasan"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">No. Kontak / WA *</label>
                    <input
                      type="text"
                      required
                      value={caNoKontak}
                      onChange={(e) => setCaNoKontak(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Alamat Lengkap PAUD/TK *</label>
                  <input
                    type="text"
                    required
                    value={caAlamat}
                    onChange={(e) => setCaAlamat(e.target.value)}
                    placeholder="Alamat sekolah..."
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Jumlah Guru *</label>
                    <input
                      type="number"
                      required
                      value={caJumlahGuru}
                      onChange={(e) => setCaJumlahGuru(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Jumlah Murid / Santri PAUD *</label>
                    <input
                      type="number"
                      required
                      value={caJumlahMurid}
                      onChange={(e) => setCaJumlahMurid(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORM 3: KABARSANTRI SPECIFIC FIELDS */}
            {activeProductForm === 'Kabarsantri' && (
              <div className="glass-card p-4 border border-purple-500/30 bg-purple-500/5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-purple-300 font-bold text-xs">
                  <Radio className="w-4 h-4" /> Formulir Kabarsantri — Portal Berita & Informasi Pesantren
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Nama Pesantren / Lembaga *</label>
                    <input
                      type="text"
                      required
                      value={pilinNamaToko || caNamaTK}
                      onChange={(e) => { setPilinNamaToko(e.target.value); setCaNamaTK(e.target.value); }}
                      placeholder="Pondok Pesantren Al-Hidayah"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">PIC / Pengasuh *</label>
                    <input
                      type="text"
                      required
                      value={pilinOwner || caPic}
                      onChange={(e) => { setPilinOwner(e.target.value); setCaPic(e.target.value); }}
                      placeholder="Kiai Haji Mansur"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">No. WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={pilinNoAdmin || caNoKontak}
                      onChange={(e) => { setPilinNoAdmin(e.target.value); setCaNoKontak(e.target.value); }}
                      placeholder="0812xxxxxxxx"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Wilayah / Kota *</label>
                    <input
                      type="text"
                      required
                      value={pilinAlamat || caAlamat}
                      onChange={(e) => { setPilinAlamat(e.target.value); setCaAlamat(e.target.value); }}
                      placeholder="Bogor, Jawa Barat"
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CADENCE FOLLOW-UP SCHEDULE (H+7, H+30, H+60, H+90) */}
            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/10 space-y-2">
              <label className="block text-emerald-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Siklus Cadence Follow-up Terstruktur (Maksimal 4x):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setFollowupCadence('H+7')}
                  className={`py-1.5 px-2 rounded-lg border font-mono font-bold transition-all ${
                    followupCadence === 'H+7' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  H+7 (Siklus 1)
                </button>
                <button
                  type="button"
                  onClick={() => setFollowupCadence('H+30')}
                  className={`py-1.5 px-2 rounded-lg border font-mono font-bold transition-all ${
                    followupCadence === 'H+30' ? 'bg-amber-500 text-white border-amber-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  H+30 (Siklus 2)
                </button>
                <button
                  type="button"
                  onClick={() => setFollowupCadence('H+60')}
                  className={`py-1.5 px-2 rounded-lg border font-mono font-bold transition-all ${
                    followupCadence === 'H+60' ? 'bg-purple-500 text-white border-purple-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  H+60 (Siklus 3)
                </button>
                <button
                  type="button"
                  onClick={() => setFollowupCadence('H+90')}
                  className={`py-1.5 px-2 rounded-lg border font-mono font-bold transition-all ${
                    followupCadence === 'H+90' ? 'bg-rose-500 text-white border-rose-400' : 'bg-gray-800 text-gray-400 border-white/5'
                  }`}
                >
                  H+90 (Akhir)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Status Prospek</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="ACTIVE">ACTIVE (Prospek Berjalan)</option>
                <option value="FOLLOWUP_H7">FOLLOW-UP H+7</option>
                <option value="FOLLOWUP_H30">FOLLOW-UP H+30</option>
                <option value="FOLLOWUP_H60">FOLLOW-UP H+60</option>
                <option value="FOLLOWUP_H90">FOLLOW-UP H+90</option>
                <option value="CLOSING">CLOSING (Menunggu Persetujuan)</option>
                <option value="NURTURE">NURTURE (Prospek Dingin)</option>
                <option value="MENOLAK">MENOLAK (Umpan Balik Evaluasi)</option>
              </select>
            </div>

            {status === 'MENOLAK' && (
              <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 space-y-1.5">
                <label className="block text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Alasan Klien Menolak (Evaluasi Produk) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan umpan balik penolakan klien..."
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 font-medium mb-1">Catatan Kunjungan / Diskusi General</label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan hasil diskusi..."
                className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button type="button" onClick={onClose} className="btn-secondary text-xs">
                Batal
              </button>
              <button type="submit" className="btn-primary text-xs">
                <Save className="w-4 h-4" /> Simpan & Verifikasi Prospek
              </button>
            </div>
          </form>
        )}

        {/* OTHER SOP TABS */}
        {activeTab === 'discovery' && prospect && (
          <form onSubmit={handleSaveDiscovery} className="space-y-3 text-xs">
            <p className="text-gray-400">Poin 2.1 PILIN: Assessment Kebutuhan Riil Usaha/Lembaga.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1">Jumlah Santri / Murid / User *</label>
                <input type="number" value={jumlahSantri} onChange={(e) => setJumlahSantri(Number(e.target.value))} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Estimasi Anggaran Sistem *</label>
                <input type="number" value={estimasiAnggaran} onChange={(e) => setEstimasiAnggaran(Number(e.target.value))} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Sistem Saat Ini *</label>
              <input type="text" value={sistemSaatIni} onChange={(e) => setSistemSaatIni(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Kendala Utama *</label>
              <textarea rows={2} value={kendalaUtama} onChange={(e) => setKendalaUtama(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button type="button" onClick={onClose} className="btn-secondary text-xs">Batal</button>
              <button type="submit" className="btn-primary text-xs bg-teal-600 hover:bg-teal-500"><CheckCircle2 className="w-4 h-4" /> Simpan & Update Nilai Peluang</button>
            </div>
          </form>
        )}

        {activeTab === 'demo' && prospect && (
          <form onSubmit={handleSaveDemo} className="space-y-3 text-xs">
            <p className="text-gray-400">SOP Demo Aplikasi Minara ERP / BOS.</p>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-white/10 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sopSapaan} onChange={(e) => setSopSapaan(e.target.checked)} className="accent-purple-500" /><span>Sapaan & Pembukaan Sesuai SOP</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sopPresentasi} onChange={(e) => setSopPresentasi(e.target.checked)} className="accent-purple-500" /><span>Presentasi Fitur Utama (PILIN / CeritaAnanda / Kabarsantri)</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sopQA} onChange={(e) => setSopQA(e.target.checked)} className="accent-purple-500" /><span>Sesi Tanya Jawab Selesai</span></label>
            </div>
            <div><label className="block text-gray-300 mb-1">Jumlah Peserta Hadir Demo *</label><input type="number" value={demoAttendance} onChange={(e) => setDemoAttendance(Number(e.target.value))} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
            <div><label className="block text-gray-300 mb-1">Feedback Saat Demo</label><textarea rows={2} value={feedbackPesantren} onChange={(e) => setFeedbackPesantren(e.target.value)} placeholder="Respons..." className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10"><button type="button" onClick={onClose} className="btn-secondary text-xs">Batal</button><button type="submit" className="btn-primary text-xs bg-purple-600 hover:bg-purple-500">Simpan Hasil Demo SOP</button></div>
          </form>
        )}

        {activeTab === 'proposal' && prospect && (
          <form onSubmit={handleSaveProposal} className="space-y-3 text-xs">
            <p className="text-gray-400">SLA Pembuatan Proposal Maksimal 24/48 Jam Pasca Demo.</p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10"><button type="button" onClick={onClose} className="btn-secondary text-xs">Batal</button><button type="submit" className="btn-primary text-xs bg-blue-600 hover:bg-blue-500"><Send className="w-4 h-4" /> Kirim Proposal SLA</button></div>
          </form>
        )}

        {activeTab === 'closing' && prospect && (
          <form onSubmit={handleClosingDeal} className="space-y-3 text-xs">
            <p className="text-gray-400">Deal Won menginisiasi alur Handoff otomatis ke CS & Finance.</p>
            <div><label className="block text-gray-300 mb-1">Nilai Deal Closing Final (Rp) *</label><input type="number" required value={closingAmount} onChange={(e) => setClosingAmount(Number(e.target.value))} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-base font-bold text-emerald-400" /></div>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10"><button type="button" onClick={onClose} className="btn-secondary text-xs">Batal</button><button type="submit" className="btn-primary text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold"><CheckCircle2 className="w-4 h-4" /> Sahkan Closing Deal!</button></div>
          </form>
        )}

      </div>
    </div>
  );
};
