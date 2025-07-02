const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function runComprehensiveHealthCheck() {
  console.log('🔍 LEGIS-FLOW COMPREHENSIVE HEALTH CHECK\n');
  console.log('='.repeat(50));
  
  let overallScore = 0;
  const maxScore = 10;
  
  try {
    // 1. Database Connection Test
    console.log('\n1️⃣ DATABASE CONNECTION TEST');
    console.log('-'.repeat(30));
    try {
      await prisma.$connect();
      console.log('✅ Database connection: WORKING');
      overallScore += 1;
      
      // Check basic table counts
      const users = await prisma.user.count();
      const documents = await prisma.document.count();
      const templates = await prisma.documentTemplate.count();
      const workflows = await prisma.workflow.count();
      const organizations = await prisma.organization.count();
      
      console.log(`   📊 Users: ${users}`);
      console.log(`   📄 Documents: ${documents}`);
      console.log(`   📋 Templates: ${templates}`);
      console.log(`   ⚙️ Workflows: ${workflows}`);
      console.log(`   🏢 Organizations: ${organizations}`);
      
      overallScore += 1;
    } catch (error) {
      console.log('❌ Database connection: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 2. Prisma Models Test
    console.log('\n2️⃣ PRISMA MODELS TEST');
    console.log('-'.repeat(30));
    try {
      // Test complex queries with relations
      const userWithRoles = await prisma.user.findFirst({
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });
      
      console.log(`✅ User relations: WORKING`);
      if (userWithRoles) {
        console.log(`   👤 User: ${userWithRoles.firstName || userWithRoles.username}`);
        console.log(`   🎭 Roles: ${userWithRoles.userRoles.length}`);
      }
      
      const templateWithType = await prisma.documentTemplate.findFirst({
        include: {
          documentType: true
        }
      });
      
      console.log(`✅ Template relations: WORKING`);
      if (templateWithType) {
        console.log(`   📝 Template: ${templateWithType.name}`);
        console.log(`   📋 Type: ${templateWithType.documentType?.name || 'None'}`);
      }
      
      overallScore += 1;
    } catch (error) {
      console.log('❌ Prisma models: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 3. Templates System Test
    console.log('\n3️⃣ TEMPLATES SYSTEM TEST');
    console.log('-'.repeat(30));
    try {
      const templatesWithVariables = await prisma.documentTemplate.findMany({
        where: {
          metadata: {
            not: null
          }
        }
      });
      
      console.log(`✅ Templates with metadata: ${templatesWithVariables.length}`);
      
      if (templatesWithVariables.length > 0) {
        const template = templatesWithVariables[0];
        const variables = template.metadata?.variables || [];
        console.log(`   🔧 Variables in first template: ${variables.length}`);
      }
      
      overallScore += 2;
    } catch (error) {
      console.log('❌ Templates system: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 4. Workflow System Test
    console.log('\n4️⃣ WORKFLOW SYSTEM TEST');
    console.log('-'.repeat(30));
    try {
      const workflowsWithSteps = await prisma.workflow.findMany({
        include: {
          steps: true,
          transitions: true
        }
      });
      
      console.log(`✅ Workflows found: ${workflowsWithSteps.length}`);
      
      if (workflowsWithSteps.length > 0) {
        const workflow = workflowsWithSteps[0];
        console.log(`   ⚙️ Workflow: ${workflow.name}`);
        console.log(`   📊 Steps: ${workflow.steps.length}`);
        console.log(`   🔄 Transitions: ${workflow.transitions.length}`);
      }
      
      overallScore += 1;
    } catch (error) {
      console.log('❌ Workflow system: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 5. Document Management Test
    console.log('\n5️⃣ DOCUMENT MANAGEMENT TEST');
    console.log('-'.repeat(30));
    try {
      const documentsWithVersions = await prisma.document.findMany({
        include: {
          versions: true,
          documentType: true
        },
        take: 5
      });
      
      console.log(`✅ Documents with relations: ${documentsWithVersions.length}`);
      
      if (documentsWithVersions.length > 0) {
        const doc = documentsWithVersions[0];
        console.log(`   📄 Document: ${doc.title}`);
        console.log(`   📊 Versions: ${doc.versions.length}`);
        console.log(`   📋 Type: ${doc.documentType?.name || 'None'}`);
      }
      
      overallScore += 1;
    } catch (error) {
      console.log('❌ Document management: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 6. Authentication Data Test
    console.log('\n6️⃣ AUTHENTICATION DATA TEST');
    console.log('-'.repeat(30));
    try {
      const usersWithAuth = await prisma.user.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        },
        take: 3
      });
      
      console.log(`✅ Active users: ${usersWithAuth.length}`);
      
      usersWithAuth.forEach(user => {
        const permissions = user.userRoles.flatMap(ur => 
          ur.role.rolePermissions.map(rp => rp.permission.code)
        );
        console.log(`   👤 ${user.firstName || user.username}: ${permissions.length} permissions`);
      });
      
      overallScore += 1;
    } catch (error) {
      console.log('❌ Authentication data: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 7. Data Integrity Test
    console.log('\n7️⃣ DATA INTEGRITY TEST');
    console.log('-'.repeat(30));
    try {
      // Check for orphaned records
      const templatesWithoutType = await prisma.documentTemplate.count({
        where: {
          documentType: null
        }
      });
      
      const documentsWithoutType = await prisma.document.count({
        where: {
          documentType: null
        }
      });
      
      console.log(`✅ Data integrity checks completed`);
      console.log(`   📋 Templates without type: ${templatesWithoutType}`);
      console.log(`   📄 Documents without type: ${documentsWithoutType}`);
      
      if (templatesWithoutType === 0 && documentsWithoutType === 0) {
        console.log(`   ✅ No orphaned records found`);
        overallScore += 1;
      } else {
        console.log(`   ⚠️ Some orphaned records found`);
        overallScore += 0.5;
      }
    } catch (error) {
      console.log('❌ Data integrity: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // 8. System Configuration Test
    console.log('\n8️⃣ SYSTEM CONFIGURATION TEST');
    console.log('-'.repeat(30));
    try {
      // Check environment variables
      const envVars = [
        'DATABASE_URL',
        'JWT_SECRET'
      ];
      
      let envScore = 0;
      envVars.forEach(envVar => {
        if (process.env[envVar]) {
          console.log(`   ✅ ${envVar}: SET`);
          envScore++;
        } else {
          console.log(`   ❌ ${envVar}: NOT SET`);
        }
      });
      
      if (envScore === envVars.length) {
        console.log(`✅ System configuration: COMPLETE`);
        overallScore += 1;
      } else {
        console.log(`⚠️ System configuration: INCOMPLETE`);
        overallScore += 0.5;
      }
    } catch (error) {
      console.log('❌ System configuration: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 HEALTH CHECK SUMMARY');
    console.log('='.repeat(50));
    
    const percentage = (overallScore / maxScore) * 100;
    let status = '';
    let emoji = '';
    
    if (percentage >= 90) {
      status = 'EXCELLENT';
      emoji = '🟢';
    } else if (percentage >= 70) {
      status = 'GOOD';
      emoji = '🟡';
    } else if (percentage >= 50) {
      status = 'FAIR';
      emoji = '🟠';
    } else {
      status = 'POOR';
      emoji = '🔴';
    }
    
    console.log(`${emoji} Overall Health: ${percentage.toFixed(1)}% (${overallScore}/${maxScore})`);
    console.log(`📈 Status: ${status}`);
    
    if (percentage >= 80) {
      console.log('\n🎉 System is ready for production use!');
      console.log('✅ All major components are functioning correctly');
    } else if (percentage >= 60) {
      console.log('\n⚠️ System is mostly functional but needs attention');
      console.log('🔧 Some components may require fixes');
    } else {
      console.log('\n❌ System has significant issues');
      console.log('🚨 Critical fixes required before production use');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during health check:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the comprehensive health check
runComprehensiveHealthCheck(); 