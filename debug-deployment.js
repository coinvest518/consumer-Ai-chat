#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Consumer AI Chat Deployment\n');

// Check for environment files
const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found ${file}`);
  } else {
    console.log(`❌ Missing ${file}`);
  }
});

// Check API structure
console.log('\n📁 API Structure:');
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
  const files = fs.readdirSync(apiDir, { withFileTypes: true });
  files.forEach(file => {
    if (file.isDirectory()) {
      console.log(`📂 ${file.name}/`);
      const subDir = path.join(apiDir, file.name);
      const subFiles = fs.readdirSync(subDir);
      subFiles.forEach(subFile => {
        console.log(`  📄 ${subFile}`);
      });
    } else {
      console.log(`📄 ${file.name}`);
    }
  });
} else {
  console.log('❌ API directory not found');
}

// Check package.json scripts
console.log('\n📦 Package.json Scripts:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
Object.keys(packageJson.scripts || {}).forEach(script => {
  console.log(`🔧 ${script}: ${packageJson.scripts[script]}`);
});

// Check vercel.json
console.log('\n⚙️  Vercel Configuration:');
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json found');
  console.log(`📋 Routes: ${JSON.stringify(vercelConfig.routes || vercelConfig.rewrites, null, 2)}`);
} else {
  console.log('❌ vercel.json not found');
}

console.log('\n🚀 Next Steps:');
console.log('1. Ensure all environment variables are set in Vercel dashboard');
console.log('2. Check that API endpoints are properly configured');
console.log('3. Verify Supabase connection is working');
console.log('4. Test endpoints locally with `vercel dev`');
