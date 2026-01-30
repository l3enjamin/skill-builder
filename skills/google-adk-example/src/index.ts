import {
  LlmAgent,
  GOOGLE_SEARCH,
  InMemoryRunner,
  stringifyContent,
  isFinalResponse,
  getFunctionCalls
} from '@google/adk';

// Helper to create the content object expected by runAsync
function createUserMessage(text: string) {
  return {
    role: 'user',
    parts: [{ text }]
  };
}

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY environment variable is not set.");
    console.error("Please set it to run this skill:");
    console.error("  export GOOGLE_API_KEY=your_key_here");
    // We exit cleanly so the skill runner doesn't just crash with a stack trace
    process.exit(1);
  }

  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error("Usage: bun skills/google-adk-example/src/index.ts <query>");
    console.log("Example: bun skills/google-adk-example/src/index.ts 'What is the latest version of Bun?'");
    process.exit(1);
  }

  console.log(`🤖 Initializing Google ADK Agent for query: "${query}"...`);

  try {
    const agent = new LlmAgent({
      name: 'search_assistant',
      description: 'An assistant that can search the web.',
      model: 'gemini-2.5-flash',
      instruction: 'You are a helpful assistant. Answer user questions using Google Search when needed.',
      tools: [GOOGLE_SEARCH],
    });

    const runner = new InMemoryRunner({
      agent,
      appName: 'search_demo_skill'
    });

    const sessionId = `session-${Date.now()}`;
    const userId = 'user-1';

    console.log("🚀 Agent started. Thinking...");

    // Cast message to any if necessary, but structure matches standard Content
    const generator = runner.runAsync({
      userId,
      sessionId,
      newMessage: createUserMessage(query) as any
    });

    for await (const event of generator) {
      const calls = getFunctionCalls(event);
      if (calls && calls.length > 0) {
        console.log("🛠️  Agent calling tool(s):", calls.map(c => c.name).join(", "));
      }

      if (isFinalResponse(event)) {
        const text = stringifyContent(event);
        if (text) {
             console.log("\n💬 Response:");
             console.log(text);
        }
      }
    }

    console.log("\n✅ Done.");

  } catch (error) {
    console.error("💥 Error running agent:", error);
    process.exit(1);
  }
}

main();
