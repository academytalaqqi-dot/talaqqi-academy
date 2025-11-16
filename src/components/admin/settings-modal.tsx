'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextEditor } from './rich-text-editor';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [landingRedaction, setLandingRedaction] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Password baru tidak cocok!');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Password berhasil diubah!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Gagal mengubah password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLandingRedaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingPageRedaction: landingRedaction,
        }),
      });

      if (response.ok) {
        setMessage('✅ Redaksi berhasil disimpan!');
      } else {
        setMessage('❌ Gagal menyimpan redaksi');
      }
    } catch (error) {
      setMessage('❌ Gagal menyimpan redaksi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pengaturan Admin</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">User & Password</TabsTrigger>
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
          </TabsList>

          {/* Tab 1: Password Management */}
          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Password Saat Ini</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">Password Baru</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password baru"
                      required
                    />
                  </div>

                  {message && (
                    <div className={`p-3 rounded text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {message}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {loading ? 'Menyimpan...' : 'Ubah Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Landing Page Redaction */}
          <TabsContent value="landing" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Redaksi Halaman Utama (WYSIWYG Editor)</Label>
                  <RichTextEditor
                    value={landingRedaction}
                    onChange={setLandingRedaction}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Gunakan toolbar untuk format teks. HTML akan ditampilkan sesuai format di halaman utama.
                  </p>
                </div>

                {message && (
                  <div className={`p-3 rounded text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>
                )}

                <Button onClick={handleSaveLandingRedaction} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {loading ? 'Menyimpan...' : 'Simpan Redaksi'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
