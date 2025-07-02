import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/elasticsearch';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const mode = searchParams.get('mode'); // 'suggest' mode for autocomplete

    console.log(`Search query: "${query}", page: ${page}, limit: ${limit}`);

    // If no query provided, return empty results
    if (!query.trim()) {
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        limit,
        query: '',
        isMockData: false
      });
    }

    try {
      // Try Elasticsearch first
      console.log('Attempting Elasticsearch search...');
      const elasticResults = await ElasticsearchService.searchDocuments(query, {
        ...(type && { type: [type] }),
        ...(status && { status: [status] })
      }, page, limit);

      if (elasticResults && elasticResults.items && elasticResults.items.length > 0) {
        console.log(`Found ${elasticResults.items.length} results from Elasticsearch`);
        
        // Handle suggest mode (return suggestions format)
        if (mode === 'suggest') {
          const suggestions = elasticResults.items.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            reference: doc.reference
          }));

          return NextResponse.json({
            suggestions,
            query,
            isMockData: false
          });
        }

        return NextResponse.json({
          ...elasticResults,
          query,
          isMockData: false
        });
      }

      console.log('No Elasticsearch results, trying database fallback...');

    } catch (elasticError) {
      console.log('Elasticsearch error, trying database fallback:', elasticError);
    }

    // Fallback to database search
    try {
      const whereClause: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { referenceNumber: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (type) {
        whereClause.documentType = { name: type };
      }

      if (status) {
        whereClause.status = status;
      }

      const documents = await prisma.document.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          documentType: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          lastModifiedDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });

      const totalCount = await prisma.document.count({
        where: whereClause
      });

      const formattedResults = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        reference: doc.referenceNumber,
        type: doc.documentType.name,
        status: doc.status,
        createdAt: doc.creationDate.toISOString(),
        updatedAt: doc.lastModifiedDate.toISOString(),
        author: {
          id: doc.createdBy.id,
          name: `${doc.createdBy.firstName || ''} ${doc.createdBy.lastName || ''}`.trim() || doc.createdBy.email,
          email: doc.createdBy.email
        },
        tags: doc.keywords || [],
        highlights: {
          title: [doc.title],
          content: []
        },
        score: 1.0
      }));

      console.log(`Found ${formattedResults.length} results from database`);

      // Handle suggest mode (return suggestions format)
      if (mode === 'suggest') {
        const suggestions = formattedResults.map(doc => ({
          id: doc.id,
          title: doc.title,
          reference: doc.reference
        }));

        return NextResponse.json({
          suggestions,
          query,
          isMockData: false
        });
      }

      return NextResponse.json({
        items: formattedResults,
        total: totalCount,
        page,
        limit,
        query,
        source: 'database',
        isMockData: false
      });

    } catch (dbError) {
      console.error('Database search error:', dbError);
      
      // Return empty results instead of mock data
      if (mode === 'suggest') {
        return NextResponse.json({
          suggestions: [],
          query,
          isMockData: false,
          message: 'Search is temporarily unavailable. Please try again later.'
        });
      }

      return NextResponse.json({
        items: [],
        total: 0,
        page,
        limit,
        query,
        isMockData: false,
        message: 'Search is temporarily unavailable. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search request failed' },
      { status: 500 }
    );
  }
} 