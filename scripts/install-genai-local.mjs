import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('node_modules/@google/genai');

async function install() {
  console.log('Downloading @google/genai package...');
  if (!fs.existsSync('node_modules/@google')) {
    fs.mkdirSync('node_modules/@google', { recursive: true });
  }

  const tarballUrl = 'https://registry.npmjs.org/@google/genai/-/genai-2.24.0.tgz';
  const tmpTarball = path.resolve('node_modules/@google/genai.tgz');

  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(tmpTarball);
    https.get(tarballUrl, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download tarball: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });

  console.log('Extracting tarball...');
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // Use system tar
  execSync(`tar -xzf "${tmpTarball}" -C "${TARGET_DIR}" --strip-components=1`, { stdio: 'inherit' });
  if (fs.existsSync(tmpTarball)) {
    fs.unlinkSync(tmpTarball);
  }

  console.log('Successfully installed @google/genai to', TARGET_DIR);
}

install().catch(err => {
  console.error('Installation error:', err.message);
});
