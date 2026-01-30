# Google ADK Example Skill

This skill demonstrates how to integrate the [Google Agent Development Kit (ADK)](https://github.com/google/adk-js) into the Skill Builder ecosystem.

It defines an `LlmAgent` using `@google/adk` that is equipped with the `GOOGLE_SEARCH` tool.

## Prerequisites

- **Bun**: This skill uses Bun for execution (recommended by ADK).
- **Google API Key**: You need a Gemini API key. Get one from [Google AI Studio](https://aistudio.google.com/).

## Usage

1.  Set your API Key:
    ```bash
    export GOOGLE_API_KEY=your_key_here
    ```

2.  Run the skill script directly:
    ```bash
    bun skills/google-adk-example/src/index.ts "Who is the CEO of Google?"
    ```

    Or find it via the skill search:
    ```bash
    node scripts/search_skills.js adk
    ```

## Structure

- `src/index.ts`: The TypeScript code that initializes the ADK agent and runner.
- `skill.json`: The skill definition file compatible with the project's skill runner.
