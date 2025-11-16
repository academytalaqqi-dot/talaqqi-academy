'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { EventFormDialog } from '@/components/admin/event-form-dialog';
import { ReferensiForm } from '@/components/admin/referensi-form';
import { SettingsModal } from '@/components/admin/settings-modal';
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
  Eye,
  Search,
  Download
} from 'lucide-react';

interface EventData {
  id: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string;
  tema: string;
  deskripsi?: string;
  waktuEvent: string;
  jenisKepesertaan: string;
  benefit: string;
  kodeVoucher?: string;
  pertanyaanTambahan?: string;
  sponsor?: string;
  flyerImage?: string;
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
  jawabanTambahan: string | null;
  waktuPendaftaran: string;
  status: string;
  event: EventData;
}

interface DashboardStats {
  totalEvents: number;
  totalPendaftar: number;
  totalPendaftarGratis: number;
  totalPendaftarBerbayar: number;
  totalApproved: number;
}

interface jsPDFWithAutoTable {
  autoTable: (options: any) => void;
  text: (text: string | string[], x: number, y: number) => void;
  setFontSize: (size: number) => void;
  setFont: (fontName?: string | null, fontStyle?: string | null) => void;
  save: (filename: string) => void;
  addPage: () => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
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
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPendaftar, setSelectedPendaftar] = useState<Pendaftaran | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [filterJenis, setFilterJenis] = useState<'All' | 'Gratis' | 'Berbayar'>('All');
  const [namaLembaga, setNamaLembaga] = useState('Talaqqi Academy');
  const [logoLembaga, setLogoLembaga] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Time range filter: 'all' | 'year' | 'month' | 'range'
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month' | 'range'>('all');
  const [startDate, setStartDate] = useState<string>(''); // ISO yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
    fetchReferensi();
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
      // Sum nominalPembayaran for all registrations that are Approved (include free tiers which usually have nominal 0)
      const totalApprovedAmount = pendaftaranData
        .filter((p: Pendaftaran) => p.status === 'Approved')
        .reduce((sum: number, p: Pendaftaran) => sum + (p.nominalPembayaran || 0), 0);

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

  const fetchReferensi = async () => {
    try {
      const response = await fetch('/api/referensi');
      const data = await response.json();
      if (data.namaLembaga) {
        setNamaLembaga(data.namaLembaga);
      }
      if (data.logo) {
        setLogoLembaga(data.logo);
      }
    } catch (error) {
      console.error('Error fetching referensi:', error);
    }
  };  const handleLogout = () => {
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
        const registration = pendaftaran.find(p => p.id === id);
        
        if (registration) {
          // If approved and paid tier, send WhatsApp message
          if (action === 'approve' && result.nominalPembayaran > 0) {
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
          
          // If rejected, send WhatsApp notification
          if (action === 'reject') {
            const message = encodeURIComponent(
              `Halo ${registration.namaPendaftar},\n\n` +
              `Mohon maaf, pendaftaran Anda untuk event "${registration.event.namaEvent}" tidak dapat disetujui.\n\n` +
              `Alasan: Bukti transfer tidak valid atau tidak sesuai dengan nominal yang diminta.\n\n` +
              `Silakan hubungi admin untuk informasi lebih lanjut atau coba mendaftar ulang.\n\n` +
              `Terima kasih.`
            );
            
            // Open WhatsApp with pre-filled rejection message
            const whatsappUrl = `https://wa.me/${registration.noWhatsapp.replace(/\D/g, '')}?text=${message}`;
            window.open(whatsappUrl, '_blank');
            
            alert('Status berhasil diupdate! Link WhatsApp telah dibuka di tab baru untuk mengirim notifikasi penolakan ke peserta.');
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

  const handleEditEvent = (eventData: EventData) => {
    // Transform EventData to Event format expected by EventFormDialog
    const transformedEvent = {
      id: eventData.id,
      kodeEvent: eventData.kodeEvent,
      namaEvent: eventData.namaEvent,
      pemateri: JSON.parse(eventData.pemateri || '[]'),
      tema: eventData.tema,
      deskripsi: eventData.deskripsi,
      waktuEvent: JSON.parse(eventData.waktuEvent || '[]'),
      jenisKepesertaan: JSON.parse(eventData.jenisKepesertaan || '[]'),
      benefit: JSON.parse(eventData.benefit || '[]'),
      kodeVoucher: eventData.kodeVoucher ? JSON.parse(eventData.kodeVoucher) : [],
      pertanyaanTambahan: eventData.pertanyaanTambahan ? JSON.parse(eventData.pertanyaanTambahan) : [],
      sponsor: eventData.sponsor ? JSON.parse(eventData.sponsor) : [],
      flyerImage: eventData.flyerImage || '',
      statusEvent: eventData.statusEvent,
    };
    setSelectedEvent(eventData);
    setIsEventDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      console.log('Saving event data:', eventData);
      console.log('PertanyaanTambahan:', eventData.pertanyaanTambahan);
      console.log('Sponsor:', eventData.sponsor);
      
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

  const getFilteredPendaftaran = () => {
    return pendaftaran.filter((p) => {
      // Search filter - search across nama, kota, phone, event name
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        p.namaPendaftar.toLowerCase().includes(searchLower) ||
        p.kotaDomisili.toLowerCase().includes(searchLower) ||
        p.noWhatsapp.includes(searchLower) ||
        p.event.namaEvent.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      // Status filter
      if (filterStatus !== 'All' && p.status !== filterStatus) return false;

      // Jenis Kepesertaan filter
      if (filterJenis !== 'All' && p.jenisKepesertaan !== filterJenis) return false;

      // Time range filter
      try {
        if (timeRange !== 'all') {
          const pDate = p.waktuPendaftaran ? new Date(p.waktuPendaftaran) : null;
          if (!pDate) return false;

          const now = new Date();
          let rangeStart: Date | null = null;
          let rangeEnd: Date | null = null;

          if (timeRange === 'year') {
            rangeStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            rangeEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          } else if (timeRange === 'month') {
            rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          } else if (timeRange === 'range') {
            if (!startDate || !endDate) {
              // If custom range is selected but dates not provided, do not include
              return false;
            }
            rangeStart = new Date(startDate + 'T00:00:00');
            rangeEnd = new Date(endDate + 'T23:59:59');
          }

          if (rangeStart && rangeEnd) {
            if (pDate < rangeStart || pDate > rangeEnd) return false;
          }
        }
      } catch (err) {
        console.warn('Error parsing waktuPendaftaran for filtering', err);
        return false;
      }

      return true;
    });
  };

  const exportToExcel = async () => {
    try {
      const xlsxModule = await import('xlsx');
      const XLSX = (xlsxModule && (xlsxModule as any).default) ? (xlsxModule as any).default : xlsxModule;
      const filteredData = getFilteredPendaftaran();

      if (!filteredData || filteredData.length === 0) {
        alert('Tidak ada data untuk di-export');
        return;
      }

      if (!XLSX || !XLSX.utils) {
        console.error('xlsx module did not load correctly:', xlsxModule);
        alert('Gagal export ke Excel: library xlsx tidak tersedia di runtime. Periksa console untuk detail.');
        return;
      }

      const excelData = filteredData.map((p) => ({
        'Nama Pendaftar': p.namaPendaftar || '',
        'Usia': p.umur || 0,
        'Kota': p.kotaDomisili || '',
        'WhatsApp': p.noWhatsapp || '',
        'Event': p.event?.namaEvent || '',
        'Jenis Kepesertaan': p.jenisKepesertaan || '',
        'Nominal Pembayaran': p.nominalPembayaran || 0,
        'Kode Voucher': p.kodeVoucher || '-',
        'Status': p.status || '',
        'Waktu Pendaftaran': formatDate(p.waktuPendaftaran) || '',
      }));

      try {
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendaftaran');

        // Set column widths
        worksheet['!cols'] = [
          { wch: 20 }, // Nama
          { wch: 8 },  // Usia
          { wch: 15 }, // Kota
          { wch: 15 }, // WhatsApp
          { wch: 20 }, // Event
          { wch: 18 }, // Jenis
          { wch: 18 }, // Nominal
          { wch: 15 }, // Voucher
          { wch: 12 }, // Status
          { wch: 18 }, // Waktu
        ];

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Validasi_Pendaftaran_${timestamp}.xlsx`);
        alert('Export Excel berhasil!');
      } catch (writeError) {
        console.error('Error while creating/writing Excel file:', writeError);
        alert(`Gagal export ke Excel: ${writeError instanceof Error ? writeError.message : 'Unknown error during file generation'}`);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(`Gagal export ke Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      // @ts-ignore - AutoTable is added via import
      await import('jspdf-autotable');
      
      const filteredData = getFilteredPendaftaran();

      if (!filteredData || filteredData.length === 0) {
        alert('Tidak ada data untuk di-export');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      }) as unknown as jsPDFWithAutoTable;

      const margin = 10;

      // Header
      doc.setFontSize(16);
      doc.text('Laporan Validasi Pendaftaran', margin, margin + 5);
      
      doc.setFontSize(10);
      doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, margin, margin + 12);
      doc.text(`Total Pendaftar: ${filteredData.length}`, margin, margin + 17);

      // Table
      const tableData = filteredData.map((p) => [
        p.namaPendaftar || '-',
        (p.umur || 0).toString(),
        p.kotaDomisili || '-',
        p.noWhatsapp || '-',
        (p.event?.namaEvent || '-').substring(0, 15),
        p.jenisKepesertaan || '-',
        `Rp ${((p.nominalPembayaran || 0) / 1000).toFixed(0)}k`,
        p.kodeVoucher || '-',
        p.status || '-',
        (formatDate(p.waktuPendaftaran) || '-').substring(0, 10),
      ]);

      // Add table using autoTable
      if (doc.autoTable && typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [['Nama', 'Usia', 'Kota', 'WA', 'Event', 'Jenis', 'Nominal', 'Voucher', 'Status', 'Tanggal']],
          body: tableData,
          startY: margin + 22,
          margin: margin,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [34, 197, 94], // emerald-500
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [240, 253, 250], // teal-50
          },
        });
      } else {
        console.warn('autoTable not available, generating simple PDF');

        // Manual table rendering as a fallback when autoTable is not available
        const pageWidth = (doc as any).internal.pageSize.getWidth();
        const pageHeight = (doc as any).internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;

        // Column ratios (must sum to 1)
        const ratios = [0.18, 0.06, 0.12, 0.12, 0.18, 0.08, 0.08, 0.06, 0.06, 0.1];
        const colWidths = ratios.map(r => Math.floor(r * contentWidth));
        const colX: number[] = [];
        let cursorX = margin;
        for (let w of colWidths) {
          colX.push(cursorX);
          cursorX += w;
        }

        // Header row
        doc.setFontSize(9);
        doc.setFont(undefined as any, 'bold');
        const headers = ['Nama', 'Usia', 'Kota', 'WA', 'Event', 'Jenis', 'Nominal', 'Voucher', 'Status', 'Tanggal'];
        let y = margin + 26;
        const lineHeight = 6;

        for (let i = 0; i < headers.length; i++) {
          const x = colX[i] + 2;
          doc.text(String(headers[i]), x, y);
        }

        y += lineHeight;
        doc.setFont(undefined as any, 'normal');
        doc.setFontSize(8);

        // Rows
        for (const row of tableData) {
          // page break
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin + 12;
            // re-draw header on new page
            doc.setFont(undefined as any, 'bold');
            doc.setFontSize(9);
            for (let i = 0; i < headers.length; i++) {
              const x = colX[i] + 2;
              doc.text(String(headers[i]), x, y);
            }
            y += lineHeight;
            doc.setFont(undefined as any, 'normal');
            doc.setFontSize(8);
          }

          for (let i = 0; i < row.length; i++) {
            const x = colX[i] + 2;
            const text = String(row[i] ?? '-');
            // wrap long text to column width
            const maxWidth = colWidths[i] - 4;
            const splitted = doc.splitTextToSize(text, maxWidth);
            doc.text(splitted, x, y);
          }

          y += lineHeight;
        }
      }

      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`Validasi_Pendaftaran_${timestamp}.pdf`);
      alert('Export PDF berhasil!');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert(`Gagal export ke PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Derived stats from filtered data so dashboard reflects selected time range and filters
  const filtered = getFilteredPendaftaran();
  const derivedTotalEvents = Array.from(new Set(filtered.map(f => f.eventId))).length;
  const derivedTotalPendaftar = filtered.length;
  const derivedTotalPendaftarGratis = filtered.filter(p => p.jenisKepesertaan === 'Gratis').length;
  const derivedTotalPendaftarBerbayar = filtered.filter(p => p.jenisKepesertaan === 'Berbayar').length;
  const derivedTotalApprovedAmount = filtered
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + (p.nominalPembayaran || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {logoLembaga ? (
                <img src={logoLembaga} alt="Logo" className="w-10 h-10 object-contain rounded-full overflow-hidden border-2 border-white" />
              ) : (
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-emerald-800 font-bold">TA</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{namaLembaga}</h1>
                <p className="text-emerald-100 text-sm">Portal Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="bg-white text-emerald-700 border-white hover:bg-emerald-50"
                onClick={() => setIsSettingsModalOpen(true)}
              >
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
              <div className="text-2xl font-bold text-blue-900">{derivedTotalEvents}</div>
              <p className="text-xs text-blue-600">Event aktif (dalam rentang)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Pendaftar</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{derivedTotalPendaftar}</div>
              <p className="text-xs text-green-600">
                {derivedTotalPendaftarGratis} Gratis, {derivedTotalPendaftarBerbayar} Berbayar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pendaftar Approved</CardTitle>
              <Check className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{filtered.filter(p => p.status === 'Approved').length}</div>
              <p className="text-xs text-yellow-600">Sudah divalidasi (dalam rentang)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Total Dana</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{formatRupiah(derivedTotalApprovedAmount)}</div>
              <p className="text-xs text-emerald-600">Dana yang sudah masuk (dalam rentang)</p>
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
              <CardContent className="space-y-4">
                {/* Filter Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Cari: Nama, Kota, WhatsApp, Event..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      >
                        <option value="All">Semua Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Jenis Kepesertaan Filter */}
                    <div>
                      <select
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      >
                        <option value="All">Semua Jenis</option>
                        <option value="Gratis">Gratis</option>
                        <option value="Berbayar">Berbayar</option>
                      </select>
                    </div>

                    {/* Time Range Filter */}
                    <div>
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      >
                        <option value="all">Sepanjang Waktu</option>
                        <option value="year">Tahun Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="range">Rentang Tanggal</option>
                      </select>
                    </div>
                  </div>

                  {/* If custom range selected, show date inputs */}
                  {timeRange === 'range' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Tanggal Mulai</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Tanggal Selesai</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Results Info & Export Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Menampilkan <span className="font-semibold">{filtered.length}</span> dari <span className="font-semibold">{pendaftaran.length}</span> pendaftar
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={exportToExcel}
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                      </Button>
                      <Button
                        onClick={exportToPDF}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Table */}
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
                    {getFilteredPendaftaran().map((p) => (
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
                                onClick={() => {
                                  setSelectedPendaftar(p);
                                  setIsDetailModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
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
        event={selectedEvent as any}
        onSave={handleSaveEvent}
      />

      {/* Detail Modal */}
      {isDetailModalOpen && selectedPendaftar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Detail Pendaftar</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Personal Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-800">Informasi Pribadi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{selectedPendaftar.namaPendaftar}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Usia</p>
                    <p className="font-medium text-gray-900">{selectedPendaftar.umur} tahun</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kota Domisili</p>
                    <p className="font-medium text-gray-900">{selectedPendaftar.kotaDomisili}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. WhatsApp</p>
                    <p className="font-medium text-gray-900">{selectedPendaftar.noWhatsapp}</p>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-800">Informasi Pendaftaran</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Event</p>
                    <p className="font-medium text-gray-900">{selectedPendaftar.event.namaEvent}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis Kepesertaan</p>
                    <Badge variant={selectedPendaftar.jenisKepesertaan === 'Gratis' ? 'secondary' : 'default'}>
                      {selectedPendaftar.jenisKepesertaan}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Nominal Pembayaran</p>
                    <p className="font-medium text-gray-900">{formatRupiah(selectedPendaftar.nominalPembayaran)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kode Voucher</p>
                    <p className="font-medium text-gray-900">{selectedPendaftar.kodeVoucher || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Waktu Pendaftaran</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedPendaftar.waktuPendaftaran)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge 
                      variant={
                        selectedPendaftar.status === 'Approved' ? 'default' : 
                        selectedPendaftar.status === 'Rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {selectedPendaftar.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bukti Transfer */}
              {selectedPendaftar.nominalPembayaran > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-800">Bukti Transfer</h3>
                  {selectedPendaftar.buktiTransfer ? (
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(selectedPendaftar.buktiTransfer || '', '_blank')}
                      >
                        Lihat Bukti Transfer
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada bukti transfer</p>
                  )}
                </div>
              )}

              {/* Additional Questions */}
              {selectedPendaftar.jawabanTambahan && selectedPendaftar.event.pertanyaanTambahan && (
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-800">Pertanyaan & Jawaban Tambahan</h3>
                  <div className="space-y-4 text-sm">
                    {(() => {
                      try {
                        const answers = JSON.parse(selectedPendaftar.jawabanTambahan);
                        const questions = JSON.parse(selectedPendaftar.event.pertanyaanTambahan || '[]');
                        
                        return questions.map((q: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-green-400 pl-3 pb-3 border-b last:border-b-0">
                            <p className="text-gray-700 font-semibold">{q.pertanyaan}</p>
                            <div className="mt-2 bg-white p-2 rounded border border-green-200">
                              <p className="text-gray-800">{answers[`q${idx}`] || '-'}</p>
                            </div>
                          </div>
                        ));
                      } catch {
                        return <p className="text-gray-500">Data tidak valid</p>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedPendaftar.status === 'Pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproveReject(selectedPendaftar.id, 'approve');
                      setIsDetailModalOpen(false);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Setujui
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleApproveReject(selectedPendaftar.id, 'reject');
                      setIsDetailModalOpen(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                </div>
              )}

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        open={isSettingsModalOpen} 
        onOpenChange={setIsSettingsModalOpen}
      />
    </div>
  );
}