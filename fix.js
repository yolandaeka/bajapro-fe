const fs = require('fs');
const path = require('path');
const dir = 'e:/bajapro-fe/src/src/actions';

const walkSync = (d) => {
  let results = [];
  const list = fs.readdirSync(d);
  list.forEach(file => {
    const fileDir = path.join(d, file);
    const stat = fs.statSync(fileDir);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walkSync(fileDir));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fileDir);
    }
  });
  return results;
};

const files = walkSync(dir);
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const targetRegex = /const getBaseUrl = \(\) => \{\s*if \(typeof window !== ["']undefined["']\) return process\.env\.NEXT_PUBLIC_API_URL \|\| ["']\/api["'];\s*if \(process\.env\.VERCEL_URL\) return ["']https:\/\/["'] \+ process\.env\.VERCEL_URL \+ ["']\/api["'];\s*return ["']http:\/\/localhost:3000\/api["'];\s*\};/g;

  if (targetRegex.test(content)) {
    const newCode = `const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return "/api";
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL + "/api";
  const port = process.env.PORT || 3000;
  return \`http://localhost:\${port}/api\`;
};`;
    content = content.replace(targetRegex, newCode);
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});
console.log('Fixed ' + changedCount + ' files.');
