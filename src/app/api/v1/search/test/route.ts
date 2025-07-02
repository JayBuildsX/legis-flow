import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@elastic/elasticsearch';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Elasticsearch connection');
    
    // Create Elasticsearch client
    const client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      requestTimeout: 5000,
      maxRetries: 3
    });
    
    try {
      // Check if Elasticsearch is available
      const pingResult = await client.ping();
      
      if (!pingResult) {
        return NextResponse.json({
          connected: false,
          message: 'Elasticsearch is not available'
        });
      }
      
      // Get cluster info
      const clusterInfo = await client.info();
      
      // Get index stats
      const indexExists = await client.indices.exists({
        index: 'documents'
      });
      
      let documentCount = 0;
      
      if (indexExists) {
        const indexStats = await client.indices.stats({
          index: 'documents'
        });
        
        documentCount = indexStats._all?.total?.docs?.count || 0;
      }
      
      return NextResponse.json({
        connected: true,
        message: 'Successfully connected to Elasticsearch',
        clusterName: clusterInfo.cluster_name,
        version: clusterInfo.version.number,
        documentsIndexExists: indexExists,
        documentCount: documentCount
      });
    } catch (error) {
      console.error('Elasticsearch test error:', error);
      return NextResponse.json({
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error connecting to Elasticsearch'
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error testing Elasticsearch connection', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 