const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to walk through files recursively
function findAndReplaceInFiles() {
  const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { cwd: process.cwd() });
  console.log(`Found ${files.length} files to process`);
  
  let replacedFiles = 0;
  let replacedOccurrences = 0;

  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    console.log(`Processing: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Debug output
      const matches = content.match(/\bneutral\b/g);
      if (matches && matches.length > 0) {
        console.log(`Found ${matches.length} occurrences in ${file}`);
      }
      
      // Use regex to replace neutral with slate
      const newContent = content.replace(/\bneutral\b/g, 'slate');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        const occurrences = (content.match(/\bneutral\b/g) || []).length;
        replacedFiles++;
        replacedOccurrences += occurrences;
        console.log(`Updated ${file} (${occurrences} occurrences)`);
      }
    } catch (err) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  });

  console.log(`\nTotal files updated: ${replacedFiles}`);
  console.log(`Total occurrences replaced: ${replacedOccurrences}`);
}

findAndReplaceInFiles(); 