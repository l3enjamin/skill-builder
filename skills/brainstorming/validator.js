const process = require('process');
const fs = require('fs');

function parseArgs() {
    const args = process.argv.slice(2);
    let tokens = null;
    let groups = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--tokens') {
            try {
                tokens = JSON.parse(args[i + 1]);
            } catch (e) {
                console.error("Error parsing tokens JSON:", e.message);
                process.exit(1);
            }
            i++;
        } else if (args[i] === '--tokens-file') {
            try {
                const content = fs.readFileSync(args[i + 1], 'utf8');
                tokens = JSON.parse(content);
            } catch (e) {
                console.error("Error reading/parsing tokens file:", e.message);
                process.exit(1);
            }
            i++;
        } else if (args[i] === '--groups') {
            try {
                groups = JSON.parse(args[i + 1]);
            } catch (e) {
                console.error("Error parsing groups JSON:", e.message);
                process.exit(1);
            }
            i++;
        } else if (args[i] === '--groups-file') {
            try {
                 const content = fs.readFileSync(args[i + 1], 'utf8');
                 groups = JSON.parse(content);
            } catch (e) {
                console.error("Error reading/parsing groups file:", e.message);
                process.exit(1);
            }
            i++;
        }
    }
    return { tokens, groups };
}

function validate() {
    const { tokens, groups } = parseArgs();

    if (!tokens || tokens.length === 0) {
        console.error("❌ Error: No tokens provided (use --tokens or --tokens-file).");
        process.exit(1);
    }
    if (!groups || Object.keys(groups).length === 0) {
        console.error("❌ Error: No groups provided (use --groups or --groups-file).");
        process.exit(1);
    }

    const tokenSet = new Set(tokens);
    const groupedTokens = new Set();
    const duplicates = [];

    // Check groups
    for (const [groupName, groupItems] of Object.entries(groups)) {
        if (!Array.isArray(groupItems)) {
            console.error(`❌ Error: Group '${groupName}' is not a list.`);
            process.exit(1);
        }

        for (const item of groupItems) {
            // Check for duplicates across groups (Mutual Exclusivity)
            if (groupedTokens.has(item)) {
                duplicates.push(item);
            }
            groupedTokens.add(item);

            // Check if item was in original list
            if (!tokenSet.has(item)) {
                console.error(`❌ Error: Item '${item}' in group '${groupName}' was not in the original token list.`);
                process.exit(1);
            }
        }
    }

    if (duplicates.length > 0) {
        console.error(`❌ Error: The following items appear in multiple groups (Not Mutually Exclusive): ${duplicates.join(', ')}`);
        process.exit(1);
    }

    // Check for missing items (Collective Exhaustion)
    const missing = tokens.filter(t => !groupedTokens.has(t));
    if (missing.length > 0) {
        console.error(`❌ Error: The following tokens were not assigned to any group: ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log("✅ Validation Successful: Groups are MECE.");
    process.exit(0);
}

validate();
