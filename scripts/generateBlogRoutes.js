/**
 * Generate blog routes for pre-rendering
 * Run this script after adding new blog posts:
 *   node scripts/generateBlogRoutes.js
 * 
 * This regenerates prerender-routes.json which is used during production builds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog has been removed from the public site. Only static pages are prerendered.
const staticRoutes = [
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/cookies',
];

function generateRoutes() {
  try {
    // Write to prerender-routes.json
    const outputPath = path.join(__dirname, '..', 'prerender-routes.json');
    const output = {
      routes: staticRoutes,
      generatedAt: new Date().toISOString(),
      totalRoutes: staticRoutes.length,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log('✅ Generated prerender-routes.json');
    console.log(`   Static pages: ${staticRoutes.length}`);
    console.log(`   Total routes: ${staticRoutes.length}`);
    console.log(`\n   Output: ${outputPath}`);

  } catch (error) {
    console.error('Error generating routes:', error);
    process.exit(1);
  }
}

generateRoutes();
