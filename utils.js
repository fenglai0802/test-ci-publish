const path = require('path');
const fs = require('fs');

function generateNpmrc(cwd) {
  const npmrc = path.join(cwd, '.npmrc');
  
  const NPM_EMAIL = process.env.NPM_EMAIL || 'fenglai0802@163.com';
  const NPM_TOKEN = process.env.NPM_TOKEN || 'fe514779-0279-427a-8778-391245b39aae';
  const NPM_REGISTRY = process.env.NPM_REGISTRY || 'registry.npmjs.com';
  
  const registry = `https://${NPM_REGISTRY}`;
  
  const npmrcContext = `email=${NPM_EMAIL}
  registry=http://${NPM_REGISTRY}/
  //${NPM_REGISTRY}/:_authToken=${NPM_TOKEN}
  `;
  
  fs.writeFileSync(npmrc, npmrcContext);
}
module.exports = {
  generateNpmrc
}