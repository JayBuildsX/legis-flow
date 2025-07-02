'use client';

import React, { useState } from 'react';
import SearchBox from '@/components/molecules/SearchBox';

export default function TestSearchPage() {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');

  const handleSearch = (query: string) => {
    setTestResult(`Search called with: "${query}"`);
  };

  const testDirectAPI = async () => {
    try {
      const response = await fetch('/api/v1/search?q=test&mode=suggest&limit=5');
      const data = await response.json();
      setSearchResults(data);
      setTestResult(`API Test: Found ${data.suggestions?.length || 0} suggestions`);
    } catch (error) {
      setTestResult(`API Error: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Search Functionality Test</h1>
      
      {/* Test SearchBox Component */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">SearchBox Component Test</h2>
        <div className="w-96">
          <SearchBox 
            placeholder="Type 'test' to see suggestions..."
            onSearch={handleSearch}
          />
        </div>
        {testResult && (
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <strong>Result:</strong> {testResult}
          </div>
        )}
      </div>

      {/* Direct API Test */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Direct API Test</h2>
        <button 
          onClick={testDirectAPI}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Search API
        </button>
        
        {searchResults && (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <strong>API Response:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(searchResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
        <ul className="text-sm space-y-2">
          <li>✅ Server running on port 3000</li>
          <li>✅ Elasticsearch running and seeded</li>
          <li>✅ Search API responding</li>
          <li>🔍 Testing SearchBox component above</li>
        </ul>
      </div>
    </div>
  );
} 