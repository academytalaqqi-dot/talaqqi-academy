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

interface Event {
  id?: string;
  kodeEvent: string;
  namaEvent: string;
  pemateri: string[];
  tema: string;
  waktuEvent: string[];
  jenisKepesertaan: string;
  nominalInfaq: number;
  benefit: string[];
  kodeVoucher: string[];
  flyerImage: string;
  linkGrupWa: string;
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
    jenisKepesertaan: 'Gratis',
    nominalInfaq: 0,
    benefit: [],
    kodeVoucher: [],
    flyerImage: '',
    linkGrupWa: '',
    statusEvent: 'Pendaftaran'
  });

  const [newPemateri, setNewPemateri] = useState('');
  const [newWaktu, setNewWaktu] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newVoucher, setNewVoucher] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        pemateri: Array.isArray(event.pemateri) ? event.pemateri : JSON.parse(event.pemateri || '[]'),
        waktuEvent: Array.isArray(event.waktuEvent) ? event.waktuEvent : JSON.parse(event.waktuEvent || '[]'),
        benefit: Array.isArray(event.benefit) ? event.benefit : JSON.parse(event.benefit || '[]'),
        kodeVoucher: Array.isArray(event.kodeVoucher) ? event.kodeVoucher : JSON.parse(event.kodeVoucher || '[]'),
      });
    } else {
      setFormData({
        kodeEvent: '',
        namaEvent: '',
        pemateri: [],
        tema: '',
        waktuEvent: [],
        jenisKepesertaan: 'Gratis',
        nominalInfaq: 0,
        benefit: [],
        kodeVoucher: [],
        flyerImage: '',
        linkGrupWa: '',
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
    if (newVoucher.trim()) {
      setFormData(prev => ({
        ...prev,
        kodeVoucher: [...prev.kodeVoucher, newVoucher.trim()]
      }));
      setNewVoucher('');
    }
  };

  const removeVoucher = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kodeVoucher: prev.kodeVoucher.filter((_, i) => i !== index)
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jenisKepesertaan">Jenis Kepesertaan</Label>
              <Select 
                value={formData.jenisKepesertaan} 
                onValueChange={(value) => setFormData({...formData, jenisKepesertaan: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gratis">Gratis</SelectItem>
                  <SelectItem value="Berbayar">Berbayar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nominalInfaq">Nominal Infaq</Label>
              <Input
                id="nominalInfaq"
                type="number"
                value={formData.nominalInfaq}
                onChange={(e) => setFormData({...formData, nominalInfaq: parseInt(e.target.value) || 0})}
                disabled={formData.jenisKepesertaan === 'Gratis'}
              />
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
                value={newVoucher}
                onChange={(e) => setNewVoucher(e.target.value)}
                placeholder="Kode voucher"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVoucher())}
              />
              <Button type="button" onClick={addVoucher}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.kodeVoucher.map((voucher, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {voucher}
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
            <Label htmlFor="linkGrupWa">Link Grup WhatsApp</Label>
            <Input
              id="linkGrupWa"
              value={formData.linkGrupWa}
              onChange={(e) => setFormData({...formData, linkGrupWa: e.target.value})}
              placeholder="https://chat.whatsapp.com/..."
            />
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