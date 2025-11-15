'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventFormDialog } from '@/components/admin/event-form-dialog';
import { ReferensiForm } from '@/components/admin/referensi-form';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Eye
} from 'lucide-react';

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
  _count: {
    pendaftaran: number;
  };
}

interface Pendaftaran {
  id: string;
  namaPendaftar: string;
  kotaDomisili: string;
  umur: number;
  noWhatsapp: string;
  eventId: string;
  jenisKepesertaan: string;
  nominalPembayaran: number;
  kodeVoucher: string | null;
  buktiTransfer: string | null;
  waktuPendaftaran: string;
  status: string;
  event: Event;
}

interface DashboardStats {
  totalEvents: number;
  totalPendaftar: number;
  totalPendaftarGratis: number;
  totalPendaftarBerbayar: number;
  totalApproved: number;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalPendaftar: 0,
    totalPendaftarGratis: 0,
    totalPendaftarBerbayar: 0,
    totalApproved: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      const [eventsRes, pendaftaranRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/pendaftaran')
      ]);

      const eventsData = await eventsRes.json();
      const pendaftaranData = await pendaftaranRes.json();

      setEvents(eventsData);
      setPendaftaran(pendaftaranData);

      // Calculate stats
      const totalPendaftar = pendaftaranData.length;
      const totalPendaftarGratis = pendaftaranData.filter((p: Pendaftaran) => p.jenisKepesertaan === 'Gratis').length;
      const totalPendaftarBerbayar = pendaftaranData.filter((p: Pendaftaran) => p.jenisKepesertaan === 'Berbayar').length;
      const totalApproved = pendaftaranData.filter((p: Pendaftaran) => p.status === 'Approved').length;
      const totalApprovedAmount = pendaftaranData
        .filter((p: Pendaftaran) => p.status === 'Approved' && p.jenisKepesertaan === 'Berbayar')
        .reduce((sum: number, p: Pendaftaran) => sum + p.nominalPembayaran, 0);

      setStats({
        totalEvents: eventsData.length,
        totalPendaftar,
        totalPendaftarGratis,
        totalPendaftarBerbayar,
        totalApproved: totalApprovedAmount
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const handleApproveReject = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/pendaftaran/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action === 'approve' ? 'Approved' : 'Rejected' }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // If approved and paid tier, send WhatsApp message
        if (action === 'approve' && result.nominalPembayaran > 0) {
          const registration = pendaftaran.find(p => p.id === id);
          if (registration) {
            // Parse event tiers to get WhatsApp link
            const tiers = JSON.parse(registration.event.jenisKepesertaan || '[]');
            const selectedTier = tiers.find((t: any) => t.nama === registration.jenisKepesertaan);
            
            if (selectedTier && selectedTier.linkGrupWa) {
              // Create WhatsApp message
              const message = encodeURIComponent(
                `Halo ${registration.namaPendaftar}! 🎉\n\n` +
                `Selamat! Pendaftaran Anda untuk event "${registration.event.namaEvent}" telah disetujui.\n\n` +
                `Silakan bergabung ke grup WhatsApp melalui link berikut:\n` +
                `${selectedTier.linkGrupWa}\n\n` +
                `Terima kasih telah mendaftar di Talaqqi Academy!`
              );
              
              // Open WhatsApp with pre-filled message
              const whatsappUrl = `https://wa.me/${registration.noWhatsapp.replace(/\D/g, '')}?text=${message}`;
              window.open(whatsappUrl, '_blank');
              
              alert('Status berhasil diupdate! Link WhatsApp telah dibuka di tab baru untuk dikirim ke peserta.');
            }
          }
        }
        
        fetchData();
      } else {
        alert('Gagal memperbarui status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status');
    }
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      const url = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events';
      const method = selectedEvent ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        fetchData();
        setIsEventDialogOpen(false);
        alert(selectedEvent ? 'Event berhasil diperbarui' : 'Event berhasil ditambahkan');
      } else {
        alert('Gagal menyimpan event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Gagal menyimpan event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
        alert('Event berhasil dihapus');
      } else {
        alert('Gagal menghapus event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Gagal menghapus event');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-emerald-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-emerald-800 font-bold">TA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Talaqqi Academy</h1>
                <p className="text-emerald-100 text-sm">Portal Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-white text-emerald-700 border-white hover:bg-emerald-50">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Button>
              <Button 
                variant="outline" 
                className="bg-white text-emerald-700 border-white hover:bg-emerald-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Event</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalEvents}</div>
              <p className="text-xs text-blue-600">Event aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Pendaftar</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.totalPendaftar}</div>
              <p className="text-xs text-green-600">
                {stats.totalPendaftarGratis} Gratis, {stats.totalPendaftarBerbayar} Berbayar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pendaftar Approved</CardTitle>
              <Check className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {pendaftaran.filter(p => p.status === 'Approved').length}
              </div>
              <p className="text-xs text-yellow-600">Sudah divalidasi</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Total Dana</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{formatRupiah(stats.totalApproved)}</div>
              <p className="text-xs text-emerald-600">Dana yang sudah masuk</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Kelola Event</TabsTrigger>
            <TabsTrigger value="pendaftaran">Validasi Pendaftaran</TabsTrigger>
            <TabsTrigger value="referensi">Kelola Referensi</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Daftar Event</CardTitle>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddEvent}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Event</TableHead>
                      <TableHead>Nama Event</TableHead>
                      <TableHead>Pemateri</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pendaftar</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const pemateriList = JSON.parse(event.pemateri || '[]');
                      const tiersList = JSON.parse(event.jenisKepesertaan || '[]');
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.kodeEvent}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{event.namaEvent}</div>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {tiersList.map((tier: any, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tier.nama}: Rp {tier.harga.toLocaleString('id-ID')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{pemateriList.join(', ')}</TableCell>
                          <TableCell>
                            <Badge variant={event.statusEvent === 'Pendaftaran' ? 'default' : 'secondary'}>
                              {event.statusEvent}
                            </Badge>
                          </TableCell>
                          <TableCell>{event._count.pendaftaran}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pendaftaran">
            <Card>
              <CardHeader>
                <CardTitle>Validasi Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pendaftar</TableHead>
                      <TableHead>Kota</TableHead>
                      <TableHead>Usia</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Voucher</TableHead>
                      <TableHead>Bukti</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendaftaran.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.namaPendaftar}</TableCell>
                        <TableCell>{p.kotaDomisili}</TableCell>
                        <TableCell>{p.umur}</TableCell>
                        <TableCell>{p.noWhatsapp}</TableCell>
                        <TableCell>{p.event.namaEvent}</TableCell>
                        <TableCell>
                          <Badge variant={p.jenisKepesertaan === 'Gratis' ? 'secondary' : 'default'}>
                            {p.jenisKepesertaan}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatRupiah(p.nominalPembayaran)}</TableCell>
                        <TableCell>
                          {p.kodeVoucher ? (
                            <Badge variant="secondary" className="text-xs">
                              {p.kodeVoucher}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.buktiTransfer ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(p.buktiTransfer || '', '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              p.status === 'Approved' ? 'default' : 
                              p.status === 'Rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApproveReject(p.id, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApproveReject(p.id, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referensi">
            <ReferensiForm />
          </TabsContent>
        </Tabs>
      </div>

      <EventFormDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={selectedEvent}
        onSave={handleSaveEvent}
      />
    </div>
  );
}