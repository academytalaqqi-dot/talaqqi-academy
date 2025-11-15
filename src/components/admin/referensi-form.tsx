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
}

export function ReferensiForm() {
  const [formData, setFormData] = useState<Referensi>({
    namaLembaga: '',
    nomorRekening: '',
    namaBank: '',
    namaPemilik: '',
    noWhatsappAdmin: '',
    logo: ''
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
      setFormData(data);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="namaLembaga">Nama Lembaga</Label>
                <Input
                  id="namaLembaga"
                  value={formData.namaLembaga}
                  onChange={(e) => setFormData({...formData, namaLembaga: e.target.value})}
                  placeholder="Talaqqi Academy"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nomorRekening">Nomor Rekening</Label>
                <Input
                  id="nomorRekening"
                  value={formData.nomorRekening}
                  onChange={(e) => setFormData({...formData, nomorRekening: e.target.value})}
                  placeholder="1234567890"
                  required
                />
              </div>

              <div>
                <Label htmlFor="namaBank">Nama Bank</Label>
                <Input
                  id="namaBank"
                  value={formData.namaBank}
                  onChange={(e) => setFormData({...formData, namaBank: e.target.value})}
                  placeholder="Bank Syariah Indonesia"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="namaPemilik">Nama Pemilik Rekening</Label>
                <Input
                  id="namaPemilik"
                  value={formData.namaPemilik}
                  onChange={(e) => setFormData({...formData, namaPemilik: e.target.value})}
                  placeholder="Talaqqi Academy"
                  required
                />
              </div>

              <div>
                <Label htmlFor="noWhatsappAdmin">No. WhatsApp Admin</Label>
                <Input
                  id="noWhatsappAdmin"
                  value={formData.noWhatsappAdmin}
                  onChange={(e) => setFormData({...formData, noWhatsappAdmin: e.target.value})}
                  placeholder="+628123456789"
                  required
                />
              </div>

              <div>
                <Label htmlFor="logo">URL Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {formData.logo && (
                  <div className="mt-2">
                    <img 
                      src={formData.logo} 
                      alt="Logo" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
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