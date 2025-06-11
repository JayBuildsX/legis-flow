'use client';

import { useState, useEffect } from 'react';
import * as diff from 'diff';
import { DocumentContent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LucideLoader2, MoveLeft, MoveRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentVersionComparisonProps {
  currentVersion: DocumentContent;
  selectedVersion: DocumentContent | null;
  versions: Array<{ id: string; version: string; createdAt: string }>;
  onSelectVersion: (versionId: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function DocumentVersionComparison({
  currentVersion,
  selectedVersion,
  versions,
  onSelectVersion,
  onClose,
  isLoading
}: DocumentVersionComparisonProps) {
  const [displayMode, setDisplayMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [diffResult, setDiffResult] = useState<diff.Change[]>([]);

  // Compute the diff when versions change
  useEffect(() => {
    if (selectedVersion && currentVersion) {
      // Calculate the differences between the two versions
      if (displayMode === 'inline') {
        const changes = diff.diffWords(selectedVersion.content, currentVersion.content);
        setDiffResult(changes);
      } else {
        // For side-by-side, we'll use the raw content directly in the render
        setDiffResult([]);
      }
    }
  }, [selectedVersion, currentVersion, displayMode]);

  // If no version is selected, show a message
  if (!selectedVersion) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Sélectionnez une version à comparer avec la version actuelle
        </p>
        {versions.length > 0 && (
          <Select onValueChange={onSelectVersion}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Sélectionner une version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  Version {version.version} ({new Date(version.createdAt).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LucideLoader2 size={24} className="animate-spin text-primary mr-2" />
        <span>Chargement de la comparaison...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">
            Comparaison des versions
          </h3>
          <div className="flex bg-muted rounded-md p-1">
            <Button 
              variant={displayMode === 'side-by-side' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setDisplayMode('side-by-side')}
              className="text-xs"
            >
              Côte à côte
            </Button>
            <Button 
              variant={displayMode === 'inline' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setDisplayMode('inline')}
              className="text-xs"
            >
              En ligne
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted px-4 py-2 flex justify-between items-center border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {displayMode === 'side-by-side' ? (
                <>
                  <span className="text-amber-600">Version {selectedVersion.version}</span>
                  <MoveRight className="inline mx-2 h-4 w-4" />
                  <span className="text-emerald-600">Version {currentVersion.version} (actuelle)</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">Version {selectedVersion.version} → Version {currentVersion.version}</span>
                </>
              )}
            </span>
          </div>
          <div>
            {versions.length > 0 && (
              <Select onValueChange={onSelectVersion} defaultValue={versions.find(v => v.version === selectedVersion.version)?.id}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Changer de version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id} className="text-xs">
                      Version {version.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {displayMode === 'side-by-side' ? (
          <div className="grid grid-cols-2 gap-0 divide-x">
            <div className="bg-amber-50 p-4 overflow-auto max-h-[600px]">
              <div className="font-medium text-sm mb-2 text-amber-800">Version {selectedVersion.version}</div>
              <pre className="text-sm whitespace-pre-wrap font-mono">{selectedVersion.content}</pre>
            </div>
            <div className="bg-emerald-50 p-4 overflow-auto max-h-[600px]">
              <div className="font-medium text-sm mb-2 text-emerald-800">Version {currentVersion.version} (actuelle)</div>
              <pre className="text-sm whitespace-pre-wrap font-mono">{currentVersion.content}</pre>
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-auto max-h-[600px] bg-white">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {diffResult.map((part, index) => {
                // Green for additions, red for deletions, gray for unchanged
                const className = part.added 
                  ? "bg-emerald-100 text-emerald-800" 
                  : part.removed 
                    ? "bg-red-100 text-red-800" 
                    : "text-gray-800";
                
                return (
                  <span key={index} className={className}>
                    {part.value}
                  </span>
                );
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 