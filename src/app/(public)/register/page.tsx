'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LucideEye, LucideEyeOff, LucideLoader2, LucideShield, LucideUser, LucideMail, LucideBuilding } from 'lucide-react';
import Link from 'next/link';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Le nom est requis';
    if (!formData.email.trim()) return 'L\'email est requis';
    if (!formData.password) return 'Le mot de passe est requis';
    if (formData.password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (formData.password !== formData.confirmPassword) return 'Les mots de passe ne correspondent pas';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Format d\'email invalide';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organization: formData.organization
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          organization: ''
        });
      } else {
        setError(data.message || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <LucideShield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Ou{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Créez votre compte pour accéder à LEGIS-FLOW
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="name">Nom complet</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideUser className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="pl-10"
                    placeholder="Admin User"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideMail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organization">Organisation (optionnel)</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideBuilding className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    className="pl-10"
                    placeholder="Votre organisation"
                    value={formData.organization}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="pr-10"
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <LucideEyeOff className="h-5 w-5" />
                      ) : (
                        <LucideEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="pr-10"
                    placeholder="Confirmer votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <LucideEyeOff className="h-5 w-5" />
                      ) : (
                        <LucideEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LucideLoader2 className="animate-spin mr-2 h-4 w-4" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            En créant un compte, vous acceptez nos{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 