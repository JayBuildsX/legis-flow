import { Client } from '@elastic/elasticsearch';
import { DocumentMeta } from './api';

// Elasticsearch index names
const DOCUMENT_INDEX = 'documents';

// Initialize Elasticsearch client with configurable settings
const createClient = () => {
  try {
    return new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      // Add reasonable timeout to avoid long waits when Elasticsearch is down
      requestTimeout: 5000,
      maxRetries: 3
    });
  } catch (error) {
    console.error('Failed to initialize Elasticsearch client:', error);
    return null;
  }
};

// Create the client, but don't crash if it fails
const client = createClient();

// Check if Elasticsearch is available
const checkElasticsearchAvailability = async () => {
  if (!client) return false;
  
  try {
    const result = await client.ping();
    return result === true;
  } catch (error) {
    console.warn('Elasticsearch not available:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Check on startup
checkElasticsearchAvailability().then(available => {
  if (available) {
    console.log('Successfully connected to Elasticsearch');
  } else {
    console.warn('Elasticsearch is not available - search features will use fallback mock data');
  }
});

/**
 * Elasticsearch service for document search
 */
export class ElasticsearchService {
  
  /**
   * Initialize Elasticsearch indices if they don't exist
   */
  static async initializeIndices() {
    if (!client) {
      console.warn('Elasticsearch client not available, skipping index initialization');
      return false;
    }
    
    try {
      // Check if document index exists
      const exists = await client.indices.exists({ index: DOCUMENT_INDEX });
      
      if (!exists) {
        // Create document index with mappings
        await client.indices.create({
          index: DOCUMENT_INDEX,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { 
                  type: 'text',
                  analyzer: 'standard',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256
                    }
                  }
                },
                reference: { type: 'keyword' },
                content: { 
                  type: 'text',
                  analyzer: 'standard' 
                },
                type: { type: 'keyword' },
                status: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
                author: {
                  properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    email: { type: 'keyword' }
                  }
                },
                category: { type: 'keyword' },
                tags: { type: 'keyword' },
                metadata: { type: 'object', enabled: true }
              }
            },
            settings: {
              analysis: {
                analyzer: {
                  standard: {
                    type: 'standard',
                    stopwords: '_french_'
                  }
                }
              }
            }
          }
        });
        
        console.log('Created Elasticsearch document index');
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Elasticsearch indices:', error);
      return false;
    }
  }
  
  /**
   * Index a document in Elasticsearch
   */
  static async indexDocument(document: any) {
    if (!client) throw new Error('Elasticsearch client not available');
    
    return client.index({
      index: DOCUMENT_INDEX,
      id: document.id,
      document: {
        ...document,
        // Ensure dates are in ISO format
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      refresh: true // Make the document immediately available for search
    });
  }
  
  /**
   * Update a document in Elasticsearch
   */
  static async updateDocument(id: string, document: Partial<any>) {
    if (!client) throw new Error('Elasticsearch client not available');
    
    return client.update({
      index: DOCUMENT_INDEX,
      id,
      doc: document,
      refresh: true
    });
  }
  
  /**
   * Delete a document from Elasticsearch
   */
  static async deleteDocument(id: string) {
    if (!client) throw new Error('Elasticsearch client not available');
    
    return client.delete({
      index: DOCUMENT_INDEX,
      id,
      refresh: true
    });
  }
  
  /**
   * Index document content
   */
  static async indexDocumentContent(documentId: string, content: string) {
    if (!client) throw new Error('Elasticsearch client not available');
    
    return client.update({
      index: DOCUMENT_INDEX,
      id: documentId,
      doc: {
        content
      },
      refresh: true
    });
  }
  
  /**
   * Search for documents
   */
  static async searchDocuments(
    query: string,
    filters: {
      status?: string[],
      type?: string[],
      tags?: string[],
      dateFrom?: string | null,
      dateTo?: string | null
    } = {},
    page: number = 1,
    pageSize: number = 10
  ) {
    if (!client) {
      console.error('Elasticsearch client not available, returning empty result');
      return {
        items: [],
        total: 0,
        page,
        limit: pageSize,
        totalPages: 0
      };
    }
    
    try {
      console.log('Elasticsearch search query:', { query, filters, page, pageSize });
      
      // Build query
      const should = [];
      const must = [];
      const filter = [];
      
      // Text query
      if (query) {
        should.push(
          { match: { title: { query, boost: 3 } } },
          { match: { reference: { query, boost: 2 } } },
          { match: { content: { query, boost: 1 } } },
          { match: { 'author.name': { query, boost: 1 } } },
          { match: { tags: { query, boost: 1 } } }
        );
        
        // Also search for exact matches with higher boost
        should.push(
          { term: { 'title.keyword': { value: query, boost: 5 } } },
          { term: { reference: { value: query, boost: 4 } } }
        );
      }
      
      // Status filter
      if (filters.status && filters.status.length > 0) {
        filter.push({
          terms: { status: filters.status }
        });
      }
      
      // Type filter
      if (filters.type && filters.type.length > 0) {
        filter.push({
          terms: { type: filters.type }
        });
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        filter.push({
          terms: { tags: filters.tags }
        });
      }
      
      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const range: any = { updatedAt: {} };
        
        if (filters.dateFrom) {
          range.updatedAt.gte = filters.dateFrom;
        }
        
        if (filters.dateTo) {
          // Add a day to include the end date
          const endDate = new Date(filters.dateTo);
          endDate.setDate(endDate.getDate() + 1);
          range.updatedAt.lte = endDate.toISOString();
        }
        
        filter.push({ range });
      }
      
      // Calculate pagination
      const from = (page - 1) * pageSize;
      
      // Build the query object
      const esQuery: any = {
        bool: {
          filter
        }
      };
      
      // Add should clause if we have a text query
      if (should.length > 0) {
        esQuery.bool.should = should;
        esQuery.bool.minimum_should_match = 1;
      }
      
      // Execute search
      const result = await client.search({
        index: DOCUMENT_INDEX,
        body: {
          query: esQuery,
          from,
          size: pageSize,
          sort: [
            { _score: { order: 'desc' } },
            { updatedAt: { order: 'desc' } }
          ],
          highlight: {
            fields: {
              title: {},
              content: { fragment_size: 150, number_of_fragments: 3 }
            }
          }
        }
      });
      
      console.log('Elasticsearch search response:', {
        totalHits: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
        took: result.took,
        hitCount: result.hits.hits.length,
        maxScore: result.hits.max_score,
        // Log a sample hit if available
        sampleHit: result.hits.hits.length > 0 ? {
          id: result.hits.hits[0]._id,
          score: result.hits.hits[0]._score,
          source: result.hits.hits[0]._source,
          highlight: result.hits.hits[0].highlight
        } : null
      });
      
      // Format results
      const hits = result.hits.hits.map(hit => ({
        ...(hit._source || {}),
        score: hit._score,
        highlights: hit.highlight || {}
      }));
      
      return {
        items: hits,
        total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
        page,
        limit: pageSize,
        totalPages: Math.ceil((typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0) / pageSize)
      };
    } catch (error) {
      console.error('Failed to search documents:', error);
      return {
        items: [],
        total: 0,
        page,
        limit: pageSize,
        totalPages: 0
      };
    }
  }
  
  /**
   * Get document suggestions based on prefix
   */
  static async suggestDocuments(prefix: string, limit: number = 5) {
    if (!client) throw new Error('Elasticsearch client not available');
    
    const result = await client.search({
      index: DOCUMENT_INDEX,
      body: {
        query: {
          bool: {
            should: [
              { prefix: { 'title.keyword': { value: prefix, boost: 3 } } },
              { prefix: { reference: { value: prefix, boost: 2 } } },
              { match_phrase_prefix: { title: { query: prefix, boost: 1 } } }
            ]
          }
        },
        size: limit
      }
    });
    
    return result.hits.hits.map(hit => {
      const source = hit._source as any;
      return {
        id: source?.id || '',
        title: source?.title || '',
        reference: source?.reference || ''
      };
    });
  }

  /**
   * Seed test documents for development/testing
   * This method should only be used in development to populate Elasticsearch with test data
   */
  static async seedTestDocuments() {
    if (!client) {
      console.error('Elasticsearch client not available, cannot seed test documents');
      return false;
    }
    
    try {
      console.log('Seeding test documents into Elasticsearch...');
      
      // Sample test documents that match our mock data
      const testDocuments = [
        {
          id: "doc-001",
          title: "Draft Legislation on Environmental Protection",
          reference: "ENV-2023-001",
          status: "DRAFT",
          type: "Legislation Draft",
          content: "This document contains draft legislation focusing on environmental protection measures including emissions reductions and sustainability initiatives.",
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "user-001",
            name: "Jean Dupont",
            email: "jean.dupont@example.com"
          },
          tags: ["environment", "legislation", "climate"]
        },
        {
          id: "doc-002",
          title: "Policy Brief: Digital Transformation",
          reference: "DIG-2023-045",
          status: "PUBLISHED",
          type: "Policy Brief",
          content: "This policy brief examines digital transformation strategies and their implementation across government services.",
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "user-002",
            name: "Marie Leclerc",
            email: "marie.leclerc@example.com"
          },
          tags: ["digital", "technology", "transformation"]
        },
        {
          id: "doc-003",
          title: "Amendment to Taxation Law",
          reference: "TAX-2023-112",
          status: "REVIEW",
          type: "Amendment",
          content: "Proposed amendments to the taxation law regarding corporate tax rates and exemptions for small businesses.",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "user-003",
            name: "Pierre Martin",
            email: "pierre.martin@example.com"
          },
          tags: ["taxation", "finance", "amendment"]
        },
        {
          id: "doc-004",
          title: "Legal Opinion on Public Health Measures",
          reference: "HEALTH-2023-078",
          status: "APPROVED",
          type: "Legal Opinion",
          content: "Expert legal analysis of public health emergency measures and their constitutional implications.",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "user-004",
            name: "Sophie Bernard",
            email: "sophie.bernard@example.com"
          },
          tags: ["health", "legal", "public"]
        },
        {
          id: "doc-005",
          title: "Annual Report on Economic Development",
          reference: "ECON-2023-122",
          status: "PUBLISHED",
          type: "Report",
          content: "Comprehensive analysis of economic development indicators and growth projections for the coming fiscal year.",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: "user-005",
            name: "Michel Robert",
            email: "michel.robert@example.com"
          },
          tags: ["economy", "development", "annual"]
        },
        {
          id: "doc-006",
          title: "Test Document with Special Keywords",
          reference: "TEST-2023-001",
          status: "DRAFT",
          type: "Test Document",
          content: "This is a test document containing special keywords like ew, test, example, and other common search terms.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: "user-001",
            name: "Jean Dupont",
            email: "jean.dupont@example.com"
          },
          tags: ["test", "example", "keywords"]
        }
      ];
      
      // Index each test document
      for (const doc of testDocuments) {
        await this.indexDocument(doc);
        console.log(`Indexed test document: ${doc.id} - ${doc.title}`);
      }
      
      console.log('Successfully seeded test documents');
      return true;
    } catch (error) {
      console.error('Failed to seed test documents:', error);
      return false;
    }
  }
}

export default ElasticsearchService; 