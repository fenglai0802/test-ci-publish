const npmRequestJson = require('npm-request-json');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const rimraf = require("rimraf");
const semver = require("semver");
const { generateNpmrc } = require('./utils');
 
function publishMaterialsDB() {
  
  // 1. 创建临时文件夹
  const tempDir = path.join(__dirname, 'tempDir');
  rimraf.sync(tempDir); // 初始化删除
  fs.mkdirSync(tempDir);
  const tempLibDir = path.join(tempDir, 'lib');
  fs.mkdirSync(tempLibDir);

  // 2. 创建 npmrc 文件
  generateNpmrc(tempDir);
  const npmrc = path.join(tempDir, 'npmrc');
  
  // 3 同步build下物料源配置文件到 tempDir/src 下
  const buildPath = path.resolve(__dirname, './build');
  fs.readdirSync(buildPath).map(
    (filename) => {
      const from = path.join(buildPath, filename);
      const to = path.join(tempLibDir, filename);
      fs.copyFileSync(from, to);
    }
  );
  
  // 4. 创建 package.json 文件
  const pkgConfig = {
    "name": "@icedesign/materails-db-test",
    "version": "1.0.0",
    "description": "iceworks 官方物料源备份数据",
    "main": "lib",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "MIT",
    "publishConfig": {
      "access": "public"
    }
  };
  // 获取已发布版本号
  const NPM_REGISTRY = process.env.NPM_REGISTRY || 'registry.npmjs.com';
  const registry = `https://${NPM_REGISTRY}`;
  return npmRequestJson({
    name: pkgConfig.name,
    version: 'latest',
    registry,
  })
  .then((pkgData) => {
    // 版本号自增1
    pkgConfig.version = semver.inc(pkgData.version, 'patch');
    const pkgPath = path.join(tempDir, 'package.json');
    fs.writeFileSync(pkgPath, JSON.stringify(pkgConfig));
    // 5. 发布
    exec('npm publish', {
      cwd: tempDir,
      env: Object.assign({}, process.env, {
        NPM_CONFIG_GLOBALCONFIG: npmrc, // 定义 npm 发布权限认证 rc 文件
      }),
    }, (error, stdout, stderr) => {
      if(error) {
        console.error(error);
        rimraf.sync(tempDir);
        return
        // throw error;
      }
      console.log('发布完成: ' + stdout);
      rimraf.sync(tempDir);
    })
  })
}

publishMaterialsDB()

module.exports = {
  publishMaterialsDB
}