const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function main() {
  try {
    console.log('Testing document upload...');
    
    // Create a simple test PDF file if it doesn't exist
    const testDir = path.join(__dirname, 'test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testPdfPath = path.join(testDir, 'test-document.txt');
    if (!fs.existsSync(testPdfPath)) {
      fs.writeFileSync(testPdfPath, 'This is a test document for upload testing.');
      console.log(`Created test file at: ${testPdfPath}`);
    }
    
    // Get document types
    const docTypesResponse = await fetch('http://localhost:3000/api/v1/document-types');
    const docTypesData = await docTypesResponse.json();
    
    if (!docTypesData.success || !docTypesData.data || docTypesData.data.length === 0) {
      throw new Error('Failed to fetch document types or no document types available');
    }
    
    const documentTypeId = docTypesData.data[0].id;
    console.log(`Using document type: ${docTypesData.data[0].name} (${documentTypeId})`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testPdfPath));
    formData.append('title', 'Test Document Upload');
    formData.append('referenceNumber', 'TEST-' + Date.now());
    formData.append('description', 'This is a test document uploaded via API');
    formData.append('documentTypeId', documentTypeId);
    formData.append('confidentiality', 'PUBLIC');
    formData.append('keywords', 'test,upload,api');
    
    // Upload document
    const uploadResponse = await fetch('http://localhost:3000/api/v1/documents/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
    
    if (uploadResponse.status === 201 && uploadResult.success) {
      console.log('Document upload successful!');
    } else {
      console.error('Document upload failed:', uploadResult.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error in test upload:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 