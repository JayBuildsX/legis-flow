import fs from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';

// Define the storage location
const STORAGE_BASE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'storage');
const DOCUMENTS_DIR = path.join(STORAGE_BASE_DIR, 'documents');

export type FileMetadata = {
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  storagePath: string;
  format: string;
  checksum?: string;
};

export enum FileFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  XML = 'xml',
  HTML = 'html',
  MARKDOWN = 'md',
  TEXT = 'txt',
  JSON = 'json',
}

/**
 * FileStorageService handles the storage and retrieval of document files
 */
export class FileStorageService {
  /**
   * Initialize storage directories
   */
  static async initialize() {
    try {
      // Create base storage directory if it doesn't exist
      if (!fs.existsSync(STORAGE_BASE_DIR)) {
        await mkdir(STORAGE_BASE_DIR, { recursive: true });
      }
      
      // Create documents directory if it doesn't exist
      if (!fs.existsSync(DOCUMENTS_DIR)) {
        await mkdir(DOCUMENTS_DIR, { recursive: true });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize file storage:', error);
      return false;
    }
  }

  /**
   * Get the directory for a specific document
   */
  static getDocumentDirectory(documentId: string): string {
    return path.join(DOCUMENTS_DIR, documentId);
  }

  /**
   * Create a directory for a document
   */
  static async createDocumentDirectory(documentId: string): Promise<string> {
    const documentDir = this.getDocumentDirectory(documentId);
    
    if (!fs.existsSync(documentDir)) {
      await mkdir(documentDir, { recursive: true });
    }
    
    return documentDir;
  }

  /**
   * Store a file for a document
   */
  static async storeFile(
    documentId: string, 
    versionId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    format: string
  ): Promise<FileMetadata> {
    // Create document directory if it doesn't exist
    const documentDir = await this.createDocumentDirectory(documentId);
    
    // Create version directory
    const versionDir = path.join(documentDir, versionId);
    if (!fs.existsSync(versionDir)) {
      await mkdir(versionDir, { recursive: true });
    }
    
    // Get file extension
    const extension = path.extname(originalName).toLowerCase() || `.${format}`;
    
    // Generate a unique filename
    const filename = `${randomUUID()}${extension}`;
    const filePath = path.join(versionDir, filename);
    
    // Write the file
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // Get file stats
    const stats = await fs.promises.stat(filePath);
    
    // Return metadata
    return {
      originalName,
      size: stats.size,
      mimeType,
      extension,
      storagePath: filePath,
      format,
    };
  }

  /**
   * Retrieve a file
   */
  static async getFile(storagePath: string): Promise<Buffer> {
    if (!fs.existsSync(storagePath)) {
      throw new Error(`File not found: ${storagePath}`);
    }
    
    return fs.promises.readFile(storagePath);
  }

  /**
   * Delete a file
   */
  static async deleteFile(storagePath: string): Promise<boolean> {
    if (!fs.existsSync(storagePath)) {
      return false;
    }
    
    await fs.promises.unlink(storagePath);
    return true;
  }
  
  /**
   * Get relative path for database storage
   * Stores only the path relative to the storage root
   */
  static getRelativePath(fullPath: string): string {
    return path.relative(STORAGE_BASE_DIR, fullPath);
  }
  
  /**
   * Get full path from a relative path
   */
  static getFullPath(relativePath: string): string {
    return path.join(STORAGE_BASE_DIR, relativePath);
  }
}

// Initialize storage on startup
FileStorageService.initialize()
  .then(success => {
    if (success) {
      console.log('File storage initialized successfully');
    } else {
      console.error('Failed to initialize file storage');
    }
  })
  .catch(console.error);

export default FileStorageService; 