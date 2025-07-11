#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Consumer AI Chat Build\n');

// Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  console.log('✅ dist directory exists');
  
  // Check if index.html exists in dist
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists in dist');
  } else {
    console.log('❌ index.html does not exist in dist');
  }
  
  // Check for assets directory
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    console.log('✅ assets directory exists in dist');
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(`   Found ${assetFiles.length} asset files`);
  } else {
    console.log('❌ assets directory does not exist in dist');
  }
} else {
  console.log('❌ dist directory does not exist');
}

// Check API directory
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
  console.log('✅ api directory exists');
  const apiFiles = fs.readdirSync(apiDir);
  console.log(`   Found ${apiFiles.length} API files`);
} else {
  console.log('❌ api directory does not exist');
}

console.log('\nVerification complete. If any checks failed, your build process may need adjustment.');
