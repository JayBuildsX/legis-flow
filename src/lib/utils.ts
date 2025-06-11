import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Merges multiple class names using clsx and tailwind-merge
 * This allows for conditional classes and proper handling of Tailwind classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a localized date format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy', { locale: fr });
  } catch {
    return dateString;
  }
}

/**
 * Validates if a document has all required fields for display
 */
export function validateDocumentFormat(doc: any): { valid: boolean; missing: string[] } {
  const requiredFields = ['id', 'title', 'reference', 'type', 'status', 'createdAt', 'updatedAt'];
  const missing = requiredFields.filter(field => doc[field] === undefined);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Checks if an array of documents are valid for display
 */
export function validateDocuments(documents: any[]): { 
  valid: boolean; 
  invalidCount: number; 
  firstInvalid?: { doc: any; missing: string[] } 
} {
  if (!Array.isArray(documents)) {
    return { valid: false, invalidCount: 1, firstInvalid: { doc: documents, missing: ['array'] } };
  }
  
  const validations = documents.map(doc => ({
    doc,
    validation: validateDocumentFormat(doc)
  }));
  
  const invalid = validations.filter(v => !v.validation.valid);
  
  return {
    valid: invalid.length === 0,
    invalidCount: invalid.length,
    firstInvalid: invalid.length > 0 ? { 
      doc: invalid[0].doc, 
      missing: invalid[0].validation.missing 
    } : undefined
  };
} 