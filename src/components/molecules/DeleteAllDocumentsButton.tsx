'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function DeleteAllDocumentsButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const deleteAllDocuments = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      // Get the auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      console.log('Auth token available:', !!authToken);
      
      if (!authToken) {
        setError('Vous devez être connecté pour effectuer cette action');
        return;
      }

      console.log('Starting document deletion request');
      
      // Make request to delete all documents
      const response = await fetch('/api/v1/documents/reset', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      const result = await response.json();
      console.log('Delete response data:', result);

      if (response.ok) {
        console.log('Documents deleted successfully, refreshing UI');
        // Close dialog
        setOpen(false);
        
        // Force refresh with multiple approaches to ensure UI updates
        setTimeout(() => {
          // 1. Refresh Next.js router cache
          router.refresh();
          
          // 2. Force the current page to reload completely after a moment
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }, 200);
      } else {
        console.error('Delete request failed:', result.error);
        setError(result.error || 'Une erreur est survenue lors de la suppression des documents');
      }
    } catch (error) {
      console.error('Error in deleteAllDocuments:', error);
      setError('Une erreur est survenue lors de la suppression des documents');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer tous les documents
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer tous les documents</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Tous les documents seront supprimés définitivement.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={deleteAllDocuments} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmer la suppression
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 