import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const indexPath = path.join(distPath, 'index.html');
const copyPath = path.join(distPath, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, copyPath);
  console.log('[BUILD] Created 404.html for GitHub Pages SPA routing');
}
