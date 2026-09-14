import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const publicPaths = ['index.html', 'credits.html', 'css', 'js', 'img', 'vendor'];

export async function build() {
  const output = new URL('../dist/', import.meta.url);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const path of publicPaths) {
    await cp(new URL('../' + path, import.meta.url), new URL(path, output), { recursive: true });
  }
  console.log('Built HorseTinder into dist/');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
