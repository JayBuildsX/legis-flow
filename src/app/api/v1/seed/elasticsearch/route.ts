import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/elasticsearch';

export async function GET(request: NextRequest) {
  try {
    console.log('Seeding Elasticsearch with test documents...');
    
    const result = await ElasticsearchService.seedTestDocuments();
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Successfully seeded Elasticsearch with test documents',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to seed Elasticsearch with test documents',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error seeding Elasticsearch:', error);
    return NextResponse.json({
      success: false,
      message: 'Error seeding Elasticsearch',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 