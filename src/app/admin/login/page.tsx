'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [namaLembaga, setNamaLembaga] = useState('Talaqqi Academy');
  const [logoLembaga, setLogoLembaga] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchReferensi();
  }, []);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          {logoLembaga ? (
            <div className="flex items-center justify-center mb-4">
              <img src={logoLembaga} alt="Logo" className="h-20 w-20 object-contain rounded-full overflow-hidden border-2 border-emerald-700" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-800 font-bold text-2xl">TA</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-emerald-800">{namaLembaga}</h1>
          <p className="text-emerald-600">Portal Admin</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-emerald-800 flex items-center justify-center">
              <LogIn className="w-5 h-5 mr-2" />
              Login Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@talaqqi.academy"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="text-emerald-600 hover:text-emerald-800"
              >
                Kembali ke Halaman Utama
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}