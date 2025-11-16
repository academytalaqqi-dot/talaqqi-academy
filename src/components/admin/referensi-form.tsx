'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Save, Upload } from 'lucide-react';

interface Referensi {
  id?: string;
  namaLembaga: string;
  nomorRekening: string;
  namaBank: string;
  namaPemilik: string;
  noWhatsappAdmin: string;
  logo: string;
  instagram?: string;
  telegram?: string;
  whatsappChannel?: string;
  facebook?: string;
  threads?: string;
  youtube?: string;
}

export function ReferensiForm() {
  const [formData, setFormData] = useState<Referensi>({
    namaLembaga: '',
    nomorRekening: '',
    namaBank: '',
    namaPemilik: '',
    noWhatsappAdmin: '',
    logo: '',
    instagram: '',
    telegram: '',
    whatsappChannel: '',
    facebook: '',
    threads: '',
    youtube: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchReferensi();
  }, []);

  const fetchReferensi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/referensi');
      const data = await response.json();
      // Ensure all fields are strings to prevent null value warnings
      setFormData({
        namaLembaga: data.namaLembaga || '',
        nomorRekening: data.nomorRekening || '',
        namaBank: data.namaBank || '',
        namaPemilik: data.namaPemilik || '',
        noWhatsappAdmin: data.noWhatsappAdmin || '',
        logo: data.logo || '',
        instagram: data.instagram || '',
        telegram: data.telegram || '',
        whatsappChannel: data.whatsappChannel || '',
        facebook: data.facebook || '',
        threads: data.threads || '',
        youtube: data.youtube || ''
      });
    } catch (error) {
      console.error('Error fetching referensi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/referensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Data referensi berhasil disimpan');
      } else {
        alert('Gagal menyimpan data referensi');
      }
    } catch (error) {
      console.error('Error saving referensi:', error);
      alert('Gagal menyimpan data referensi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-emerald-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Kelola Informasi Lembaga
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Lembaga */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informasi Lembaga</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="namaLembaga">Nama Lembaga *</Label>
                <Input
                  id="namaLembaga"
                  value={formData.namaLembaga}
                  onChange={(e) => setFormData({...formData, namaLembaga: e.target.value})}
                  placeholder="Talaqqi Academy"
                  required
                />
              </div>

              <div>
                <Label htmlFor="noWhatsappAdmin">No. WhatsApp Admin *</Label>
                <Input
                  id="noWhatsappAdmin"
                  value={formData.noWhatsappAdmin}
                  onChange={(e) => setFormData({...formData, noWhatsappAdmin: e.target.value})}
                  placeholder="+628123456789"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="logo">Upload File Gambar Logo Lembaga</Label>
                <p className="text-xs text-gray-500 mb-3">Format: JPG, PNG, GIF, WebP | Ukuran max: 5MB</p>
                
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition">
                  <input
                    id="logo-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      
                      // Check file size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Ukuran file terlalu besar. Maksimal 5MB');
                        return;
                      }
                      
                      const form = new FormData();
                      form.append('file', file);
                      try {
                        setIsSaving(true);
                        const uploadRes = await fetch('/api/upload', {
                          method: 'POST',
                          body: form,
                        });
                        const uploadData = await uploadRes.json();
                        if (uploadData && uploadData.url) {
                          setFormData({...formData, logo: uploadData.url});
                          alert('File berhasil diupload!');
                        } else {
                          alert('Gagal mengupload file logo');
                        }
                      } catch (err) {
                        console.error('Upload error:', err);
                        alert('Gagal mengupload file logo');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  />
                  
                  <label htmlFor="logo-file" className="cursor-pointer block text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="font-medium text-gray-800">Klik untuk pilih file atau drag & drop</p>
                        <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP - Maks 5MB</p>
                      </div>
                      <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 mt-2">
                        📁 Browse File
                      </Button>
                    </div>
                  </label>
                </div>

                {/* Logo Preview */}
                {formData.logo && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview Logo:</p>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={formData.logo} 
                        alt="Logo" 
                        className="w-24 h-24 object-contain rounded border border-gray-300 p-1 bg-white"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 break-all">{formData.logo}</p>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          className="mt-2"
                          onClick={() => setFormData({...formData, logo: ''})}
                        >
                          🗑️ Hapus Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Rekening */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informasi Rekening</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="namaBank">Nama Bank *</Label>
                <Input
                  id="namaBank"
                  value={formData.namaBank}
                  onChange={(e) => setFormData({...formData, namaBank: e.target.value})}
                  placeholder="Bank Syariah Indonesia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nomorRekening">Nomor Rekening *</Label>
                <Input
                  id="nomorRekening"
                  value={formData.nomorRekening}
                  onChange={(e) => setFormData({...formData, nomorRekening: e.target.value})}
                  placeholder="1234567890"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="namaPemilik">Nama Pemilik Rekening *</Label>
                <Input
                  id="namaPemilik"
                  value={formData.namaPemilik}
                  onChange={(e) => setFormData({...formData, namaPemilik: e.target.value})}
                  placeholder="Nama sesuai rekening bank"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media Sosial */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Media Sosial & Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  placeholder="@talaqqi_academy"
                />
              </div>

              <div>
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                  placeholder="@talaqqi_academy"
                />
              </div>

              <div>
                <Label htmlFor="whatsappChannel">WhatsApp Channel</Label>
                <Input
                  id="whatsappChannel"
                  value={formData.whatsappChannel}
                  onChange={(e) => setFormData({...formData, whatsappChannel: e.target.value})}
                  placeholder="https://whatsapp.com/channel/..."
                />
              </div>

              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  placeholder="https://facebook.com/talaqqi_academy"
                />
              </div>

              <div>
                <Label htmlFor="threads">Threads</Label>
                <Input
                  id="threads"
                  value={formData.threads}
                  onChange={(e) => setFormData({...formData, threads: e.target.value})}
                  placeholder="@talaqqi_academy"
                />
              </div>

              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube}
                  onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                  placeholder="https://youtube.com/@talaqqi_academy"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t pt-6">
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}