import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@elastic/elasticsearch';

export async function POST(request: NextRequest) {
  try {
    // Create Elasticsearch client
    const client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      requestTimeout: 5000,
      maxRetries: 3
    });
    
    // Get query from request body
    const body = await request.json();
    
    if (!body || !body.query) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected Elasticsearch query object.' },
        { status: 400 }
      );
    }
    
    console.log('Raw Elasticsearch query:', body);
    
    try {
      // Check if Elasticsearch is available
      const pingResult = await client.ping();
      
      if (!pingResult) {
        return NextResponse.json(
          { error: 'Elasticsearch is not available' },
          { status: 503 }
        );
      }
      
      // Execute the search against the documents index
      const result = await client.search({
        index: 'documents',
        body: body,
        track_total_hits: true
      });
      
      return NextResponse.json({
        took: result.took,
        timed_out: result.timed_out,
        total: result.hits.total,
        max_score: result.hits.max_score,
        hits: result.hits.hits.map(hit => ({
          id: hit._id,
          score: hit._score,
          source: hit._source,
          highlight: hit.highlight
        }))
      });
    } catch (error) {
      console.error('Error executing Elasticsearch query:', error);
      return NextResponse.json(
        { error: 'Failed to execute Elasticsearch query', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Raw search error:', error);
    return NextResponse.json(
      { error: 'Error processing request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 