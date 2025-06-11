'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DocumentDiffViewerProps {
  documentId: string;
  versionId1: string;
  versionId2: string;
  onClose?: () => void;
}

export default function DocumentDiffViewer({
  documentId,
  versionId1,
  versionId2,
  onClose
}: DocumentDiffViewerProps) {
  const [content1, setContent1] = useState<string>('');
  const [content2, setContent2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersionContents() {
      setLoading(true);
      setError(null);
      
      try {
        const [response1, response2] = await Promise.all([
          apiClient.getVersionContent(documentId, versionId1),
          apiClient.getVersionContent(documentId, versionId2)
        ]);
        
        if (response1.status === 200 && response2.status === 200) {
          setContent1(response1.data.content);
          setContent2(response2.data.content);
        } else {
          setError('Failed to load one or both version contents');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching version contents');
      } finally {
        setLoading(false);
      }
    }

    fetchVersionContents();
  }, [documentId, versionId1, versionId2]);

  // Simple line-by-line diff function
  const generateDiff = () => {
    if (!content1 || !content2) return [];
    
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    // This is a very simple diff implementation
    // For a real application, consider using a library like 'diff' or 'jsdiff'
    const diff = [];
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = i < lines1.length ? lines1[i] : '';
      const line2 = i < lines2.length ? lines2[i] : '';
      
      if (line1 === line2) {
        diff.push({ 
          type: 'unchanged', 
          line: line1 
        });
      } else {
        if (line1) {
          diff.push({ 
            type: 'removed', 
            line: line1 
          });
        }
        if (line2) {
          diff.push({ 
            type: 'added', 
            line: line2 
          });
        }
      }
    }
    
    return diff;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Comparaison des versions</span>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </CardTitle>
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
          <CardTitle className="flex justify-between items-center">
            <span>Comparaison des versions</span>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const diff = generateDiff();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Comparaison des versions {versionId1.split('-')[0]} et {versionId2.split('-')[0]}</span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <pre className="p-4 rounded bg-secondary/20 text-sm">
            {diff.map((item, index) => (
              <div
                key={index}
                className={`${
                  item.type === 'added' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : item.type === 'removed' 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : ''
                }`}
              >
                <span className="mr-2 text-muted-foreground">
                  {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                </span>
                {item.line}
              </div>
            ))}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
} 