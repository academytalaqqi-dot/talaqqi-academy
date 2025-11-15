'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';

interface ParticipationTier {
  nama: string;
  harga: number;
  linkGrupWa: string;
}

interface Event {
  id?: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string[];
  tema: string;
  waktuEvent: string[];
  jenisKepesertaan: ParticipationTier[];
  benefit: string[];
  kodeVoucher: string[];
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
    waktuEvent: [],
    jenisKepesertaan: [],
    benefit: [],
    kodeVoucher: [],
    flyerImage: '',
    statusEvent: 'Pendaftaran'
  });

  const [newPemateri, setNewPemateri] = useState('');
  const [newWaktu, setNewWaktu] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newVoucherKode, setNewVoucherKode] = useState('');
  const [newVoucherPotongan, setNewVoucherPotongan] = useState(0);
  const [newTierNama, setNewTierNama] = useState('');
  const [newTierHarga, setNewTierHarga] = useState(0);
  const [newTierLink, setNewTierLink] = useState('');
  const [newTierBenefit, setNewTierBenefit] = useState('');
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (event) {
      try {
        const parsePemateri = () => {
          if (Array.isArray(event.pemateri)) return event.pemateri;
          if (typeof event.pemateri === 'string') return JSON.parse(event.pemateri || '[]');
          return [];
        };

        const parseWaktuEvent = () => {
          if (Array.isArray(event.waktuEvent)) return event.waktuEvent;
          if (typeof event.waktuEvent === 'string') return JSON.parse(event.waktuEvent || '[]');
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
          if (Array.isArray(event.kodeVoucher)) return event.kodeVoucher;
          if (typeof event.kodeVoucher === 'string') {
            try {
              const parsed = JSON.parse(event.kodeVoucher || '[]');
              // Convert old format (string array) to new format (object array)
              if (parsed.length > 0 && typeof parsed[0] === 'string') {
                return parsed.map((kode: string) => ({ kode, potongan: 10 }));
              }
              return parsed;
            } catch {
              return [];
            }
          }
          return [];
        };

        setFormData({
          ...event,
          pemateri: parsePemateri(),
          waktuEvent: parseWaktuEvent(),
          jenisKepesertaan: parseJenisKepesertaan(),
          benefit: parseBenefit(),
          kodeVoucher: parseKodeVoucher(),
        });
      } catch (error) {
        console.error('Error parsing event data:', error);
        // Reset to empty form on error
        setFormData({
          kodeEvent: '',
          namaEvent: '',
          pemateri: [],
          tema: '',
          waktuEvent: [],
          jenisKepesertaan: [],
          benefit: [],
          kodeVoucher: [],
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
        waktuEvent: [],
        jenisKepesertaan: [],
        benefit: [],
        kodeVoucher: [],
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
    if (newWaktu.trim()) {
      setFormData(prev => ({
        ...prev,
        waktuEvent: [...prev.waktuEvent, newWaktu.trim()]
      }));
      setNewWaktu('');
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
          potongan: newVoucherPotongan
        }]
      }));
      setNewVoucherKode('');
      setNewVoucherPotongan(0);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.jenisKepesertaan.length === 0) {
      alert('Tambahkan minimal 1 jenis kepesertaan (tier)');
      return;
    }
    
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
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removePemateri(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Waktu Event</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newWaktu}
                onChange={(e) => setNewWaktu(e.target.value)}
                placeholder="Contoh: 2024-01-15 19:00"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWaktu())}
              />
              <Button type="button" onClick={addWaktu}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.waktuEvent.map((waktu, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {waktu}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeWaktu(index)}
                  />
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
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => removeBenefitFromTier(index, bIdx)}
                            />
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
            <Label>Benefit</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Benefit yang didapat"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button type="button" onClick={addBenefit}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefit.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {benefit}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeBenefit(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Kode Voucher (opsional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newVoucherKode}
                onChange={(e) => setNewVoucherKode(e.target.value)}
                placeholder="Kode voucher (contoh: DISKON50)"
                className="flex-1"
              />
              <Input
                type="number"
                value={newVoucherPotongan}
                onChange={(e) => setNewVoucherPotongan(parseInt(e.target.value) || 0)}
                placeholder="Diskon %"
                className="w-24"
                min="0"
                max="100"
              />
              <Button type="button" onClick={addVoucher}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.kodeVoucher.map((voucher, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {typeof voucher === 'string' ? voucher : `${voucher.kode} (${voucher.potongan}%)`}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeVoucher(index)}
                  />
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