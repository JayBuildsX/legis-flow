'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LucideLoader2, LucideUser, LucideBuilding, LucideMail, LucideLock } from 'lucide-react';
import MFAManager from '@/components/auth/MFAManager';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LucideLoader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du profil...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!name || !email) {
      setError('Le nom et l\'email sont requis');
      return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    // In a real app, this would call an API to update the profile
    try {
      setIsSubmitting(true);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil utilisateur</h1>
        <p className="text-slate-500 mt-1">Consultez et modifiez vos informations personnelles</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-6 text-sm border border-green-200">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-medium text-slate-800">Informations personnelles</h2>
            <p className="text-slate-500 text-sm mt-1">Vos informations de profil</p>
          </div>
          
          {!isEditing ? (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setName(user?.name || '');
                setEmail(user?.email || '');
                setOrganization(user?.organization || '');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError(null);
              }}
            >
              Annuler
            </Button>
          )}
        </div>
        
        {!isEditing ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Nom complet</p>
                <p className="text-slate-800">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
                <p className="text-slate-800">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Organisation</p>
                <p className="text-slate-800">{user?.organization || 'Non spécifiée'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Rôle</p>
                <p className="text-slate-800 capitalize">{user?.role || 'Utilisateur'}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideUser className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Jean Dupont"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideMail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="votre@email.com"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-1">
                  Organisation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideBuilding className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nom de votre organisation"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rôle
                </label>
                <input
                  type="text"
                  value={user?.role || 'Utilisateur'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 text-slate-800 capitalize"
                  disabled
                />
                <p className="text-xs text-slate-500 mt-1">Le rôle ne peut pas être modifié</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200 mt-6">
              <h3 className="text-md font-medium text-slate-800 mb-4">Changer le mot de passe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideLock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Entrez votre mot de passe actuel"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="col-span-1"></div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideLock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nouveau mot de passe"
                      disabled={isSubmitting}
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideLock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Confirmer le mot de passe"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LucideLoader2 className="animate-spin mr-2 h-4 w-4" />
                    Enregistrement...
                  </>
                ) : (
                  <>Enregistrer les modifications</>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* MFA Security Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Sécurité</h2>
          <p className="text-slate-500 mt-1">Gérez la sécurité de votre compte</p>
        </div>
        <MFAManager />
      </div>
    </div>
  );
} 