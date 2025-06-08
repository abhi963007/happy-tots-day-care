// Script to add custom CSS reference to all HTML files
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

// Function to add custom CSS to HTML files
function addCustomCssToFile(filePath) {
  if (!filePath.toLowerCase().endsWith('.html')) {
    return;
  }
  
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has custom.css
    if (content.includes('custom.css')) {
      console.log(`  Already has custom CSS: ${filePath}`);
      return;
    }
    
    // Determine relative path to CSS
    let relativePath = path.relative(path.dirname(filePath), '.');
    relativePath = relativePath ? relativePath + '/' : '';
    
    // Handle empty relativePath (same directory)
    if (relativePath === '') {
      relativePath = './';
    }
    
    // Add custom CSS before </head>
    const customCssLink = `<link href="${relativePath}css/custom.css" rel="stylesheet" type="text/css">`;
    content = content.replace('</head>', `  ${customCssLink}\n</head>`);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Added custom CSS to: ${filePath}`);
  } catch (err) {
    console.error(`  Error processing ${filePath}:`, err);
  }
}

// Start processing files
console.log('Adding custom CSS to HTML files...');
walkDir('.', addCustomCssToFile);
console.log('Done!'); 