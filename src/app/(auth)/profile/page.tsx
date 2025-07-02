'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Building, Shield, Bell, Key, Save, Camera } from 'lucide-react';
import MFAManager from '@/components/auth/MFAManager';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    organization: 'Ministère de l\'Économie et des Finances',
    role: 'Administrateur',
    phone: '+33 1 23 45 67 89',
    bio: 'Responsable de la gestion documentaire et des workflows législatifs.'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    workflow: true,
    documents: true
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    lastLogin: '2024-01-15 14:30:00',
    sessionsActive: 2
  });

  const handleSave = () => {
    // Here you would typically call an API to update the profile
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Vos informations de base et de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Changer la photo
                    </Button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Admin User"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organisation</Label>
                    <Input
                      id="organization"
                      value={profile.organization}
                      onChange={(e) => setProfile(prev => ({ ...prev, organization: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <textarea
                    id="bio"
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                {/* Role Badge */}
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Rôle:</span>
                  <Badge variant="default">{profile.role}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Préférences de notification
                </CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir les notifications importantes par email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Notifications push</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications push dans le navigateur
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="workflow-notifications">Notifications de workflow</Label>
                      <p className="text-sm text-gray-500">
                        Être notifié des changements d'étapes de workflow
                      </p>
                    </div>
                    <Switch
                      id="workflow-notifications"
                      checked={notifications.workflow}
                      onCheckedChange={(checked) => handleNotificationChange('workflow', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="document-notifications">Notifications de documents</Label>
                      <p className="text-sm text-gray-500">
                        Être notifié des modifications de documents
                      </p>
                    </div>
                    <Switch
                      id="document-notifications"
                      checked={notifications.documents}
                      onCheckedChange={(checked) => handleNotificationChange('documents', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Sécurité et confidentialité
                </CardTitle>
                <CardDescription>
                  Gérez vos paramètres de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-500">
                        Ajouter une couche de sécurité supplémentaire à votre compte
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactor: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Dernière connexion</Label>
                    <p className="text-sm text-gray-600">{security.lastLogin}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Sessions actives</Label>
                    <p className="text-sm text-gray-600">
                      {security.sessionsActive} session{security.sessionsActive > 1 ? 's' : ''} active{security.sessionsActive > 1 ? 's' : ''}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline">
                      Changer le mot de passe
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Déconnecter toutes les sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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