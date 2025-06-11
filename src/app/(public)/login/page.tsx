'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { LucideArrowRight, LucideLoader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login({ email, password });
      // Redirect is handled in the AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Background image or branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 text-white p-10 flex-col">
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3">LEGIS-FLOW</h1>
            <p className="text-xl opacity-80">
              La solution intégrée de gestion des textes normatifs
            </p>
          </div>
          <div className="w-3/4 aspect-square relative">
            {/* You can add an illustration here */}
            <div className="bg-primary-300 bg-opacity-20 rounded-full absolute inset-0"></div>
          </div>
        </div>
        <div className="mt-auto text-sm opacity-70">
          <p>© 2024 LEGIS-FLOW - Tous droits réservés</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col p-6 md:p-10 justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Connexion</h2>
          <p className="text-slate-500">
            Accédez à votre espace de travail pour gérer vos documents
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="votre@email.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                Mot de passe oublié?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LucideLoader2 className="animate-spin mr-2 h-4 w-4" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <LucideArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Pas encore de compte?{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 