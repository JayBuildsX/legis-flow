// Simple script to check document count
// Run with: node src/scripts/check-documents.js

async function checkDocuments() {
  try {
    console.log('Checking document count...');
    
    // Determine the base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // Make request to get documents
    const response = await fetch(`${baseUrl}/api/v1/documents`);
    const data = await response.json();
    
    console.log('Total documents:', data.total);
    console.log('Documents:', data.items.length > 0 ? data.items.map(doc => doc.title).join(', ') : 'None');
    
  } catch (error) {
    console.error('Error checking documents:', error);
  }
}

// Auto-execute the function if run directly
if (typeof require !== 'undefined' && require.main === module) {
  checkDocuments();
}

// Export for use in components
module.exports = checkDocuments; 