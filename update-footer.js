const fs = require('fs');
const path = require('path');

// Define the new footer text
const newFooterText = `          <div class="copyright"> 2025 Happy tots day care. All rights reserved</div>
          <div class="copyright">Made by DualNova-Labs</div>`;

// Function to recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (path.extname(file).toLowerCase() === '.html') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update the footer in a file
function updateFooter(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Use regex to find and replace the footer content
    const footerRegex = /<div class="copyright">\s*\d{4}[^<]*<\/div>\s*<div class="copyright">Made by[^<]*<a[^>]*>Oldshen<\/a>[^<]*<a[^>]*>Webflow<\/a>[^<]*<\/div>/;
    
    if (footerRegex.test(content)) {
      content = content.replace(footerRegex, newFooterText);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated footer in: ${filePath}`);
      return true;
    } else {
      console.log(`Footer pattern not found in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  const rootDir = '.';
  const htmlFiles = findHtmlFiles(rootDir);
  
  console.log(`Found ${htmlFiles.length} HTML files`);
  
  let updatedCount = 0;
  
  htmlFiles.forEach(file => {
    if (updateFooter(file)) {
      updatedCount++;
    }
  });
  
  console.log(`Updated footer in ${updatedCount} files`);
}

main(); 