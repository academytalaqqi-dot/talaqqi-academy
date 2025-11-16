'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Users, MapPin, Phone, Clock, Star, Instagram, MessageCircle, Facebook, Youtube, MessageSquare, Send } from 'lucide-react';

interface ParticipationTier {
  nama: string;
  harga: number;
  linkGrupWa: string;
  benefit?: string[];
}

interface PertanyaanTambahan {
  pertanyaan: string;
  tipeJawaban: 'text' | 'pilihan';
  opsiPilihan?: string[];
}

interface Sponsor {
  namaSponsor: string;
  logoSponsor: string;
  linkWebSponsor: string;
}

interface Event {
  id: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string;
  tema: string;
  deskripsi?: string;
  waktuEvent: string;
  jenisKepesertaan: string;
  benefit: string;
  pertanyaanTambahan?: string;
  sponsor?: string;
  flyerImage: string;
  statusEvent: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<{
    namaPendaftar: string;
    kotaDomisili: string;
    umur: string;
    noWhatsapp: string;
    selectedTier: string;
    kodeVoucher: string;
    buktiTransfer: string;
    jawabanTambahan: { [key: string]: string };
    agreeStatement: boolean;
  }>({
    namaPendaftar: '',
    kotaDomisili: '',
    umur: '',
    noWhatsapp: '',
    selectedTier: '',
    kodeVoucher: '',
    buktiTransfer: '',
    jawabanTambahan: {},
    agreeStatement: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredTier, setRegisteredTier] = useState<ParticipationTier | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherJenis, setVoucherJenis] = useState<'persen' | 'rupiah'>('persen');
  const [voucherError, setVoucherError] = useState('');
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [bankInfo, setBankInfo] = useState<{
    namaLembaga: string;
    namaBank: string;
    nomorRekening: string;
    namaPemilik: string;
  } | null>(null);
  const [namaLembaga, setNamaLembaga] = useState('Talaqqi Academy');
  const [logoLembaga, setLogoLembaga] = useState('');
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    telegram: '',
    facebook: '',
    threads: '',
    youtube: '',
    whatsappChannel: ''
  });
  const [landingRedaction, setLandingRedaction] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchBankInfo();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.landingPageRedaction) {
        setLandingRedaction(data.landingPageRedaction);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchBankInfo = async () => {
    try {
      const response = await fetch('/api/referensi');
      const data = await response.json();
      
      console.log('Bank info data:', data); // Debug
      
      // API returns single object, not array
      if (data && data.namaBank && data.nomorRekening) {
        console.log('Setting bank info'); // Debug
        setBankInfo({
          namaLembaga: data.namaLembaga,
          namaBank: data.namaBank,
          nomorRekening: data.nomorRekening,
          namaPemilik: data.namaPemilik
        });
        // Set nama lembaga untuk header
        if (data.namaLembaga) {
          setNamaLembaga(data.namaLembaga);
        }
        // Set logo lembaga untuk header
        if (data.logo) {
          setLogoLembaga(data.logo);
        }
        // Set social media untuk footer
        setSocialMedia({
          instagram: data.instagram || '',
          telegram: data.telegram || '',
          facebook: data.facebook || '',
          threads: data.threads || '',
          youtube: data.youtube || '',
          whatsappChannel: data.whatsappChannel || ''
        });
      } else {
        console.log('Bank info validation failed - missing required fields'); // Debug
      }
    } catch (error) {
      console.error('Error fetching bank info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
    const selectedTierData = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
    
    if (!selectedTierData) {
      alert('Pilih jenis kepesertaan terlebih dahulu');
      return;
    }

    // Validate agreement statement for free tiers
    if (selectedTierData.harga === 0 && !formData.agreeStatement) {
      alert('Silakan cek pernyataan bahwa Anda sudah mengisi formulir dengan benar dan jujur');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate final price with discount
      const discountAmount = voucherJenis === 'persen' 
        ? selectedTierData.harga * voucherDiscount / 100
        : voucherDiscount;
      const finalPrice = Math.max(0, selectedTierData.harga - discountAmount);
      
      const response = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaPendaftar: formData.namaPendaftar,
          kotaDomisili: formData.kotaDomisili,
          umur: parseInt(formData.umur),
          noWhatsapp: formData.noWhatsapp,
          eventId: selectedEvent.id,
          jenisKepesertaan: selectedTierData.nama,
          nominalPembayaran: finalPrice,
          kodeVoucher: voucherDiscount > 0 ? formData.kodeVoucher : '',
          buktiTransfer: formData.buktiTransfer,
          jawabanTambahan: Object.keys(formData.jawabanTambahan).length > 0 
            ? JSON.stringify(formData.jawabanTambahan) 
            : null,
        }),
      });

      if (response.ok) {
        // Show success modal
        setRegistrationSuccess(true);
        setRegisteredTier(selectedTierData);
        
        // Reset form
        setFormData({
          namaPendaftar: '',
          kotaDomisili: '',
          umur: '',
          noWhatsapp: '',
          selectedTier: '',
          kodeVoucher: '',
          buktiTransfer: '',
          jawabanTambahan: {},
          agreeStatement: false
        });
      } else {
        alert('Gagal mendaftar, silakan coba lagi');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Gagal mendaftar, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to convert URLs in text to clickable links
  const makeLinksClickable = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline hover:underline-offset-2"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleVoucherCheck = async () => {
    if (!formData.kodeVoucher.trim() || !selectedEvent) {
      setVoucherError('');
      setVoucherDiscount(0);
      return;
    }

    setIsCheckingVoucher(true);
    setVoucherError('');

    try {
      const response = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          kodeVoucher: formData.kodeVoucher,
          eventId: selectedEvent.id
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setVoucherDiscount(data.voucher.potongan);
        setVoucherJenis(data.voucher.jenisPotongan || 'persen');
        setVoucherError('');
      } else {
        setVoucherError(data.error || 'Voucher tidak valid');
        setVoucherDiscount(0);
        setVoucherJenis('persen');
      }
    } catch (error) {
      console.error('Error checking voucher:', error);
      setVoucherError('Gagal memeriksa voucher');
      setVoucherDiscount(0);
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {logoLembaga ? (
                <img src={logoLembaga} alt="Logo" className="w-12 h-12 object-contain rounded-full overflow-hidden border-2 border-white" />
              ) : (
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-emerald-800 font-bold text-xl">TA</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{namaLembaga}</h1>
                <p className="text-emerald-100 text-sm">Lembaga Pendidikan Islam Online</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-white text-emerald-700 border-white hover:bg-emerald-50"
              onClick={() => window.location.href = '/admin/login'}
            >
              Login Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-emerald-800 mb-4">
            Selamat Datang di {namaLembaga}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan kami untuk mendapatkan ilmu agama yang berkualitas 
            melalui kelas online interaktif bersama pemateri berpengalaman.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-yellow-400 text-emerald-800 px-6 py-3 rounded-lg font-semibold">
              <Users className="inline-block w-5 h-5 mr-2" />
              1000+ Peserta
            </div>
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">
              <CalendarDays className="inline-block w-5 h-5 mr-2" />
              50+ Event
            </div>
          </div>
        </div>
      </section>

      {/* Landing Redaction Section */}
      {landingRedaction && (
        <section className="py-12 px-4 bg-emerald-50">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-lg p-8 shadow-md">
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: landingRedaction }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-emerald-800 mb-8">
            Event Tersedia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const pemateriList = JSON.parse(event.pemateri || '[]');
              const waktuList = JSON.parse(event.waktuEvent || '[]');
              const tiersList: ParticipationTier[] = JSON.parse(event.jenisKepesertaan || '[]');
              const sponsorList: Sponsor[] = event.sponsor ? JSON.parse(event.sponsor) : [];
              const minPrice = tiersList.length > 0 ? Math.min(...tiersList.map(t => t.harga)) : 0;
              const maxPrice = tiersList.length > 0 ? Math.max(...tiersList.map(t => t.harga)) : 0;
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.flyerImage && (
                    <div className="w-full h-64 bg-gradient-to-br from-emerald-100 to-yellow-50 flex items-center justify-center overflow-hidden">
                      <img 
                        src={event.flyerImage} 
                        alt={event.namaEvent}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-emerald-800">{event.namaEvent}</CardTitle>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {event.kodeEvent}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{event.tema}</p>
                    {event.deskripsi && (
                      <div 
                        className="text-xs text-gray-500 mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: event.deskripsi }}
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>{pemateriList.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>
                          {waktuList.length > 0 && typeof waktuList[0] === 'object' && waktuList[0].hari ? (
                            <>
                              {waktuList[0].hari && <span>{waktuList[0].hari}, </span>}
                              {waktuList[0].tanggal && <span>{waktuList[0].tanggal} </span>}
                              {waktuList[0].jam && <span>{waktuList[0].jam}</span>}
                            </>
                          ) : (
                            waktuList[0]
                          )}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {/* Tier badges removed from event card per UI change - price moved into benefit boxes below */}
                        
                        {/* Show benefits for each tier separately */}
                        {tiersList.length > 0 && (() => {
                          const tiersWithBenefits = tiersList.filter(tier => tier.benefit && Array.isArray(tier.benefit) && tier.benefit.length > 0);
                          
                          if (tiersWithBenefits.length === 0) {
                            return null;
                          }
                          
                          // If only one tier with benefits, show it directly
                          if (tiersWithBenefits.length === 1) {
                            const tier = tiersWithBenefits[0];
                            return (
                              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-800 mb-1.5">
                                  Benefit ({tier.nama}):
                                </p>
                                <ul className="space-y-1">
                                  {(tier.benefit || []).slice(0, 3).map((benefit: string, bIdx: number) => (
                                    <li key={bIdx} className="text-xs text-emerald-700 flex items-start gap-1.5">
                                      <span className="text-emerald-600 mt-0.5">✓</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                  {(tier.benefit || []).length > 3 && (
                                    <li className="text-xs text-emerald-600 font-medium">
                                      +{(tier.benefit || []).length - 3} benefit lainnya
                                    </li>
                                  )}
                                </ul>
                              </div>
                            );
                          }
                          
                          // If multiple tiers with benefits, show each tier's benefits
                          return (
                            <div className="space-y-2">
                              {tiersWithBenefits.map((tier, tIdx) => (
                                <div key={tIdx} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                  <div className="flex items-start justify-between">
                                    <p className="text-xs font-semibold text-emerald-800 mb-1.5">
                                      Benefit ({tier.nama}):
                                    </p>
                                    <p className="text-xs font-semibold text-emerald-700 mb-1.5">
                                      {tier.harga === 0 ? 'Gratis' : formatRupiah(tier.harga)}
                                    </p>
                                  </div>
                                  <ul className="space-y-1">
                                    {(tier.benefit || []).slice(0, 3).map((benefit: string, bIdx: number) => (
                                      <li key={bIdx} className="text-xs text-emerald-700 flex items-start gap-1.5">
                                        <span className="text-emerald-600 mt-0.5">✓</span>
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                    {(tier.benefit || []).length > 3 && (
                                      <li className="text-xs text-emerald-600 font-medium">
                                        +{(tier.benefit || []).length - 3} benefit lainnya
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Sponsor Section */}
                      {sponsorList.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">Didukung oleh:</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            {sponsorList.map((sponsor, idx) => (
                              <a
                                key={idx}
                                href={sponsor.linkWebSponsor}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-75 transition-opacity"
                                title={sponsor.namaSponsor}
                              >
                                {sponsor.logoSponsor && (
                                  <img
                                    src={sponsor.logoSponsor}
                                    alt={sponsor.namaSponsor}
                                    className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                                  />
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Price and Button at bottom */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-end">
                          <Dialog open={selectedEvent?.id === event.id} onOpenChange={(open) => {
                            if (!open) {
                              setSelectedEvent(null);
                              setRegistrationSuccess(false);
                              setRegisteredTier(null);
                            } else {
                              setSelectedEvent(event);
                            }
                          }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="lg"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Daftar Sekarang
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="space-y-3 pb-0 border-b-0">
                              <DialogTitle className="text-2xl font-bold text-emerald-800">
                                Form Pendaftaran
                              </DialogTitle>
                              
                              {/* Event Details with Yellow Background */}
                              {selectedEvent && (
                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-400 rounded-lg p-4 space-y-3">
                                  <h3 className="font-bold text-yellow-900 text-lg flex items-center gap-2">
                                    <span className="text-2xl">📋</span>
                                    Informasi Event
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="font-semibold text-yellow-900">Event:</span>
                                      <p className="text-yellow-800 font-medium">{selectedEvent.namaEvent}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-yellow-900">Tema:</span>
                                      <p className="text-yellow-800">{selectedEvent.tema}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-yellow-900">Pemateri:</span>
                                      <p className="text-yellow-800">
                                        {JSON.parse(selectedEvent.pemateri || '[]').join(', ')}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-yellow-900">Waktu:</span>
                                      <p className="text-yellow-800">
                                        {(() => {
                                          const waktuList = JSON.parse(selectedEvent.waktuEvent || '[]');
                                          if (waktuList.length > 0) {
                                            const waktu = waktuList[0];
                                            if (typeof waktu === 'object' && waktu.hari) {
                                              return `${waktu.hari ? waktu.hari + ', ' : ''}${waktu.tanggal || ''} ${waktu.jam || ''}`.trim();
                                            }
                                            return waktu;
                                          }
                                          return '';
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedEvent.deskripsi && (
                                    <div className="pt-3 border-t-2 border-yellow-300">
                                      <span className="font-semibold text-yellow-900">Deskripsi:</span>
                                      <div 
                                        className="mt-2 text-xs text-yellow-800 prose prose-sm max-w-none prose-a:text-yellow-700 prose-a:underline"
                                        dangerouslySetInnerHTML={{ __html: selectedEvent.deskripsi }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogHeader>
                            <div className="pb-4 border-b"></div>
                            
                            {registrationSuccess ? (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Star className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-green-600 mb-2">
                                  Pendaftaran Berhasil!
                                </h3>
                                
                                {registeredTier && registeredTier.harga === 0 ? (
                                  // Gratis - Tombol Gabung Grup WhatsApp
                                  <>
                                    <p className="text-gray-600 mb-6">
                                      Terima kasih telah mendaftar! Silakan bergabung dengan grup WhatsApp kami.
                                    </p>
                                    <Button
                                      onClick={() => {
                                        // Save WhatsApp link before resetting state
                                        const whatsappLink = registeredTier?.linkGrupWa;
                                        
                                        // Close dialog/modal first
                                        setSelectedEvent(null);
                                        setRegistrationSuccess(false);
                                        setRegisteredTier(null);
                                        
                                        // Open WhatsApp after a tiny delay to ensure dialog closes
                                        setTimeout(() => {
                                          if (whatsappLink) {
                                            window.open(whatsappLink, '_blank');
                                          }
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 100);
                                      }}
                                      className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                      Gabung Grup WhatsApp
                                    </Button>
                                  </>
                                ) : (
                                  // Berbayar - Menunggu Validasi
                                  <>
                                    <p className="text-gray-600 mb-2">
                                      Terima kasih telah mendaftar!
                                    </p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                      <p className="text-sm text-yellow-800">
                                        <strong>Menunggu Validasi Admin</strong>
                                      </p>
                                      <p className="text-xs text-yellow-700 mt-1">
                                        Pendaftaran Anda sedang divalidasi oleh admin. Link grup WhatsApp akan dikirimkan via WhatsApp setelah pembayaran Anda disetujui.
                                      </p>
                                    </div>
                                    <Button
                                      onClick={() => {
                                        // Close both modals
                                        setRegistrationSuccess(false);
                                        setSelectedEvent(null);
                                        setRegisteredTier(null);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    >
                                      Tutup
                                    </Button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                  <Label htmlFor="namaPendaftar">Nama Lengkap</Label>
                                  <Input
                                    id="namaPendaftar"
                                    value={formData.namaPendaftar}
                                    onChange={(e) => setFormData({...formData, namaPendaftar: e.target.value})}
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="kotaDomisili">Kota Domisili</Label>
                                  <Input
                                    id="kotaDomisili"
                                    value={formData.kotaDomisili}
                                    onChange={(e) => setFormData({...formData, kotaDomisili: e.target.value})}
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="umur">Usia</Label>
                                  <Input
                                    id="umur"
                                    type="number"
                                    value={formData.umur}
                                    onChange={(e) => setFormData({...formData, umur: e.target.value})}
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="noWhatsapp">No. WhatsApp</Label>
                                  <Input
                                    id="noWhatsapp"
                                    value={formData.noWhatsapp}
                                    onChange={(e) => setFormData({...formData, noWhatsapp: e.target.value})}
                                    required
                                  />
                                </div>
                                
                                {/* Benefit selection (moved under WhatsApp) */}
                                {selectedEvent && (() => {
                                  const tiers: ParticipationTier[] = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  return tiers.length > 0 && (
                                    <div>
                                      <Label className="text-sm">Benefit yang anda inginkan ?</Label>
                                      <div className="space-y-2 mt-2">
                                        {tiers.map((tier, idx) => {
                                          const isSelected = formData.selectedTier === tier.nama;
                                          return (
                                            <label
                                              key={idx}
                                              className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                                isSelected
                                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                                                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                              }`}
                                            >
                                              <input
                                                type="radio"
                                                name="selectedTier"
                                                value={tier.nama}
                                                checked={isSelected}
                                                onChange={(e) => setFormData({ ...formData, selectedTier: e.target.value })}
                                                className="w-4 h-4 text-emerald-600 mt-1"
                                              />
                                              <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                  <span className="font-medium">{tier.nama}</span>
                                                  <span className="text-emerald-600 font-semibold">{tier.harga === 0 ? 'Gratis' : formatRupiah(tier.harga)}</span>
                                                </div>
                                                {tier.benefit && tier.benefit.length > 0 && (
                                                  <p className="text-xs text-gray-500 mt-1">✓ {tier.benefit.length} benefit</p>
                                                )}
                                              </div>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                                
                                {/* Show benefits for selected tier and conditionally show additional questions for free tiers */}
                                {selectedEvent && formData.selectedTier && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  return tier && tier.benefit && tier.benefit.length > 0 && (
                                    <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                      <p className="text-sm font-semibold text-emerald-800 mb-2">Benefit yang didapat:</p>
                                      <ul className="space-y-1">
                                        {tier.benefit.map((benefit: string, idx: number) => (
                                          <li key={idx} className="text-sm text-emerald-700 flex items-start gap-2">
                                            <span className="text-emerald-600 mt-0.5">✓</span>
                                            <span>{benefit}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })()}

                                {/* Voucher Code Field - shown for paid tiers */}
                                {selectedEvent && formData.selectedTier && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  return tier && tier.harga > 0 && (
                                    <div>
                                      <Label htmlFor="kodeVoucher">Kode Voucher (opsional)</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          id="kodeVoucher"
                                          value={formData.kodeVoucher}
                                          onChange={(e) => {
                                            setFormData({...formData, kodeVoucher: e.target.value});
                                            setVoucherError('');
                                            setVoucherDiscount(0);
                                          }}
                                          placeholder="Masukkan kode voucher"
                                        />
                                        <Button
                                          type="button"
                                          onClick={handleVoucherCheck}
                                          disabled={isCheckingVoucher || !formData.kodeVoucher.trim()}
                                          variant="outline"
                                        >
                                          {isCheckingVoucher ? 'Cek...' : 'Cek'}
                                        </Button>
                                      </div>
                                      {voucherError && (
                                        <p className="text-sm text-red-600 mt-1">{voucherError}</p>
                                      )}
                                      {voucherDiscount > 0 && (
                                        <p className="text-sm text-green-600 mt-1">
                                          ✓ Voucher valid! Diskon: {voucherJenis === 'persen' ? voucherDiscount + '%' : formatRupiah(voucherDiscount)}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* If selected tier is free, show additional questions (pertanyaanTambahan) */}
                                {selectedEvent && formData.selectedTier && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  if (!tier || tier.harga > 0) return null;
                                  if (!selectedEvent.pertanyaanTambahan) return null;

                                  const pertanyaanList: PertanyaanTambahan[] = JSON.parse(selectedEvent.pertanyaanTambahan);
                                  return pertanyaanList.length > 0 && (
                                    <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                      <h4 className="font-semibold text-emerald-800 text-sm">Pertanyaan Tambahan</h4>
                                      {pertanyaanList.map((q, idx) => (
                                        <div key={idx}>
                                          <Label htmlFor={`pertanyaan-${idx}`} className="text-sm">
                                            {q.pertanyaan} <span className="text-red-500">*</span>
                                          </Label>
                                          {q.tipeJawaban === 'text' ? (
                                            <Textarea
                                              id={`pertanyaan-${idx}`}
                                              value={formData.jawabanTambahan[`q${idx}`] || ''}
                                              onChange={(e) => setFormData({
                                                ...formData,
                                                jawabanTambahan: {
                                                  ...formData.jawabanTambahan,
                                                  [`q${idx}`]: e.target.value
                                                }
                                              })}
                                              required
                                              placeholder="Tulis jawaban Anda... (Bisa berisi link)"
                                              className="mt-1"
                                            />
                                          ) : (
                                            <div className="space-y-2 mt-2">
                                              {q.opsiPilihan?.map((opsi, oIdx) => {
                                                const isSelected = formData.jawabanTambahan[`q${idx}`] === opsi;
                                                return (
                                                  <label
                                                    key={oIdx}
                                                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                                      isSelected 
                                                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200' 
                                                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                                  >
                                                    <input
                                                      type="radio"
                                                      name={`pertanyaan-${idx}`}
                                                      value={opsi}
                                                      checked={isSelected}
                                                      onChange={(e) => setFormData({
                                                        ...formData,
                                                        jawabanTambahan: {
                                                          ...formData.jawabanTambahan,
                                                          [`q${idx}`]: e.target.value
                                                        }
                                                      })}
                                                      required
                                                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-emerald-800' : 'text-gray-700'}`}>
                                                      {makeLinksClickable(opsi)}
                                                    </span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}

                                {formData.selectedTier && selectedEvent && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  
                                  return tier && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h4 className="font-semibold text-emerald-800 mb-2">Informasi Pembayaran:</h4>
                                      <p className="text-sm text-gray-600 mb-1">
                                        Paket: <span className="font-semibold">{tier.nama}</span>
                                      </p>
                                      {tier.harga > 0 && (
                                        <>
                                          <div className="space-y-1 mb-2">
                                            <p className="text-sm text-gray-600 flex justify-between">
                                              <span>Harga Normal:</span>
                                              <span>{formatRupiah(tier.harga)}</span>
                                            </p>
                                            {voucherDiscount > 0 && (() => {
                                              const discountAmount = voucherJenis === 'persen' 
                                                ? tier.harga * voucherDiscount / 100
                                                : voucherDiscount;
                                              return (
                                                <>
                                                  <p className="text-sm text-green-600 flex justify-between">
                                                    <span>Diskon ({voucherJenis === 'persen' ? voucherDiscount + '%' : formatRupiah(voucherDiscount)}):</span>
                                                    <span>- {formatRupiah(discountAmount)}</span>
                                                  </p>
                                                  <div className="border-t border-gray-300 my-1"></div>
                                                </>
                                              );
                                            })()}
                                          </div>
                                          <p className="text-sm text-gray-600 flex justify-between font-semibold">
                                            <span>Total yang harus dibayar:</span>
                                            <span className="text-emerald-700">
                                              {(() => {
                                                const discountAmount = voucherJenis === 'persen' 
                                                  ? tier.harga * voucherDiscount / 100
                                                  : voucherDiscount;
                                                return formatRupiah(Math.max(0, tier.harga - discountAmount));
                                              })()}
                                            </span>
                                          </p>
                                          
                                          {/* Bank Transfer Info */}
                                          <div className="mt-4 pt-4 border-t border-gray-300">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Transfer ke rekening:</p>
                                            {bankInfo ? (
                                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                  <div className="col-span-3 sm:col-span-1">
                                                    <p className="text-gray-500">Bank</p>
                                                    <p className="font-semibold text-gray-900">{bankInfo.namaBank}</p>
                                                  </div>
                                                  <div className="col-span-3 sm:col-span-1">
                                                    <p className="text-gray-500">No. Rekening</p>
                                                    <p className="font-bold text-emerald-700">{bankInfo.nomorRekening}</p>
                                                  </div>
                                                  <div className="col-span-3 sm:col-span-1">
                                                    <p className="text-gray-500">Atas Nama</p>
                                                    <p className="font-semibold text-gray-900">{bankInfo.namaPemilik}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <p className="text-xs text-yellow-800">
                                                  ⚠️ Info rekening belum tersedia. Silakan hubungi admin untuk informasi pembayaran.
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                      {tier.harga === 0 && (
                                        <p className="text-lg font-bold text-green-600">Gratis</p>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Agreement Statement Checkbox - shown for free tiers, positioned below Informasi Tagihan */}
                                {selectedEvent && formData.selectedTier && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  return tier && tier.harga === 0 && (
                                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <input
                                        type="checkbox"
                                        id="agreeStatement"
                                        checked={formData.agreeStatement}
                                        onChange={(e) => setFormData({...formData, agreeStatement: e.target.checked})}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                                      />
                                      <label htmlFor="agreeStatement" className="text-sm text-blue-900 cursor-pointer flex-1">
                                        <span className="font-medium">Saya sudah mengisi formulir pendaftaran ini dengan benar dan jujur</span>
                                      </label>
                                    </div>
                                  );
                                })()}

                                {/* Upload bukti pendaftaran - moved to bottom, shown only for paid tiers */}
                                {selectedEvent && formData.selectedTier && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  return tier && tier.harga > 0 && (
                                    <div className="mt-3">
                                      <Label htmlFor="buktiTransfer">Upload Bukti Transfer</Label>
                                      <Input
                                        id="buktiTransfer"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({...formData, buktiTransfer: e.target.value})}
                                      />
                                    </div>
                                  );
                                })()}

                                <Button 
                                  type="submit" 
                                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? 'Memproses...' : 'Daftar Sekarang'}
                                </Button>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Belum ada event yang tersedia saat ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white py-12 px-4 mt-16">
        <div className="container mx-auto">
          <div className="flex justify-center mb-8">
            {/* Social Media Section */}
            <div className="flex flex-col items-center">
              <h4 className="font-bold text-lg mb-3">Ikuti Kami</h4>
              <div className="flex gap-4 flex-wrap justify-center">
                {socialMedia.instagram && (
                  <a href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition">
                    <Instagram size={24} />
                  </a>
                )}
                {socialMedia.facebook && (
                  <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition">
                    <Facebook size={24} />
                  </a>
                )}
                {socialMedia.youtube && (
                  <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition">
                    <Youtube size={24} />
                  </a>
                )}
                {socialMedia.telegram && (
                  <a href={`https://t.me/${socialMedia.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition">
                    <Send size={24} />
                  </a>
                )}
                {socialMedia.threads && (
                  <a href={`https://threads.net/${socialMedia.threads.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition">
                    <MessageSquare size={24} />
                  </a>
                )}
                {socialMedia.whatsappChannel && (
                  <a href={socialMedia.whatsappChannel} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition">
                    <MessageCircle size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-emerald-700 pt-6 text-center">
            <p className="text-emerald-100 text-sm">© 2024 {namaLembaga}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}