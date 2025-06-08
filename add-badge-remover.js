// Script to add badge remover JavaScript to all HTML files
const fs = require('fs');
const path = require('path');

// Function to walk through directories
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Function to add badge remover script to HTML files
function addBadgeRemoverToFile(filePath) {
  if (!filePath.toLowerCase().endsWith('.html')) {
    return;
  }
  
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has remove-webflow-badge.js
    if (content.includes('remove-webflow-badge.js')) {
      console.log(`  Already has badge remover: ${filePath}`);
      return;
    }
    
    // Determine relative path to JS
    let relativePath = path.relative(path.dirname(filePath), '.');
    relativePath = relativePath ? relativePath + '/' : '';
    
    // Handle empty relativePath (same directory)
    if (relativePath === '') {
      relativePath = './';
    }
    
    // Add script before </body>
    const scriptTag = `<script src="${relativePath}js/remove-webflow-badge.js"></script>`;
    content = content.replace('</body>', `  ${scriptTag}\n</body>`);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Added badge remover to: ${filePath}`);
  } catch (err) {
    console.error(`  Error processing ${filePath}:`, err);
  }
}

// Start processing files
console.log('Adding badge remover to HTML files...');
walkDir('.', addBadgeRemoverToFile);
console.log('Done!'); 