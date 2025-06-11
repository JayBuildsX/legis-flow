import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { ElasticsearchService } from '@/lib/elasticsearch';

const prisma = new PrismaClient();

// Mock search results for when Elasticsearch has no results
const getMockSearchResults = (query: string) => {
  // For demo purposes, we'll generate mock results that contain the search query
  const mockData = [
    {
      id: `mock-${Date.now()}-1`,
      title: `Example document matching "${query}"`,
      reference: `MOCK-${Date.now().toString().slice(-6)}-1`,
      type: "Mock Document",
      status: "DRAFT",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: "user-001",
        name: "System (Mock)",
        email: "system@example.com"
      },
      tags: ["mock", "test", query.toLowerCase()],
      highlights: {
        title: [`Example document matching "<em>${query}</em>"`],
        content: [`This is a mock search result for the query "<em>${query}</em>". This is shown because no actual Elasticsearch results were found.`]
      },
      score: 1.0
    },
    {
      id: `mock-${Date.now()}-2`,
      title: `Another sample result for "${query}"`,
      reference: `MOCK-${Date.now().toString().slice(-6)}-2`,
      type: "Mock Report",
      status: "PUBLISHED",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        id: "user-002",
        name: "Demo User",
        email: "demo@example.com"
      },
      tags: ["example", "sample", query.toLowerCase()],
      highlights: {
        title: [`Another sample result for "<em>${query}</em>"`],
        content: [`This document contains references to "<em>${query}</em>" and is provided as an example of search results.`, 
                  `You might want to refine your search or make sure documents are properly indexed in Elasticsearch.`]
      },
      score: 0.85
    }
  ];
  
  return mockData;
};

/**
 * Search documents API endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (commented out for easier testing)
    /*
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    */

    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const mode = url.searchParams.get('mode') || 'search';
    
    console.log('Search API called with:', {
      query, 
      mode,
      params: Object.fromEntries(url.searchParams.entries())
    });
    
    // Suggestion mode: returns autocomplete suggestions for search box
    if (mode === 'suggest') {
      const limit = parseInt(url.searchParams.get('limit') || '5');
      try {
        const suggestions = await ElasticsearchService.suggestDocuments(query, limit);
        return NextResponse.json({ suggestions });
      } catch (error) {
        console.error('Suggestion search failed, falling back to database search:', error);
        
        // Fallback to database search for suggestions
        const documents = await prisma.document.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { referenceNumber: { contains: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            referenceNumber: true
          },
          take: limit,
          orderBy: { lastModifiedDate: 'desc' }
        });
        
        const suggestions = documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          reference: doc.referenceNumber
        }));
        
        return NextResponse.json({ suggestions });
      }
    }
    
    // Full search mode
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.getAll('status');
    const type = url.searchParams.getAll('type');
    const tags = url.searchParams.getAll('tags');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    
    try {
      // Try Elasticsearch for full-text search
      const results = await ElasticsearchService.searchDocuments(
        query,
        {
          status: status as any,
          type,
          tags,
          dateFrom,
          dateTo
        },
        page,
        pageSize
      );
      
      console.log('Elasticsearch search results:', {
        query,
        totalResults: results.total,
        resultsCount: results.items.length,
        // Log a sample of the items if available
        sampleItem: results.items.length > 0 ? results.items[0] : null
      });
      
      // If no results and we have a query, use mock data as a fallback
      if (results.items.length === 0 && query) {
        console.log('No Elasticsearch results found, using mock data fallback');
        
        // Get mock results containing the search term
        const mockResults = getMockSearchResults(query);
        
        return NextResponse.json({
          items: mockResults,
          total: mockResults.length,
          page,
          limit: pageSize,
          totalPages: 1,
          isMockData: true
        });
      }
      
      return NextResponse.json(results);
    } catch (error) {
      console.error('Search failed, falling back to database search:', error);
      console.log('Fallback search params:', {
        query,
        status,
        type, 
        tags,
        dateFrom,
        dateTo
      });
      
      // If Elasticsearch fails but we have a query, return mock results
      if (query) {
        console.log('Elasticsearch error, using mock data fallback');
        const mockResults = getMockSearchResults(query);
        
        return NextResponse.json({
          items: mockResults,
          total: mockResults.length,
          page,
          limit: pageSize,
          totalPages: 1,
          isMockData: true,
          elasticsearchError: error instanceof Error ? error.message : 'Unknown search error'
        });
      }
      
      // Otherwise try database search
      // Build database query filter
      const where: any = {};
      
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { referenceNumber: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query } }
        ];
      }
      
      if (status.length > 0) {
        where.status = { in: status };
      }
      
      if (type.length > 0) {
        where.documentType = {
          name: { in: type }
        };
      }
      
      if (tags.length > 0) {
        where.keywords = { hasSome: tags };
      }
      
      if (dateFrom) {
        where.updatedAt = {
          ...(where.updatedAt || {}),
          gte: new Date(dateFrom)
        };
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setDate(toDate.getDate() + 1); // Include the end date
        where.updatedAt = {
          ...(where.updatedAt || {}),
          lte: toDate
        };
      }
      
      // Query database
      try {
        const [documents, total] = await Promise.all([
          prisma.document.findMany({
            where,
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
            skip: (page - 1) * pageSize,
            take: pageSize
          }),
          prisma.document.count({ where })
        ]);
        
        // Format documents and add simple highlights
        const documentsWithHighlights = documents.map(doc => {
          // Create simple highlights if query exists
          const highlights: any = {};
          
          if (query) {
            // Create a regex to find the query in text (case insensitive)
            const regex = new RegExp(`(.{0,40}${query}.{0,40})`, 'gi');
            
            // Check title for highlights
            if (doc.title.toLowerCase().includes(query.toLowerCase())) {
              highlights.title = [`<em>${doc.title}</em>`];
            }
            
            // Check description for highlights if it exists
            if (doc.description && doc.description.toLowerCase().includes(query.toLowerCase())) {
              let match;
              const matches = [];
              while ((match = regex.exec(doc.description)) !== null && matches.length < 3) {
                matches.push(`...${match[1].replace(new RegExp(query, 'gi'), `<em>${query}</em>`)}...`);
              }
              if (matches.length > 0) {
                highlights.content = matches;
              }
            }
          }
          
          return {
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
            tags: doc.keywords,
            highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
            score: 1.0 // Default score for database search
          };
        });
        
        return NextResponse.json({
          items: documentsWithHighlights,
          total,
          page,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
          fromDatabase: true
        });
      } catch (dbError) {
        console.error('Database search failed as well:', dbError);
        // Last resort - return mock results
        const mockResults = getMockSearchResults(query || 'example');
        
        return NextResponse.json({
          items: mockResults,
          total: mockResults.length,
          page,
          limit: pageSize,
          totalPages: 1,
          isMockData: true,
          searchErrors: {
            elasticsearch: error instanceof Error ? error.message : 'Unknown error',
            database: dbError instanceof Error ? dbError.message : 'Unknown error'
          }
        });
      }
    }
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Error processing search request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 