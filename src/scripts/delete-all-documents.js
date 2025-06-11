// Simple script to delete all documents in the system
// Run with: node src/scripts/delete-all-documents.js

async function deleteAllDocuments() {
  try {
    console.log('Attempting to delete all documents...');
    
    // Get the auth token from localStorage if running in browser, or use a default for testing
    let authToken = 'mock-jwt-token-for-user-user-4-exp-1748996204585-1748992604585';
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        authToken = storedToken;
      }
    }
    
    // Determine the base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // Make request to delete all documents
    const response = await fetch(`${baseUrl}/api/v1/documents/reset`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!', result.message);
    } else {
      console.error('❌ Failed to delete documents:', result.error || response.statusText);
    }
    
    // After deleting, refresh the documents list if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/documents';
    }
    
  } catch (error) {
    console.error('Error deleting documents:', error);
  }
}

// Auto-execute the function if run directly
if (typeof require !== 'undefined' && require.main === module) {
  deleteAllDocuments();
}

// Export for use in components
module.exports = deleteAllDocuments; 