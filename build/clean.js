#!/usr/bin/env node

import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import ProjectPath from './lib/ProjectPath.js';

await rm(resolve(ProjectPath, 'dist'), { force: true, recursive: true });
