const { execSync } = require('child_process');
const { TreeManager } = require('./skills/logic-tree/tree_manager.js');
const fs = require('fs');

// create a dummy git repo for testing
fs.mkdirSync('bench_repo', { recursive: true });
process.chdir('bench_repo');
execSync('git init');
execSync('git config user.email "test@example.com"');
execSync('git config user.name "Test User"');
fs.writeFileSync('README.md', 'init');
execSync('git add README.md');
execSync('git commit -m "init"');

const tm = new TreeManager();

// Create a root node to act as parent
tm.addNode('root', null, 'root content');

const ITERATIONS = 50;

console.log('Starting benchmark...');
const start = performance.now();

for (let i = 0; i < ITERATIONS; i++) {
    tm.addNode(`child${i}`, 'root', `child ${i} content`);
}

const end = performance.now();

console.log(`Time taken to create ${ITERATIONS} nodes: ${(end - start).toFixed(2)} ms`);

// Cleanup
process.chdir('..');
fs.rmSync('bench_repo', { recursive: true, force: true });
