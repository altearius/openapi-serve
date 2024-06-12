import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const importUrl = new URL(import.meta.url);
const importPath = fileURLToPath(importUrl);
const importDir = dirname(importPath);
const ProjectPath = resolve(importDir, '..', '..');

export default ProjectPath;
