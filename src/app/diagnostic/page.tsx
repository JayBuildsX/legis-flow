'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';

interface ElasticsearchStatus {
  status: 'pending' | 'connected' | 'error';
  message: string;
  docCount?: number;
}

export default function DiagnosticPage() {
  const [searchTerm, setSearchTerm] = useState('test');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [esStatus, setEsStatus] = useState<ElasticsearchStatus>({ 
    status: 'pending', 
    message: 'Not tested yet' 
  });
  const [esDirectResults, setEsDirectResults] = useState<any>(null);
  
  const runSearch = async () => {
    try {
      setLoading(true);
      console.log(`Testing search with term: "${searchTerm}"`);
      
      const response = await apiClient.searchDocuments(searchTerm);
      
      setSearchResults({
        status: response.status,
        total: response.data.total,
        items: response.data.items
      });
      
      console.log('Search results:', response);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ error: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };
  
  const testElasticsearchConnection = async () => {
    try {
      setEsStatus({ status: 'pending', message: 'Testing connection...' });
      
      // First, make sure Elasticsearch is properly seeded
      const seedResponse = await fetch('/api/v1/seed/elasticsearch');
      if (!seedResponse.ok) {
        throw new Error('Failed to seed Elasticsearch');
      }
      
      const seedData = await seedResponse.json();
      console.log('Seed response:', seedData);
      
      // Make a direct call to the ElasticSearch test endpoint
      const esResponse = await fetch('/api/v1/search/test');
      
      if (!esResponse.ok) {
        throw new Error('Elasticsearch test endpoint returned an error');
      }
      
      const esData = await esResponse.json();
      
      if (esData.connected) {
        setEsStatus({ 
          status: 'connected', 
          message: 'Successfully connected to Elasticsearch',
          docCount: esData.documentCount || 0
        });
      } else {
        setEsStatus({ 
          status: 'error', 
          message: esData.message || 'Unknown connection error' 
        });
      }
    } catch (error) {
      console.error('ES test error:', error);
      setEsStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error testing Elasticsearch' 
      });
    }
  };
  
  const searchElasticsearchDirectly = async () => {
    try {
      setLoading(true);
      
      // Make a direct call to search using a raw Elasticsearch query
      const response = await fetch('/api/v1/search/raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            multi_match: {
              query: searchTerm,
              fields: ["title^3", "reference^2", "content", "tags"]
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Search API returned ${response.status}`);
      }
      
      const data = await response.json();
      setEsDirectResults(data);
    } catch (error) {
      console.error('Direct ES search error:', error);
      setEsDirectResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Search Diagnostic</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">Elasticsearch Status</h2>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full mr-2" 
                style={{ 
                  backgroundColor: 
                    esStatus.status === 'connected' ? 'green' : 
                    esStatus.status === 'error' ? 'red' : 'gray' 
                }}></span>
              <span>{esStatus.message}</span>
            </div>
            
            {esStatus.docCount !== undefined && (
              <div>Document count: {esStatus.docCount}</div>
            )}
            
            <Button 
              onClick={testElasticsearchConnection} 
              disabled={esStatus.status === 'pending' && esStatus.message !== 'Not tested yet'}
            >
              Test Elasticsearch Connection
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/api/v1/seed/elasticsearch'}
            >
              Seed Test Documents
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">API Search Test</h2>
          
          <div className="flex items-center gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term"
            />
            <Button onClick={runSearch} disabled={loading}>Search</Button>
          </div>
          
          {loading && <p>Loading...</p>}
          
          {searchResults && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Results:</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto max-h-80 text-sm">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="border rounded-lg p-6 space-y-4 md:col-span-2">
          <h2 className="text-xl font-bold">Direct Elasticsearch Query</h2>
          
          <div className="flex items-center gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term"
            />
            <Button onClick={searchElasticsearchDirectly} disabled={loading}>
              Query Elasticsearch Directly
            </Button>
          </div>
          
          {esDirectResults && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Raw Results:</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto max-h-80 text-sm">
                {JSON.stringify(esDirectResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Troubleshooting Steps</h2>
        
        <ol className="list-decimal ml-5 space-y-2">
          <li>Check if Elasticsearch is properly connected</li>
          <li>Make sure documents are indexed in Elasticsearch</li>
          <li>Try searching with different terms</li>
          <li>Check the search API logs for any errors</li>
          <li>Verify the search query parameters</li>
        </ol>
      </div>
    </div>
  );
} 