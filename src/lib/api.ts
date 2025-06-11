import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// API types for Documents
export interface Document {
  id: string;
  title: string;
  reference: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
}

export interface DocumentContent {
  content: string;
  format: string;
  version: string;
}

export interface DocumentVersion {
  id: string;
  version: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  changeDescription: string;
}

export interface DocumentListResponse {
  total: number;
  page: number;
  page_size: number;
  documents?: Document[];
  items?: DocumentMeta[];
  message?: string;
  isMockData?: boolean;
}

export interface DocumentCreateParams {
  title: string;
  document_type_id: string;
  reference_number?: string;
  language?: string;
  metadata?: Record<string, any>;
  content?: string;
  content_format?: 'markdown' | 'html' | 'plain';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentMeta {
  id: string;
  title: string;
  reference: string;
  type: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  category?: string;
}

export interface VersionContent extends DocumentContent {
  versionId: string;
}

export interface SearchFilters {
  searchTerm?: string;
  status?: string[];
  type?: string[];
  tags?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  documentTypeId: string;
  content: string;
  format: 'markdown' | 'html' | 'plain';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  metadata?: {
    variables?: Array<{
      id: string;
      key: string;
      label: string;
      description?: string;
      defaultValue?: string;
      required?: boolean;
    }>;
    [key: string]: any;
  };
}

// Define default search filters
const defaultSearchFilters: SearchFilters = {
  searchTerm: '',
  status: [],
  type: [],
  tags: [],
  dateFrom: null,
  dateTo: null,
};

// API Client class
class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    // Make sure to use the full URL path when in browser environment
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `${baseOrigin}${baseUrl}`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle auth errors (401)
        if (error.response && error.response.status === 401) {
          // Clear stored tokens if they're invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage
    return localStorage.getItem('auth_token');
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        params: config.params
      });
      
      const response: AxiosResponse<T> = await this.client(config);
      
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code outside of 2xx
        return {
          data: (axiosError.response.data as any) || {},
          status: axiosError.response.status,
          message: (axiosError.response.data as any)?.error || axiosError.message
        };
      } else if (axiosError.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request
        throw new Error(axiosError.message || 'Unknown error occurred');
      }
    }
  }

  // Enhanced document search with Elasticsearch
  async searchDocuments(
    query: string,
    filters: SearchFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<PaginatedResponse<DocumentMeta>>> {
    // Build search parameters
    const params: Record<string, any> = {
      q: query,
      page,
      pageSize
    };
    
    // Add filter parameters
    if (filters.status && filters.status.length > 0) {
      params.status = filters.status;  // Pass the entire array 
    }
    
    if (filters.type && filters.type.length > 0) {
      params.type = filters.type;  // Pass the entire array
    }
    
    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags;  // Pass the entire array
    }
    
    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      params.dateTo = filters.dateTo;
    }
    
    return this.request<PaginatedResponse<DocumentMeta>>({
      url: '/search',
      method: 'GET',
      params
    });
  }

  async suggestDocuments(
    query: string,
    limit = 5
  ): Promise<ApiResponse<{ suggestions: { id: string; title: string; reference: string }[] }>> {
    return this.request<{ suggestions: { id: string; title: string; reference: string }[] }>({
      url: '/search',
      method: 'GET',
      params: {
        q: query,
        mode: 'suggest',
        limit
      }
    });
  }

  // Document API methods
  async getDocuments(
    page: number = 1,
    pageSize: number = 10,
    filters: Partial<SearchFilters> = {}
  ): Promise<ApiResponse<DocumentListResponse>> {
    try {
      // Apply default values for missing filter properties
      const mergedFilters: SearchFilters = {
        ...defaultSearchFilters,
        ...filters
      };
      
      // Build URL with query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      if (mergedFilters.searchTerm) {
        params.append('searchTerm', mergedFilters.searchTerm);
      }
      
      // Safely handle potentially undefined arrays
      if (mergedFilters.status && Array.isArray(mergedFilters.status)) {
        mergedFilters.status.forEach(status => {
          params.append('status', status);
        });
      }
      
      if (mergedFilters.type && Array.isArray(mergedFilters.type)) {
        mergedFilters.type.forEach(type => {
          params.append('type', type);
        });
      }
      
      if (mergedFilters.tags && Array.isArray(mergedFilters.tags)) {
        mergedFilters.tags.forEach(tag => {
          params.append('tags', tag);
        });
      }
      
      if (mergedFilters.dateFrom) {
        params.append('dateFrom', mergedFilters.dateFrom);
      }
      
      if (mergedFilters.dateTo) {
        params.append('dateTo', mergedFilters.dateTo);
      }
      
      return this.request<DocumentListResponse>({
        url: '/documents',
        method: 'GET',
        params
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code outside of 2xx
        return {
          data: (axiosError.response.data as any) || {},
          status: axiosError.response.status,
          message: (axiosError.response.data as any)?.error || axiosError.message
        };
      } else if (axiosError.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request
        throw new Error(axiosError.message || 'Unknown error occurred');
      }
    }
  }

  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return this.request<Document>({
      url: `/documents/${id}`,
      method: 'GET'
    });
  }

  async getDocumentContent(id: string): Promise<ApiResponse<DocumentContent>> {
    return this.request<DocumentContent>({
      url: `/documents/${id}/content`,
      method: 'GET'
    });
  }

  async createDocument(params: DocumentCreateParams): Promise<ApiResponse<Document>> {
    return this.request<Document>({
      url: '/documents',
      method: 'POST',
      data: params
    });
  }

  async updateDocument(id: string, params: Partial<DocumentCreateParams>): Promise<ApiResponse<Document>> {
    return this.request<Document>({
      url: `/documents/${id}`,
      method: 'PUT',
      data: params
    });
  }

  async updateDocumentContent(id: string, content: string, format: 'markdown' | 'html' | 'plain' = 'markdown'): Promise<ApiResponse<Document>> {
    return this.request<Document>({
      url: `/documents/${id}/content`,
      method: 'PUT',
      data: { content, format }
    });
  }

  async getDocumentVersions(id: string): Promise<ApiResponse<DocumentVersion[]>> {
    return this.request<DocumentVersion[]>({
      url: `/documents/${id}/versions`,
      method: 'GET'
    });
  }

  async getDocumentVersion(documentId: string, versionId: string): Promise<ApiResponse<DocumentContent>> {
    return this.request<DocumentContent>({
      url: `/documents/${documentId}/versions/${versionId}`,
      method: 'GET'
    });
  }

  async compareVersions(documentId: string, fromVersionId: string, toVersionId: string): Promise<ApiResponse<unknown>> {
    return this.request<unknown>({
      url: `/documents/${documentId}/versions/compare`,
      method: 'GET',
      params: {
        from: fromVersionId,
        to: toVersionId
      }
    });
  }

  async getVersionContent(documentId: string, versionId: string): Promise<ApiResponse<DocumentContent>> {
    return this.request<DocumentContent>({
      url: `/documents/${documentId}/versions/${versionId}/content`,
      method: 'GET'
    });
  }

  // Upload a new document version
  async uploadDocumentVersion(documentId: string, file: File, changeDescription: string): Promise<ApiResponse<DocumentVersion>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changeDescription', changeDescription);
    
    return this.request<DocumentVersion>({
      url: `/documents/${documentId}/versions`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Upload a new document
  async uploadDocument(
    file: File,
    metadata: {
      title: string;
      referenceNumber: string;
      documentTypeId: string;
      description?: string;
      keywords?: string;
      confidentiality?: string;
    }
  ): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata fields
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    return this.request<Document>({
      url: `/documents/upload`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Download a document file
  getDocumentDownloadUrl(documentId: string, format?: string, version?: number): string {
    let url = `${this.baseUrl}/documents/${documentId}/download`;
    const params = new URLSearchParams();
    
    if (format) {
      params.append('format', format);
    }
    
    if (version) {
      params.append('version', version.toString());
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  // Document types API methods
  async getDocumentTypes(): Promise<ApiResponse<{ id: string; name: string; description?: string; documentCount: number }[]>> {
    const response = await this.request<{ 
      data: { id: string; name: string; description?: string; documentCount: number }[];
      success?: boolean;
    }>({
      url: '/document-types',
      method: 'GET'
    });
    
    // Handle the nested data structure in the response
    if (response.status === 200 && response.data && 'data' in response.data) {
      // If the response has a nested 'data' property containing the document types array
      return {
        data: response.data.data,
        status: response.status,
        message: response.message
      };
    }
    
    // Return the original response if it doesn't match the expected structure
    return response as unknown as ApiResponse<{ id: string; name: string; description?: string; documentCount: number }[]>;
  }

  // Document templates API methods
  async getDocumentTemplates(): Promise<ApiResponse<DocumentTemplate[]>> {
    const response = await this.request<{ data: DocumentTemplate[] }>({
      url: '/document-templates',
      method: 'GET'
    });
    
    // Handle the nested data structure in the response
    if (response.status === 200 && response.data && 'data' in response.data) {
      // If the response has a nested 'data' property containing the templates array
      return {
        data: response.data.data,
        status: response.status,
        message: response.message
      };
    }
    
    // Return the original response if it doesn't match the expected structure
    return response as unknown as ApiResponse<DocumentTemplate[]>;
  }

  async getDocumentTemplate(id: string): Promise<ApiResponse<DocumentTemplate>> {
    return this.request<DocumentTemplate>({
      url: `/document-templates/${id}`,
      method: 'GET'
    });
  }

  async createDocumentTemplate(params: {
    name: string;
    description?: string;
    documentTypeId: string;
    content: string;
    format: 'markdown' | 'html' | 'plain';
    metadata?: {
      variables?: Array<{
        id: string;
        key: string;
        label: string;
        description?: string;
        defaultValue?: string;
        required?: boolean;
      }>;
      [key: string]: any;
    };
  }): Promise<ApiResponse<DocumentTemplate>> {
    return this.request<DocumentTemplate>({
      url: '/document-templates',
      method: 'POST',
      data: params
    });
  }

  async updateDocumentTemplate(
    id: string,
    params: Partial<{
      name: string;
      description: string;
      documentTypeId: string;
      content: string;
      format: 'markdown' | 'html' | 'plain';
      metadata?: {
        variables?: Array<{
          id: string;
          key: string;
          label: string;
          description?: string;
          defaultValue?: string;
          required?: boolean;
        }>;
        [key: string]: any;
      };
    }>
  ): Promise<ApiResponse<DocumentTemplate>> {
    return this.request<DocumentTemplate>({
      url: `/document-templates/${id}`,
      method: 'PUT',
      data: params
    });
  }

  async deleteDocumentTemplate(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>({
      url: `/document-templates/${id}`,
      method: 'DELETE'
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export default for testing/mocking purposes
export default ApiClient; 