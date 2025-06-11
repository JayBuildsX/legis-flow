import { Button } from '@/components/ui/button';
import { LucideBuilding, LucideUser, LucideUsers, LucideSettings } from 'lucide-react';

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
}

const AdminCard = ({ title, description, icon, count }: AdminCardProps) => {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-md bg-primary-100 p-2 text-primary-600">
          {icon}
        </div>
        {count !== undefined && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {count}
          </span>
        )}
      </div>
      <h3 className="mb-2 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-600">{description.replace(/'/g, "&apos;")}</p>
      <div className="mt-auto">
        <Button size="sm" className="w-full">Gérer</Button>
      </div>
    </div>
  );
};

export default function Admin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Administration</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          title="Utilisateurs"
          description="Gérer les utilisateurs, les rôles et les permissions"
          icon={<LucideUsers size={24} />}
          count={48}
        />
        
        <AdminCard
          title="Organisations"
          description="Gérer la structure organisationnelle"
          icon={<LucideBuilding size={24} />}
          count={12}
        />
        
        <AdminCard
          title="Types de documents"
          description="Configurer les modèles et types de documents"
          icon={<LucideUser size={24} />}
          count={15}
        />
        
        <AdminCard
          title="Paramètres système"
          description="Configuration générale du système"
          icon={<LucideSettings size={24} />}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-slate-900">Activité récente</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <LucideUser size={16} />
            </div>
            <div>
              <p className="text-sm text-slate-800">
                <span className="font-medium">Martin Dupont</span> a créé un nouvel utilisateur: <span className="font-medium">Sophie Martin</span>
              </p>
              <p className="text-xs text-slate-500">Il y a 2 heures</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <LucideBuilding size={16} />
            </div>
            <div>
              <p className="text-sm text-slate-800">
                <span className="font-medium">Julien Bernard</span> a modifié l'organisation: <span className="font-medium">Ministère de l'Économie</span>
              </p>
              <p className="text-xs text-slate-500">Il y a 5 heures</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <LucideSettings size={16} />
            </div>
            <div>
              <p className="text-sm text-slate-800">
                <span className="font-medium">Admin système</span> a mis à jour les paramètres système
              </p>
              <p className="text-xs text-slate-500">Hier à 15:32</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="link" size="sm">Voir toute l'activité</Button>
        </div>
      </div>
    </div>
  );
} 