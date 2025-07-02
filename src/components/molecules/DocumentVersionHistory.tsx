'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, DocumentVersion } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate } from '@/lib/utils';

interface DocumentVersionHistoryProps {
  documentId: string;
  onSelectVersion?: (versionId: string) => void;
  onCompareVersions?: (versionId1: string, versionId2: string) => void;
}

export default function DocumentVersionHistory({
  documentId,
  onSelectVersion,
  onCompareVersions
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchVersions() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getDocumentVersions(documentId);
        if (response.status === 200) {
          setVersions(response.data);
        } else {
          setError(response.message || 'Failed to load document versions');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching document versions');
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, [documentId]);

  const handleVersionSelect = (versionId: string) => {
    if (onSelectVersion) {
      onSelectVersion(versionId);
    }
  };

  const handleVersionCheckboxChange = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else {
        const newSelection = [...prev, versionId];
        if (newSelection.length > 2) {
          return [newSelection[1], newSelection[2]]; // Keep only the last two
        }
        return newSelection;
      }
    });
  };

  const handleCompareClick = () => {
    if (selectedVersions.length === 2 && onCompareVersions) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Historique des versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Historique des versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Historique des versions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune version disponible pour ce document.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historique des versions</CardTitle>
        {selectedVersions.length === 2 && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCompareClick}
          >
            Comparer les versions
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {versions.map((version, index) => (
            <AccordionItem key={version.id} value={version.id}>
              <AccordionTrigger className="group">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => handleVersionCheckboxChange(version.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="font-medium">Version {version.version}</span>
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {index === 0 ? 'Actuelle' : 'Archive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(version.createdAt)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Par: {version.author.name}</span>
                  </div>
                  
                  {version.changeDescription && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm ml-2">{version.changeDescription}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      Visualiser cette version
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
} 