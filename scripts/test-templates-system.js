const { PrismaClient } = require('../src/generated/prisma');
const axios = require('axios');

const prisma = new PrismaClient();

async function testTemplatesSystem() {
  console.log('🧪 Testing Templates System\n');
  
  let testResults = {
    databaseTests: [],
    apiTests: []
  };
  
  try {
    // 1. Test Database Connection and Models
    console.log('1️⃣ Testing database connection and models...');
    
    try {
      const templatesCount = await prisma.documentTemplate.count();
      console.log(`✅ Found ${templatesCount} templates in database`);
      testResults.databaseTests.push({ test: 'Database Connection', status: 'PASS' });
      
      const documentsCount = await prisma.document.count();
      console.log(`✅ Found ${documentsCount} documents in database`);
      
      const documentTypesCount = await prisma.documentType.count();
      console.log(`✅ Found ${documentTypesCount} document types in database`);
      
    } catch (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      testResults.databaseTests.push({ test: 'Database Connection', status: 'FAIL', error: error.message });
    }
    
    // 2. Test Template CRUD Operations
    console.log('\n2️⃣ Testing template CRUD operations...');
    
    try {
      // Create a test template
      const testTemplate = await prisma.documentTemplate.create({
        data: {
          name: 'Test Template',
          description: 'Test template for system validation',
          content: 'This is a test template with [PLACEHOLDER] variables.',
          format: 'markdown',
          documentTypeId: 'type-001', // Using the existing document type ID
          createdById: 'admin-user-uuid',
          updatedById: 'admin-user-uuid',
          metadata: {
            variables: [
              {
                key: 'PLACEHOLDER',
                label: 'Test Placeholder',
                type: 'text',
                required: true
              }
            ]
          }
        }
      });
      
      console.log(`✅ Created test template: ${testTemplate.id}`);
      testResults.databaseTests.push({ test: 'Template Creation', status: 'PASS' });
      
      // Read the template
      const retrievedTemplate = await prisma.documentTemplate.findUnique({
        where: { id: testTemplate.id }
      });
      
      if (retrievedTemplate) {
        console.log(`✅ Retrieved template: ${retrievedTemplate.name}`);
        testResults.databaseTests.push({ test: 'Template Retrieval', status: 'PASS' });
      } else {
        throw new Error('Template not found after creation');
      }
      
      // Update the template
      const updatedTemplate = await prisma.documentTemplate.update({
        where: { id: testTemplate.id },
        data: { 
          name: 'Updated Test Template',
          description: 'Updated description for test template'
        }
      });
      
      console.log(`✅ Updated template: ${updatedTemplate.name}`);
      testResults.databaseTests.push({ test: 'Template Update', status: 'PASS' });
      
      // Delete the test template (cleanup)
      await prisma.documentTemplate.delete({
        where: { id: testTemplate.id }
      });
      
      console.log(`✅ Deleted test template`);
      testResults.databaseTests.push({ test: 'Template Deletion', status: 'PASS' });
      
    } catch (error) {
      console.log(`❌ Template CRUD operations failed: ${error.message}`);
      testResults.databaseTests.push({ test: 'Template CRUD', status: 'FAIL', error: error.message });
    }
    
    // 3. Test Template Variables
    console.log('\n3️⃣ Testing template variables...');
    
    try {
      const templatesWithVariables = await prisma.documentTemplate.findMany({
        where: {
          metadata: {
            path: ['variables'],
            not: null
          }
        }
      });
      
      console.log(`✅ Found ${templatesWithVariables.length} templates with variables`);
      
      if (templatesWithVariables.length > 0) {
        const template = templatesWithVariables[0];
        const variables = template.metadata?.variables || [];
        console.log(`✅ First template has ${variables.length} variables`);
      }
      
      testResults.databaseTests.push({ test: 'Template Variables', status: 'PASS' });
      
    } catch (error) {
      console.log(`❌ Template variables test failed: ${error.message}`);
      testResults.databaseTests.push({ test: 'Template Variables', status: 'FAIL', error: error.message });
    }
    
    // 4. Test Document Types Integration
    console.log('\n4️⃣ Testing document types integration...');
    
    try {
      const documentTypes = await prisma.documentType.findMany();
      console.log(`✅ Found ${documentTypes.length} document types`);
      
      const templatesWithTypes = await prisma.documentTemplate.findMany({
        include: {
          documentType: true
        }
      });
      
      console.log(`✅ Found ${templatesWithTypes.length} templates with document type relationships`);
      testResults.databaseTests.push({ test: 'Document Types Integration', status: 'PASS' });
      
    } catch (error) {
      console.log(`❌ Document types integration test failed: ${error.message}`);
      testResults.databaseTests.push({ test: 'Document Types Integration', status: 'FAIL', error: error.message });
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('Database Tests:');
    testResults.databaseTests.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`  ${status} ${test.test}`);
      if (test.error) {
        console.log(`    Error: ${test.error}`);
      }
    });
    
    const passedTests = testResults.databaseTests.filter(t => t.status === 'PASS').length;
    const totalTests = testResults.databaseTests.length;
    console.log(`\n🎯 Templates System: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All templates system tests passed!');
    } else {
      console.log('⚠️  Some templates system tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during templates system test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTemplatesSystem().catch(console.error); 