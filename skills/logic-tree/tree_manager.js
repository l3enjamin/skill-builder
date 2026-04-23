const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');

const BRANCH_PREFIX = 'lt--';
const SEPARATOR = '--';

class TreeManager {
    constructor() {
        this.verifyGit();
    }

    verifyGit() {
        try {
            execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
        } catch (e) {
            throw new Error("❌ Error: Not inside a git repository. Initialize git first.");
        }
    }

    _exec(cmd, args) {
        try {
            return execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe' }).trim();
        } catch (e) {
            // e.stderr might have info
            // console.error(e.stderr);
            throw e;
        }
    }

    _getBranchName(nodePath) {
        // nodePath e.g. "root/child" -> "lt--root--child"
        // sanitize: replace / with SEPARATOR
        let cleanPath = nodePath.replace(/\//g, SEPARATOR);
        // Replace spaces with -
        cleanPath = cleanPath.replace(/\s+/g, '-');
        // Remove unsafe chars (allow alphanumeric, -, _, .)
        cleanPath = cleanPath.replace(/[^a-zA-Z0-9\-\_\.]/g, '');

        return `${BRANCH_PREFIX}${cleanPath}`;
    }

    _getNodePathFromBranch(branchName) {
        if (!branchName.startsWith(BRANCH_PREFIX)) return null;
        const raw = branchName.substring(BRANCH_PREFIX.length);
        return raw.split(SEPARATOR).join('/');
    }

    addNode(name, parentPath, content) {
        let fullPath = name;
        let parentBranch = null;

        if (parentPath) {
            parentBranch = this._getBranchName(parentPath);
            // Verify parent exists
            try {
                this._exec('git', ['show-ref', '--verify', `refs/heads/${parentBranch}`]);
            } catch (e) {
                throw new Error(`❌ Error: Parent node '${parentPath}' (branch ${parentBranch}) does not exist.`);
            }
            fullPath = `${parentPath}/${name}`;
        }

        const newBranch = this._getBranchName(fullPath);

        // Check if branch exists
        try {
            this._exec('git', ['show-ref', '--verify', `refs/heads/${newBranch}`]);
            throw new Error(`❌ Error: Node '${fullPath}' already exists (Branch: ${newBranch}).`);
        } catch (e) {
            if (e.message.includes('already exists')) throw e;
            // Good - branch does not exist
        }

        console.log(`Creating node '${fullPath}' on branch '${newBranch}'...`);

        if (parentBranch) {
            try {
                this._exec('git', ['checkout', '-b', newBranch, parentBranch]);
            } catch (e) {
                throw new Error(`❌ Error creating branch ${newBranch} from ${parentBranch}: ${e.message}`);
            }
        } else {
            try {
                 this._exec('git', ['checkout', '-b', newBranch]);
            } catch (e) {
                throw new Error(`❌ Error creating branch ${newBranch}: ${e.message}`);
            }
        }

        // Write content
        if (content) {
            fs.writeFileSync('README.md', content);
            try {
                this._exec('git', ['add', 'README.md']);
                this._exec('git', ['commit', '-m', `Add node ${fullPath}`]);
            } catch (e) {
                 console.log("⚠️  Nothing to commit (content might be same as parent).");
            }
        }

        console.log(`✅ Node '${fullPath}' created.`);
    }

    listTree() {
        // Get all branches
        // git branch --list returns formatted list.
        // We can use --format to get clean names
        const output = this._exec('git', ['branch', '--list', '--format=%(refname:short)']);
        const branches = output.split('\n').map(b => b.trim()).filter(b => b.length > 0);

        const treeNodes = branches
            .map(b => this._getNodePathFromBranch(b))
            .filter(p => p !== null)
            .sort();

        if (treeNodes.length === 0) {
            console.log("No logic tree nodes found.");
            return;
        }

        console.log("\n🌳 Logic Tree Structure:");
        treeNodes.forEach(nodePath => {
            const parts = nodePath.split('/');
            const depth = parts.length - 1;
            const name = parts[parts.length - 1];
            const prefix = '  '.repeat(depth) + '└─ ';
            console.log(`${prefix}${name} (${nodePath})`);
        });
    }

    pruneNode(nodePath) {
        const targetBranchPrefix = this._getBranchName(nodePath);

        const output = this._exec('git', ['branch', '--list', '--format=%(refname:short)']);
        const branches = output.split('\n').map(b => b.trim());

        // Match exact or prefix+separator
        const toDelete = branches.filter(b => b === targetBranchPrefix || b.startsWith(targetBranchPrefix + SEPARATOR));

        if (toDelete.length === 0) {
            throw new Error(`❌ Node '${nodePath}' not found.`);
        }

        console.log(`Pruning node '${nodePath}' and ${toDelete.length - 1} descendants...`);

        const currentBranch = this._exec('git', ['branch', '--show-current']);
        const toDeleteSet = new Set(toDelete);
        if (toDeleteSet.has(currentBranch)) {
            // Find safe branch
            const safeBranch = branches.find(b => !toDeleteSet.has(b));
            if (safeBranch) {
                this._exec('git', ['checkout', safeBranch]);
            } else {
                throw new Error("❌ Error: Cannot prune because no safe branch exists to switch to.");
            }
        }

        if (toDelete.length > 0) {
            try {
                this._exec('git', ['branch', '-D', ...toDelete]);
                toDelete.forEach(b => console.log(`Deleted ${b}`));
            } catch (e) {
                // Fallback to individual deletion if batch fails
                toDelete.forEach(b => {
                    try {
                        this._exec('git', ['branch', '-D', b]);
                        console.log(`Deleted ${b}`);
                    } catch (e2) {
                        console.error(`Failed to delete ${b}: ${e2.message}`);
                    }
                });
            }
        }
        console.log("✅ Prune complete.");
    }

    checkoutNode(nodePath) {
        const branchName = this._getBranchName(nodePath);
        try {
            this._exec('git', ['checkout', branchName]);
            console.log(`✅ Switched to node '${nodePath}'`);

            if (fs.existsSync('README.md')) {
                console.log("\n📄 Content:");
                console.log(fs.readFileSync('README.md', 'utf8'));
            }
        } catch (e) {
            throw new Error(`❌ Error: Could not checkout '${nodePath}'. Does it exist?`);
        }
    }
}

module.exports = { TreeManager };

function main() {
    if (require.main !== module) return;
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: node tree_manager.js <action> [options]");
        process.exit(1);
    }

    try {
        const tm = new TreeManager();
    const action = args[0];

    // Helper to get value for a flag
    // We cannot use simple indexOf if values have spaces, but here inputs are passed as args.
    // Node separates args by spaces unless quoted.
    // So if user calls: node script.js add --name "Foo Bar"
    // args = ['add', '--name', 'Foo Bar']
    // My previous parsing worked fine for this.
    const getArg = (flag) => {
        const idx = args.indexOf(flag);
        return idx !== -1 ? args[idx + 1] : null;
    };

    switch (action) {
        case 'add':
            const name = getArg('--name');
            const parent = getArg('--parent');
            const content = getArg('--content') || "No content";
            if (!name) {
                console.error("❌ --name required");
                process.exit(1);
            }
            tm.addNode(name, parent, content);
            break;
        case 'list':
            tm.listTree();
            break;
        case 'prune':
            const prunePath = getArg('--path');
            if (!prunePath) {
                console.error("❌ --path required");
                process.exit(1);
            }
            tm.pruneNode(prunePath);
            break;
        case 'checkout':
            const checkoutPath = getArg('--path');
            if (!checkoutPath) {
                console.error("❌ --path required");
                process.exit(1);
            }
            tm.checkoutNode(checkoutPath);
            break;
        default:
            console.error(`❌ Unknown action: ${action}`);
            process.exit(1);
    }
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}

main();
