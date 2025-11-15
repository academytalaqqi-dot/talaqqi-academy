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
import { CalendarDays, Users, MapPin, Phone, Clock, Star } from 'lucide-react';

interface ParticipationTier {
  nama: string;
  harga: number;
  linkGrupWa: string;
}

interface Event {
  id: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string;
  tema: string;
  waktuEvent: string;
  jenisKepesertaan: string;
  benefit: string;
  flyerImage: string;
  statusEvent: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    namaPendaftar: '',
    kotaDomisili: '',
    umur: '',
    noWhatsapp: '',
    selectedTier: '',
    kodeVoucher: '',
    buktiTransfer: ''
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

  useEffect(() => {
    fetchEvents();
    fetchBankInfo();
  }, []);

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
        }),
      });

      if (response.ok) {
        setRegistrationSuccess(true);
        setRegisteredTier(selectedTierData);
        setFormData({
          namaPendaftar: '',
          kotaDomisili: '',
          umur: '',
          noWhatsapp: '',
          selectedTier: '',
          kodeVoucher: '',
          buktiTransfer: ''
        });
        
        // Auto close modal and return to home page
        if (selectedTierData.harga === 0) {
          // For free tier, open WhatsApp then close after 2 seconds
          window.open(selectedTierData.linkGrupWa, '_blank');
        }
        
        // Close modal and reset state after showing success briefly
        setTimeout(() => {
          setSelectedEvent(null);
          setRegistrationSuccess(false);
          setRegisteredTier(null);
        }, 2000);
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
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-emerald-800 font-bold text-xl">TA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Talaqqi Academy</h1>
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
            Selamat Datang di Talaqqi Academy
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>{pemateriList.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>{waktuList[0]}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {tiersList.map((tier, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tier.nama}: {tier.harga === 0 ? 'Gratis' : formatRupiah(tier.harga)}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Show all unique benefits from all tiers */}
                        {(() => {
                          const allBenefits = new Set<string>();
                          
                          console.log('Tiers list for benefits:', tiersList); // Debug
                          
                          tiersList.forEach((tier) => {
                            console.log('Tier benefit:', tier.nama, tier.benefit); // Debug
                            if (tier.benefit && Array.isArray(tier.benefit) && tier.benefit.length > 0) {
                              tier.benefit.forEach((b: string) => {
                                if (b && b.trim()) {
                                  allBenefits.add(b.trim());
                                }
                              });
                            }
                          });
                          
                          console.log('All benefits collected:', Array.from(allBenefits)); // Debug
                          
                          if (allBenefits.size > 0) {
                            return (
                              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-800 mb-1.5">Benefit yang didapat:</p>
                                <ul className="space-y-1">
                                  {Array.from(allBenefits).slice(0, 3).map((benefit, idx) => (
                                    <li key={idx} className="text-xs text-emerald-700 flex items-start gap-1.5">
                                      <span className="text-emerald-600 mt-0.5">✓</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                  {allBenefits.size > 3 && (
                                    <li className="text-xs text-emerald-600 font-medium">
                                      +{allBenefits.size - 3} benefit lainnya
                                    </li>
                                  )}
                                </ul>
                              </div>
                            );
                          }
                          
                          console.log('No benefits found, not rendering box'); // Debug
                          return null;
                        })()}
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-emerald-700">
                            {minPrice === 0 && maxPrice === 0 ? (
                              <span className="text-green-600">Gratis</span>
                            ) : minPrice === maxPrice ? (
                              formatRupiah(minPrice)
                            ) : (
                              <span>{formatRupiah(minPrice)} - {formatRupiah(maxPrice)}</span>
                            )}
                          </div>
                          <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => setSelectedEvent(event)}
                            >
                              Daftar Sekarang
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-emerald-800">
                                Form Pendaftaran - {selectedEvent?.namaEvent}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {registrationSuccess ? (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Star className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-green-600 mb-2">
                                  Pendaftaran Berhasil!
                                </h3>
                                
                                {registeredTier && registeredTier.harga === 0 ? (
                                  // Gratis - Langsung ke grup WA
                                  <>
                                    <p className="text-gray-600 mb-4">
                                      Terima kasih telah mendaftar! Link grup WhatsApp telah dibuka di tab baru.
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                      Form akan tertutup otomatis dalam beberapa detik...
                                    </p>
                                  </>
                                ) : (
                                  // Berbayar - Tunggu approval
                                  <>
                                    <p className="text-gray-600 mb-2">
                                      Terima kasih telah mendaftar!
                                    </p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                      <p className="text-sm text-yellow-800">
                                        <strong>Menunggu Validasi Admin</strong>
                                      </p>
                                      <p className="text-xs text-yellow-700 mt-1">
                                        Pendaftaran Anda sedang divalidasi oleh admin. Link grup WhatsApp akan dikirimkan via WhatsApp setelah pembayaran Anda disetujui.
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                      Form akan tertutup otomatis dalam beberapa detik...
                                    </p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>
                                
                                <div>
                                  <Label htmlFor="selectedTier">Jenis Kepesertaan</Label>
                                  <Select 
                                    value={formData.selectedTier} 
                                    onValueChange={(value) => setFormData({...formData, selectedTier: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih jenis kepesertaan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedEvent && JSON.parse(selectedEvent.jenisKepesertaan || '[]').map((tier: ParticipationTier, idx: number) => (
                                        <SelectItem key={idx} value={tier.nama}>
                                          <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{tier.nama}</span>
                                              <span className="text-emerald-600">
                                                {tier.harga === 0 ? 'Gratis' : formatRupiah(tier.harga)}
                                              </span>
                                            </div>
                                            {tier.benefit && tier.benefit.length > 0 && (
                                              <span className="text-xs text-gray-500">
                                                ✓ {tier.benefit.length} benefit tersedia
                                              </span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  {/* Show benefits for selected tier */}
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
                                </div>

                                {selectedEvent && formData.selectedTier && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  return tier && tier.harga > 0;
                                })() && (
                                  <>
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

                                    <div>
                                      <Label htmlFor="buktiTransfer">Upload Bukti Transfer</Label>
                                      <Input
                                        id="buktiTransfer"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({...formData, buktiTransfer: e.target.value})}
                                      />
                                    </div>
                                  </>
                                )}

                                {formData.selectedTier && selectedEvent && (() => {
                                  const tiers = JSON.parse(selectedEvent.jenisKepesertaan || '[]');
                                  const tier = tiers.find((t: ParticipationTier) => t.nama === formData.selectedTier);
                                  
                                  return tier && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h4 className="font-semibold text-emerald-800 mb-2">Informasi Tagihan:</h4>
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
      <footer className="bg-emerald-800 text-white py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <p className="mb-2">© 2024 Talaqqi Academy. All rights reserved.</p>
          <p className="text-emerald-200 text-sm">
            Lembaga Pendidikan Islam Online - Mencetak generasi Qur'ani
          </p>
        </div>
      </footer>
    </div>
  );
}