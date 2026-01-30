import {
  LlmAgent,
  InMemoryRunner,
  FunctionTool,
  getFunctionCalls
} from '@google/adk';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

// --- Type Definitions ---
interface SkillMetadata {
  name: string;
  description: string;
  keywords: string[];
}

// --- Helper Functions ---

/**
 * Discovers skills by reading package.json files in the skills directory.
 */
function discoverSkills(): SkillMetadata[] {
  const skillsDir = path.resolve(process.cwd(), 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  const skills: SkillMetadata[] = [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'router') continue; // Don't include self

    const pkgPath = path.join(skillsDir, entry.name, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        skills.push({
          name: entry.name, // Use directory name as the canonical skill ID
          description: pkg.description || `Execute the ${entry.name} skill`,
          keywords: pkg.keywords || []
        });
      } catch (e) {
        console.warn(`Failed to parse package.json for ${entry.name}`);
      }
    }
  }
  return skills;
}

/**
 * Creates a simple user message for the ADK runner.
 */
function createUserMessage(text: string) {
  return {
    role: 'user',
    parts: [{ text }]
  };
}

// --- Main Router Logic ---

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY environment variable is not set.");
    process.exit(1);
  }
  // ADK uses GOOGLE_GENAI_API_KEY internally
  process.env.GOOGLE_GENAI_API_KEY = apiKey;

  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error("Usage: bun skills/router/src/index.ts <query>");
    process.exit(1);
  }

  const skills = discoverSkills();
  if (skills.length === 0) {
    console.error("No skills found in skills/ directory.");
    process.exit(1);
  }

  // console.log(`🧠 Router initialized with ${skills.length} skills.`);

  // Create tools for each skill
  // ADK FunctionTool allows us to define the "tool" that the model can pick.
  // We will create one tool per skill.
  const tools = skills.map(skill => {
    // Sanitize name for tool definition (must be valid variable name)
    const toolName = skill.name.replace(/[^a-zA-Z0-9_]/g, '_');

    return new FunctionTool({
      name: toolName,
      description: skill.description,
      parameters: z.object({
        reason: z.string().describe("Why you chose this skill")
      }),
      execute: async ({ reason }) => {
        // This function is called when the model picks the tool.
        // We return the skill name so we can capture it.
        return { skill: skill.name, reason };
      }
    });
  });

  const agent = new LlmAgent({
    name: 'skill_router',
    description: 'Routes user requests to the appropriate skill.',
    model: 'gemini-2.5-flash',
    instruction: `You are an intelligent skill router.
    Analyze the user's request and select the BEST available tool (skill) to handle it.
    If no skill is relevant, simply reply explaining why.
    Do not ask clarifying questions, just make the best choice or decline.
    The available skills are provided as tools.`,
    tools: tools,
  });

  const runner = new InMemoryRunner({
    agent,
    appName: 'skill-router'
  });

  const sessionId = `router-${Date.now()}`;
  const userId = 'user-1';

  try {
    // Initialize session explicitly
    await runner.sessionService.createSession({
      appName: 'skill-router',
      userId,
      sessionId
    });

    const generator = runner.runAsync({
      userId,
      sessionId,
      newMessage: createUserMessage(query) as any
    });

    let skillSelected = false;

    for await (const event of generator) {
      const calls = getFunctionCalls(event);
      if (calls && calls.length > 0) {
        // The agent decided to call a tool (skill)
        // In a real agent loop, we would execute the tool and feed the result back.
        // But here, we just want to know *which* skill was picked so we can launch it.

        // The tool name in the event matches the name we gave it.
        const toolName = calls[0].name;

        // Find the original skill name (since we sanitized it)
        const selectedSkill = skills.find(s => s.name.replace(/[^a-zA-Z0-9_]/g, '_') === toolName);

        if (selectedSkill) {
          console.log(selectedSkill.name); // OUTPUT ONLY THE SKILL NAME
          skillSelected = true;
          break; // Stop execution, we found our route
        }
      }
    }

    if (!skillSelected) {
       // If no tool was called, maybe output nothing or a special code?
       // The original search script outputs matches or errors.
       // Let's print nothing to stdout if no match, so the caller knows it failed?
       // Or print a helpful message to stderr.
       console.error("No suitable skill found via semantic routing.");
       process.exit(1);
    }

  } catch (error) {
    console.error("Error during routing:", error);
    process.exit(1);
  }
}

main();
