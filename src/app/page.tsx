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

interface Event {
  id: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string;
  tema: string;
  waktuEvent: string;
  jenisKepesertaan: string;
  nominalInfaq: number;
  benefit: string;
  flyerImage: string;
  linkGrupWa: string;
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
    jenisKepesertaan: '',
    kodeVoucher: '',
    buktiTransfer: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    fetchEvents();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          eventId: selectedEvent.id,
          umur: parseInt(formData.umur),
          nominalPembayaran: selectedEvent.nominalInfaq,
        }),
      });

      if (response.ok) {
        setRegistrationSuccess(true);
        setFormData({
          namaPendaftar: '',
          kotaDomisili: '',
          umur: '',
          noWhatsapp: '',
          jenisKepesertaan: '',
          kodeVoucher: '',
          buktiTransfer: ''
        });
        setSelectedEvent(null);
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
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.flyerImage && (
                    <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-yellow-50 flex items-center justify-center">
                      <img 
                        src={event.flyerImage} 
                        alt={event.namaEvent}
                        className="w-full h-full object-cover"
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
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-emerald-700">
                          {event.jenisKepesertaan === 'Gratis' ? (
                            <span className="text-green-600">Gratis</span>
                          ) : (
                            formatRupiah(event.nominalInfaq)
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
                                <p className="text-gray-600 mb-4">
                                  {selectedEvent?.jenisKepesertaan === 'Gratis' 
                                    ? `Terima kasih telah mendaftar. Link grup WhatsApp: ${selectedEvent?.linkGrupWa}`
                                    : 'Pendaftaran Anda sedang divalidasi oleh admin. Anda akan menerima informasi lebih lanjut via WhatsApp.'
                                  }
                                </p>
                                <Button onClick={() => setRegistrationSuccess(false)}>
                                  Tutup
                                </Button>
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
                                  <Label htmlFor="jenisKepesertaan">Jenis Kepesertaan</Label>
                                  <Select value={formData.jenisKepesertaan} onValueChange={(value) => setFormData({...formData, jenisKepesertaan: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih jenis kepesertaan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Gratis">Gratis</SelectItem>
                                      <SelectItem value="Berbayar">Berbayar ({formatRupiah(selectedEvent?.nominalInfaq || 0)})</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {formData.jenisKepesertaan === 'Berbayar' && (
                                  <>
                                    <div>
                                      <Label htmlFor="kodeVoucher">Kode Voucher (opsional)</Label>
                                      <Input
                                        id="kodeVoucher"
                                        value={formData.kodeVoucher}
                                        onChange={(e) => setFormData({...formData, kodeVoucher: e.target.value})}
                                        placeholder="Masukkan kode voucher jika ada"
                                      />
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

                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-emerald-800 mb-2">Informasi Tagihan:</h4>
                                  <p className="text-sm text-gray-600">
                                    Total yang harus dibayar: <span className="font-bold text-emerald-700">
                                      {formData.jenisKepesertaan === 'Gratis' ? 'Gratis' : formatRupiah(selectedEvent?.nominalInfaq || 0)}
                                    </span>
                                  </p>
                                  {formData.jenisKepesertaan === 'Berbayar' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Silakan transfer ke rekening yang tersedia dan upload bukti transfer
                                    </p>
                                  )}
                                </div>

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