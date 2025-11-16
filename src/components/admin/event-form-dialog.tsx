'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';

interface ParticipationTier {
  nama: string;
  harga: number;
  linkGrupWa: string;
}

interface WaktuEvent {
  hari: string;
  tanggal: string;
  jam: string;
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
  id?: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string[];
  tema: string;
  deskripsi?: string;
  waktuEvent: WaktuEvent[];
  jenisKepesertaan: ParticipationTier[];
  benefit: string[];
  kodeVoucher: string[];
  pertanyaanTambahan?: PertanyaanTambahan[];
  sponsor?: Sponsor[];
  flyerImage: string;
  statusEvent: string;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSave: (event: Event) => void;
}

export function EventFormDialog({ open, onOpenChange, event, onSave }: EventFormDialogProps) {
  const [formData, setFormData] = useState<Event>({
    kodeEvent: '',
    namaEvent: '',
    pemateri: [],
    tema: '',
    deskripsi: '',
    waktuEvent: [],
    jenisKepesertaan: [],
    benefit: [],
    kodeVoucher: [],
    pertanyaanTambahan: [],
    sponsor: [],
    flyerImage: '',
    statusEvent: 'Pendaftaran'
  });

  const [newPemateri, setNewPemateri] = useState('');
  const [newWaktuHari, setNewWaktuHari] = useState('');
  const [newWaktuTanggal, setNewWaktuTanggal] = useState('');
  const [newWaktuJam, setNewWaktuJam] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newVoucherKode, setNewVoucherKode] = useState('');
  const [newVoucherPotongan, setNewVoucherPotongan] = useState(0);
  const [newVoucherJenis, setNewVoucherJenis] = useState<'persen' | 'rupiah'>('persen');
  const [newTierNama, setNewTierNama] = useState('');
  const [newTierHarga, setNewTierHarga] = useState(0);
  const [newTierLink, setNewTierLink] = useState('');
  const [newTierBenefit, setNewTierBenefit] = useState('');
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // State for Pertanyaan Tambahan
  const [newPertanyaan, setNewPertanyaan] = useState('');
  const [newTipeJawaban, setNewTipeJawaban] = useState<'text' | 'pilihan'>('text');
  const [newOpsiPilihan, setNewOpsiPilihan] = useState('');
  const [tempOpsiList, setTempOpsiList] = useState<string[]>([]);
  
  // State for Sponsor
  const [newSponsorNama, setNewSponsorNama] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');
  const [newSponsorLink, setNewSponsorLink] = useState('');
  const [isUploadingSponsorLogo, setIsUploadingSponsorLogo] = useState(false);
  const [sponsorLogoError, setSponsorLogoError] = useState('');

  useEffect(() => {
    if (event) {
      try {
        const parsePemateri = () => {
          if (Array.isArray(event.pemateri)) return event.pemateri;
          if (typeof event.pemateri === 'string') return JSON.parse(event.pemateri || '[]');
          return [];
        };

        const parseWaktuEvent = () => {
          if (Array.isArray(event.waktuEvent)) {
            // Check if it's already in new format
            if (event.waktuEvent.length > 0 && typeof event.waktuEvent[0] === 'object' && 'hari' in event.waktuEvent[0]) {
              return event.waktuEvent;
            }
            // Convert old format (string array) to new format
            return event.waktuEvent.map((waktu: any) => ({
              hari: '',
              tanggal: typeof waktu === 'string' ? waktu : '',
              jam: ''
            }));
          }
          if (typeof event.waktuEvent === 'string') {
            const parsed = JSON.parse(event.waktuEvent || '[]');
            if (parsed.length > 0 && typeof parsed[0] === 'object' && 'hari' in parsed[0]) {
              return parsed;
            }
            return parsed.map((waktu: string) => ({
              hari: '',
              tanggal: waktu,
              jam: ''
            }));
          }
          return [];
        };

        const parseJenisKepesertaan = () => {
          if (Array.isArray(event.jenisKepesertaan)) {
            // Ensure all tiers have benefit array
            return event.jenisKepesertaan.map(tier => ({
              ...tier,
              benefit: tier.benefit || []
            }));
          }
          if (typeof event.jenisKepesertaan === 'string') {
            const parsed = JSON.parse(event.jenisKepesertaan || '[]');
            if (Array.isArray(parsed)) {
              return parsed.map(tier => ({
                ...tier,
                benefit: tier.benefit || []
              }));
            }
          }
          return [];
        };

        const parseBenefit = () => {
          if (Array.isArray(event.benefit)) return event.benefit;
          if (typeof event.benefit === 'string') return JSON.parse(event.benefit || '[]');
          return [];
        };

        const parseKodeVoucher = () => {
          if (Array.isArray(event.kodeVoucher)) {
            // Ensure all vouchers have jenisPotongan
            return event.kodeVoucher.map((v: any) => ({
              ...v,
              jenisPotongan: v.jenisPotongan || 'persen'
            }));
          }
          if (typeof event.kodeVoucher === 'string') {
            try {
              const parsed = JSON.parse(event.kodeVoucher || '[]');
              // Convert old format (string array) to new format (object array)
              if (parsed.length > 0 && typeof parsed[0] === 'string') {
                return parsed.map((kode: string) => ({ 
                  kode, 
                  potongan: 10, 
                  jenisPotongan: 'persen' 
                }));
              }
              // Ensure jenisPotongan exists
              return parsed.map((v: any) => ({
                ...v,
                jenisPotongan: v.jenisPotongan || 'persen'
              }));
            } catch {
              return [];
            }
          }
          return [];
        };

        const parsePertanyaanTambahan = () => {
          if (Array.isArray(event.pertanyaanTambahan)) return event.pertanyaanTambahan;
          if (typeof event.pertanyaanTambahan === 'string') return JSON.parse(event.pertanyaanTambahan || '[]');
          return [];
        };

        const parseSponsor = () => {
          if (Array.isArray(event.sponsor)) return event.sponsor;
          if (typeof event.sponsor === 'string') return JSON.parse(event.sponsor || '[]');
          return [];
        };

        setFormData({
          ...event,
          pemateri: parsePemateri(),
          waktuEvent: parseWaktuEvent(),
          jenisKepesertaan: parseJenisKepesertaan(),
          benefit: parseBenefit(),
          kodeVoucher: parseKodeVoucher(),
          pertanyaanTambahan: parsePertanyaanTambahan(),
          sponsor: parseSponsor(),
        });
      } catch (error) {
        console.error('Error parsing event data:', error);
        // Reset to empty form on error
        setFormData({
          kodeEvent: '',
          namaEvent: '',
          pemateri: [],
          tema: '',
          deskripsi: '',
          waktuEvent: [],
          jenisKepesertaan: [],
          benefit: [],
          kodeVoucher: [],
          pertanyaanTambahan: [],
          sponsor: [],
          flyerImage: '',
          statusEvent: 'Pendaftaran'
        });
      }
    } else {
      setFormData({
        kodeEvent: '',
        namaEvent: '',
        pemateri: [],
        tema: '',
        deskripsi: '',
        waktuEvent: [],
        jenisKepesertaan: [],
        benefit: [],
        kodeVoucher: [],
        pertanyaanTambahan: [],
        sponsor: [],
        flyerImage: '',
        statusEvent: 'Pendaftaran'
      });
    }
  }, [event, open]);

  const addPemateri = () => {
    if (newPemateri.trim()) {
      setFormData(prev => ({
        ...prev,
        pemateri: [...prev.pemateri, newPemateri.trim()]
      }));
      setNewPemateri('');
    }
  };

  const removePemateri = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pemateri: prev.pemateri.filter((_, i) => i !== index)
    }));
  };

  const addWaktu = () => {
    if (newWaktuHari.trim() || newWaktuTanggal.trim() || newWaktuJam.trim()) {
      setFormData(prev => ({
        ...prev,
        waktuEvent: [...prev.waktuEvent, {
          hari: newWaktuHari.trim(),
          tanggal: newWaktuTanggal.trim(),
          jam: newWaktuJam.trim()
        }]
      }));
      setNewWaktuHari('');
      setNewWaktuTanggal('');
      setNewWaktuJam('');
    }
  };

  const removeWaktu = (index: number) => {
    setFormData(prev => ({
      ...prev,
      waktuEvent: prev.waktuEvent.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefit: [...prev.benefit, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefit: prev.benefit.filter((_, i) => i !== index)
    }));
  };

  const addVoucher = () => {
    if (newVoucherKode.trim() && newVoucherPotongan > 0) {
      setFormData(prev => ({
        ...prev,
        kodeVoucher: [...prev.kodeVoucher, {
          kode: newVoucherKode.trim().toUpperCase(),
          potongan: newVoucherPotongan,
          jenisPotongan: newVoucherJenis
        }]
      }));
      setNewVoucherKode('');
      setNewVoucherPotongan(0);
      setNewVoucherJenis('persen');
    }
  };

  const removeVoucher = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kodeVoucher: prev.kodeVoucher.filter((_, i) => i !== index)
    }));
  };

  const addParticipationTier = () => {
    if (newTierNama.trim()) {
      const newTier = {
        nama: newTierNama.trim(),
        harga: newTierHarga,
        linkGrupWa: newTierLink.trim(),
        benefit: []
      };

      if (editingTierIndex !== null) {
        // Update existing tier
        setFormData(prev => ({
          ...prev,
          jenisKepesertaan: prev.jenisKepesertaan.map((tier, idx) => 
            idx === editingTierIndex ? { ...tier, ...newTier, benefit: tier.benefit } : tier
          )
        }));
        setEditingTierIndex(null);
      } else {
        // Add new tier
        setFormData(prev => ({
          ...prev,
          jenisKepesertaan: [...prev.jenisKepesertaan, newTier]
        }));
      }
      
      setNewTierNama('');
      setNewTierHarga(0);
      setNewTierLink('');
    }
  };

  const removeParticipationTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      jenisKepesertaan: prev.jenisKepesertaan.filter((_, i) => i !== index)
    }));
  };

  const addBenefitToTier = (tierIndex: number) => {
    if (newTierBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        jenisKepesertaan: prev.jenisKepesertaan.map((tier, idx) => 
          idx === tierIndex 
            ? { ...tier, benefit: [...(tier.benefit || []), newTierBenefit.trim()] }
            : tier
        )
      }));
      setNewTierBenefit('');
    }
  };

  const removeBenefitFromTier = (tierIndex: number, benefitIndex: number) => {
    setFormData(prev => ({
      ...prev,
      jenisKepesertaan: prev.jenisKepesertaan.map((tier, idx) => 
        idx === tierIndex 
          ? { ...tier, benefit: tier.benefit?.filter((_, bIdx) => bIdx !== benefitIndex) || [] }
          : tier
      )
    }));
  };

  // Pertanyaan Tambahan functions
  const addOpsiPilihan = () => {
    if (newOpsiPilihan.trim()) {
      setTempOpsiList(prev => [...prev, newOpsiPilihan.trim()]);
      setNewOpsiPilihan('');
    }
  };

  const removeOpsiPilihan = (index: number) => {
    setTempOpsiList(prev => prev.filter((_, i) => i !== index));
  };

  const addPertanyaan = () => {
    console.log('addPertanyaan called!');
    console.log('newPertanyaan:', newPertanyaan);
    console.log('newTipeJawaban:', newTipeJawaban);
    console.log('tempOpsiList:', tempOpsiList);
    
    if (newPertanyaan.trim()) {
      const newQ: PertanyaanTambahan = {
        pertanyaan: newPertanyaan.trim(),
        tipeJawaban: newTipeJawaban,
        opsiPilihan: newTipeJawaban === 'pilihan' ? [...tempOpsiList] : undefined
      };
      
      console.log('Adding pertanyaan:', newQ);
      
      setFormData(prev => {
        console.log('Previous pertanyaanTambahan:', prev.pertanyaanTambahan);
        const updated = {
          ...prev,
          pertanyaanTambahan: [...(prev.pertanyaanTambahan || []), newQ]
        };
        console.log('Updated formData pertanyaanTambahan:', updated.pertanyaanTambahan);
        return updated;
      });
      
      setNewPertanyaan('');
      setNewTipeJawaban('text');
      setTempOpsiList([]);
      
      console.log('Pertanyaan added successfully!');
    } else {
      console.log('Pertanyaan is empty, not adding');
    }
  };

  const removePertanyaan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pertanyaanTambahan: prev.pertanyaanTambahan?.filter((_, i) => i !== index)
    }));
  };

  // Sponsor functions
  const addSponsor = () => {
    if (newSponsorNama.trim()) {
      const newS: Sponsor = {
        namaSponsor: newSponsorNama.trim(),
        logoSponsor: newSponsorLogo.trim(),
        linkWebSponsor: newSponsorLink.trim()
      };
      
      setFormData(prev => ({
        ...prev,
        sponsor: [...(prev.sponsor || []), newS]
      }));
      
      setNewSponsorNama('');
      setNewSponsorLogo('');
      setNewSponsorLink('');
    }
  };

  const removeSponsor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sponsor: prev.sponsor?.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          flyerImage: data.url
        }));
      } else {
        setUploadError(data.error || 'Upload gagal');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSponsorLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSponsorLogo(true);
    setSponsorLogoError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setNewSponsorLogo(data.url);
      } else {
        setSponsorLogoError(data.error || 'Upload gagal');
      }
    } catch (error) {
      console.error('Error uploading sponsor logo:', error);
      setSponsorLogoError('Terjadi kesalahan saat upload');
    } finally {
      setIsUploadingSponsorLogo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.jenisKepesertaan.length === 0) {
      alert('Tambahkan minimal 1 jenis kepesertaan (tier)');
      return;
    }
    
    console.log('Form data before save:', formData);
    console.log('PertanyaanTambahan before save:', formData.pertanyaanTambahan);
    console.log('Sponsor before save:', formData.sponsor);
    
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Tambah Event Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kodeEvent">Kode Event</Label>
              <Input
                id="kodeEvent"
                value={formData.kodeEvent}
                onChange={(e) => setFormData({...formData, kodeEvent: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="namaEvent">Nama Event</Label>
              <Input
                id="namaEvent"
                value={formData.namaEvent}
                onChange={(e) => setFormData({...formData, namaEvent: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tema">Tema</Label>
            <Textarea
              id="tema"
              value={formData.tema}
              onChange={(e) => setFormData({...formData, tema: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Deskripsi Event</Label>
            <RichTextEditor
              content={formData.deskripsi || ''}
              onChange={(content) => setFormData({...formData, deskripsi: content})}
              placeholder="Tulis deskripsi detail tentang event..."
            />
          </div>

          <div>
            <Label>Pemateri</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPemateri}
                onChange={(e) => setNewPemateri(e.target.value)}
                placeholder="Nama pemateri"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPemateri())}
              />
              <Button type="button" onClick={addPemateri}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.pemateri.map((pemateri, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {pemateri}
                  <button 
                    type="button"
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5" 
                    onClick={(e) => {
                      e.preventDefault();
                      removePemateri(index);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Waktu Event</Label>
            <div className="space-y-2 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  value={newWaktuHari}
                  onChange={(e) => setNewWaktuHari(e.target.value)}
                  placeholder="Hari (contoh: Senin)"
                />
                <Input
                  value={newWaktuTanggal}
                  onChange={(e) => setNewWaktuTanggal(e.target.value)}
                  placeholder="Tanggal (contoh: 15 Januari 2024)"
                />
                <Input
                  value={newWaktuJam}
                  onChange={(e) => setNewWaktuJam(e.target.value)}
                  placeholder="Jam (contoh: 19:00 - 21:00)"
                />
                <Button type="button" onClick={addWaktu} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.waktuEvent.map((waktu, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 py-2 px-3">
                  <div className="flex flex-col text-left">
                    {waktu.hari && <span className="font-semibold">{waktu.hari}</span>}
                    {waktu.tanggal && <span className="text-xs">{waktu.tanggal}</span>}
                    {waktu.jam && <span className="text-xs">{waktu.jam}</span>}
                  </div>
                  <button 
                    type="button"
                    className="ml-2 hover:bg-gray-300 rounded-full p-0.5" 
                    onClick={(e) => {
                      e.preventDefault();
                      removeWaktu(index);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Jenis Kepesertaan</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={newTierNama}
                  onChange={(e) => setNewTierNama(e.target.value)}
                  placeholder="Nama tier (e.g., Gratis, VIP)"
                />
                <Input
                  type="number"
                  value={newTierHarga}
                  onChange={(e) => setNewTierHarga(parseInt(e.target.value) || 0)}
                  placeholder="Harga (Rp)"
                />
                <div className="flex gap-2">
                  <Input
                    value={newTierLink}
                    onChange={(e) => setNewTierLink(e.target.value)}
                    placeholder="Link Grup WA"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addParticipationTier}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {formData.jenisKepesertaan.map((tier, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{tier.nama}</Badge>
                          <span className="text-sm font-semibold text-emerald-600">
                            Rp {tier.harga.toLocaleString('id-ID')}
                          </span>
                        </div>
                        {tier.linkGrupWa && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            WA: {tier.linkGrupWa}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipationTier(index)}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>

                    {/* Benefits for this tier */}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <Label className="text-xs text-gray-600">Benefit untuk tier ini:</Label>
                      <div className="flex gap-2 mt-1 mb-2">
                        <Input
                          value={editingTierIndex === index ? newTierBenefit : ''}
                          onChange={(e) => {
                            setEditingTierIndex(index);
                            setNewTierBenefit(e.target.value);
                          }}
                          placeholder="Tambah benefit"
                          className="text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addBenefitToTier(index);
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={() => addBenefitToTier(index)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(tier.benefit || []).map((benefit, bIdx) => (
                          <Badge key={bIdx} variant="outline" className="text-xs flex items-center gap-1">
                            {benefit}
                            <button 
                              type="button"
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5" 
                              onClick={(e) => {
                                e.preventDefault();
                                removeBenefitFromTier(index, bIdx);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                        {(!tier.benefit || tier.benefit.length === 0) && (
                          <span className="text-xs text-gray-400">Belum ada benefit</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {formData.jenisKepesertaan.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada tier kepesertaan. Tambahkan minimal 1 tier.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Kode Voucher (opsional)</Label>
            <div className="grid grid-cols-12 gap-2 mb-2">
              <Input
                value={newVoucherKode}
                onChange={(e) => setNewVoucherKode(e.target.value)}
                placeholder="Kode voucher (contoh: DISKON50)"
                className="col-span-5"
              />
              <Input
                type="number"
                value={newVoucherPotongan}
                onChange={(e) => setNewVoucherPotongan(parseInt(e.target.value) || 0)}
                placeholder="Nominal"
                className="col-span-3"
                min="0"
              />
              <Select 
                value={newVoucherJenis} 
                onValueChange={(value: 'persen' | 'rupiah') => setNewVoucherJenis(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="persen">%</SelectItem>
                  <SelectItem value="rupiah">Rupiah</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addVoucher} className="col-span-1">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.kodeVoucher.map((voucher, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {typeof voucher === 'string' 
                    ? voucher 
                    : `${voucher.kode} (${voucher.jenisPotongan === 'persen' ? voucher.potongan + '%' : 'Rp ' + voucher.potongan.toLocaleString('id-ID')})`
                  }
                  <button 
                    type="button"
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5" 
                    onClick={(e) => {
                      e.preventDefault();
                      removeVoucher(index);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Flyer Image</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
              
              {formData.flyerImage && (
                <div className="relative border rounded-lg p-2 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Preview:</p>
                      <img 
                        src={formData.flyerImage} 
                        alt="Flyer preview" 
                        className="mt-2 max-w-full max-h-48 rounded object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({...formData, flyerImage: ''})}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Atau masukkan URL gambar:
              </div>
              <Input
                value={formData.flyerImage}
                onChange={(e) => setFormData({...formData, flyerImage: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <Label>Pertanyaan Tambahan untuk Pendaftaran (opsional)</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Input
                  value={newPertanyaan}
                  onChange={(e) => setNewPertanyaan(e.target.value)}
                  placeholder="Tulis pertanyaan (contoh: Apa motivasi Anda?)"
                />
                <div className="flex gap-2 items-center">
                  <Label className="text-sm">Tipe Jawaban:</Label>
                  <Select 
                    value={newTipeJawaban} 
                    onValueChange={(value: 'text' | 'pilihan') => {
                      setNewTipeJawaban(value);
                      if (value === 'text') {
                        setTempOpsiList([]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Free Text</SelectItem>
                      <SelectItem value="pilihan">Pilihan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newTipeJawaban === 'pilihan' && (
                  <div className="ml-4 space-y-2 p-3 bg-gray-50 rounded border">
                    <Label className="text-xs">Opsi Pilihan:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newOpsiPilihan}
                        onChange={(e) => setNewOpsiPilihan(e.target.value)}
                        placeholder="Tambah opsi pilihan"
                        className="text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOpsiPilihan();
                          }
                        }}
                      />
                      <Button type="button" size="sm" onClick={addOpsiPilihan}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tempOpsiList.map((opsi, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs flex items-center gap-1">
                          {opsi}
                          <button 
                            type="button"
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5" 
                            onClick={(e) => {
                              e.preventDefault();
                              removeOpsiPilihan(idx);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button type="button" onClick={addPertanyaan} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pertanyaan
                </Button>
              </div>
              
              <div className="space-y-2">
                {(formData.pertanyaanTambahan || []).map((q, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{q.pertanyaan}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {q.tipeJawaban === 'text' ? 'Free Text' : 'Pilihan'}
                        </Badge>
                        {q.tipeJawaban === 'pilihan' && q.opsiPilihan && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {q.opsiPilihan.map((opsi, oIdx) => (
                              <Badge key={oIdx} variant="secondary" className="text-xs">
                                {opsi}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePertanyaan(index)}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Sponsor Event (opsional)</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Input
                  value={newSponsorNama}
                  onChange={(e) => setNewSponsorNama(e.target.value)}
                  placeholder="Nama Sponsor"
                />
                
                <div>
                  <Label className="text-xs text-gray-600">Logo Sponsor</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSponsorLogoUpload}
                      disabled={isUploadingSponsorLogo}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={isUploadingSponsorLogo}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingSponsorLogo ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  {sponsorLogoError && (
                    <p className="text-xs text-red-600 mt-1">{sponsorLogoError}</p>
                  )}
                  {newSponsorLogo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border flex items-center gap-2">
                      <img 
                        src={newSponsorLogo} 
                        alt="Logo preview" 
                        className="h-12 w-12 object-contain"
                      />
                      <span className="text-xs text-gray-600 flex-1 truncate">{newSponsorLogo}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewSponsorLogo('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Atau masukkan URL logo:
                  </div>
                  <Input
                    value={newSponsorLogo}
                    onChange={(e) => setNewSponsorLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newSponsorLink}
                    onChange={(e) => setNewSponsorLink(e.target.value)}
                    placeholder="Link Website Sponsor"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSponsor}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(formData.sponsor || []).map((sponsor, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {sponsor.logoSponsor && (
                        <img 
                          src={sponsor.logoSponsor} 
                          alt={sponsor.namaSponsor}
                          className="w-12 h-12 object-contain rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sponsor.namaSponsor}</p>
                        {sponsor.linkWebSponsor && (
                          <a 
                            href={sponsor.linkWebSponsor}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                          >
                            {sponsor.linkWebSponsor}
                          </a>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSponsor(index)}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="statusEvent">Status Event</Label>
            <Select 
              value={formData.statusEvent} 
              onValueChange={(value) => setFormData({...formData, statusEvent: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendaftaran">Pendaftaran</SelectItem>
                <SelectItem value="Berjalan">Berjalan</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}