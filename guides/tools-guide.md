# Implementing Tool Use in DishGenius Chat Backend

This guide explains how to implement a tool system that allows your LLM to use custom-defined tools through your chat API.

## Overview

The tool system allows the LLM to:
1. Access tool descriptions and capabilities
2. Request tool execution with specific parameters
3. Receive the results of tool execution
4. Integrate those results into its response

## Implementation Steps

### 1. Create a Tool System Structure

First, let's create a structured way to define and organize tools following OpenAI's function calling schema:

```typescript
// tools/types.ts
/**
 * Interface for function parameters
 */
export interface FunctionParameters {
  type: "object";
  properties: Record<string, {
    type: string | string[];
    description: string;
    enum?: string[];
  }>;
  required: string[];
  additionalProperties: boolean;
}

/**
 * Interface for function definition
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: FunctionParameters;
}

/**
 * Tool definition interface following OpenAI's function calling schema
 */
export interface ToolDefinition {
  type: "function";
  function: FunctionDefinition;
  // This is our custom property not sent to OpenAI
  execute?: (params: Record<string, any>) => Promise<any>;
}

/**
 * Tool call interface for parsing requests from the LLM
 */
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Tool result interface for returning execution results
 */
export interface ToolResult {
  id: string;
  result: any;
  error?: string;
}
```

### 2. Create a Tools Registry

Create a registry to manage your tools:

```typescript
// tools/index.ts
import { ToolDefinition } from './types';

// Registry of all available tools
const toolRegistry = new Map<string, ToolDefinition>();

// Register a new tool
export function registerTool(tool: ToolDefinition) {
  toolRegistry.set(tool.function.name, tool);
  console.log(`Tool registered: ${tool.function.name}`);
}

// Get a tool by name
export function getTool(name: string): ToolDefinition | undefined {
  return toolRegistry.get(name);
}

// Get all registered tools
export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

// Get tool definitions in OpenAI-compatible format
export function getToolDefinitions(): ToolDefinition[] {
  return getAllTools();
}
```

### 3. Create a Tool Registration File

To avoid circular dependencies, create a separate file to register all tools:

```typescript
// tools/register.ts
/**
 * Tool registration file - import all tools here
 * 
 * This file is responsible for importing all tool implementation files,
 * which will register themselves with the tool registry.
 * 
 * Import this file in your application to ensure all tools are registered.
 */

// Import all tool implementation files here
import './tools/recipeLookup';
import './tools/nutritionInfo';
// Add new tool imports here
```

### 4. Implement Example Tools

Create some example tools:

```typescript
// tools/tools/recipeLookup.ts
import { registerTool } from '../index';

// Mock database of recipes
const recipeDatabase = [
  // Your recipe data here...
];

/**
 * Execute function for recipe lookup
 * This will be attached to the tool definition but not sent to OpenAI
 */
async function executeRecipeLookup(params: any) {
  // Tool implementation logic...
  return {
    results: [],
    // Other response properties...
  };
}

// Register the recipe lookup tool
registerTool({
  type: "function",
  function: {
    name: "lookupRecipe",
    description: "Look up a recipe by name or ingredients",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Recipe name or a comma-separated list of ingredients"
        },
        filterByDifficulty: {
          type: ["string", "null"],
          description: "Filter recipes by difficulty level",
          enum: ["easy", "medium", "hard"]
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  execute: executeRecipeLookup
});
```

### 5. Update your OpenAI Client Configuration

Modify your chat API to include tools and handle tool calls:

```typescript
// app/api/chat+api.ts
import { OpenAI } from 'openai';
import { getToolDefinitions, getTool } from '../../tools';
import { ToolCall, ToolResult } from '../../tools/types';
// Import the tool registration file to ensure all tools are registered
import '../../tools/register';

// Prepare tools for OpenAI by removing the execute function
function prepareToolsForOpenAI(tools: any[]) {
  return tools.map(tool => {
    // Create a copy of the tool without the execute function
    const { execute, ...toolWithoutExecute } = tool;
    return toolWithoutExecute;
  });
}

// In your API handler
const tools = prepareToolsForOpenAI(getToolDefinitions());

// Call OpenAI API with tools
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages,
  tools, // Include the tools
  tool_choice: "auto", // Let the model decide when to use tools
});
```

## Adding New Tools

To add a new tool to your system:

1. Create a new file in the `tools/tools/` directory
2. Import the `registerTool` function from the tools registry
3. Define and register your tool using the `registerTool` function
4. Add your tool file to the imports in `tools/register.ts`

Example of a new tool:

```typescript
// tools/tools/myNewTool.ts
import { registerTool } from '../index';

// Define your execute function
async function executeMyNewTool(params: any) {
  // Implement your tool logic here
  const { param1, param2 } = params;
  
  // Your implementation code
  
  return {
    // Return the result
    result: "Some result",
    additionalInfo: "Any additional information"
  };
}

// Register the tool
registerTool({
  type: "function",
  function: {
    name: "myNewTool",
    description: "Description of what your tool does",
    parameters: {
      type: "object",
      properties: {
        // Define your tool parameters
        param1: {
          type: "string",
          description: "Description of parameter 1"
        },
        param2: {
          type: ["number", "null"],
          description: "Description of parameter 2"
        }
      },
      required: ["param1"],
      additionalProperties: false
    }
  },
  execute: executeMyNewTool
});
```

Then add it to the register file:

```typescript
// tools/register.ts
import './tools/recipeLookup';
import './tools/nutritionInfo';
import './tools/myNewTool'; // Add your new tool here
```

## Function Calling Schema Format

OpenAI's function calling feature requires tools to be defined in a specific format:

1. **Top-level fields**:
   - `type`: Must be "function"
   - `function`: Object containing the function details:
     - `name`: Name of the function (e.g., "get_weather")
     - `description`: Details on when and how to use the function
     - `parameters`: JSON Schema object defining the function's arguments

2. **Parameters object**:
   - `type`: Always "object"
   - `properties`: Object containing parameter definitions
   - `required`: Array of required parameter names
   - `additionalProperties`: Should be set to false for strict mode

3. **Parameter properties**:
   - Each parameter needs a `type` ("string", "number", "boolean", etc.) or array of types (for union types)
   - Each parameter needs a `description`
   - Optional parameters can be represented using `["string", "null"]` type

4. **Example of a correctly formatted tool**:
   ```json
   {
     "type": "function",
     "function": {
       "name": "get_weather",
       "description": "Get current temperature for a given location",
       "parameters": {
         "type": "object",
         "properties": {
           "location": {
             "type": "string",
             "description": "City and country e.g. Paris, France"
           },
           "unit": {
             "type": ["string", "null"],
             "description": "Temperature unit",
             "enum": ["celsius", "fahrenheit"]
           }
         },
         "required": ["location"],
         "additionalProperties": false
       }
     }
   }
   ```

## Important Implementation Notes

### Separating Tool Definition from Execution

In our implementation:

1. Tool definitions follow OpenAI's schema exactly
2. We add an `execute` function to each tool definition for internal use
3. Before sending tools to OpenAI, we strip the `execute` function

This approach:
- Keeps tool definitions aligned with OpenAI's expected format
- Avoids sending unnecessary data to the API
- Simplifies tool registration and management

### Avoiding Circular Dependencies

The tool system is designed to avoid circular dependencies by:

1. Keeping the tool registry separate from tool implementations
2. Using a dedicated registration file to import all tools
3. Importing this registration file in your application code

This pattern ensures that:
- The tool registry is initialized before any tools are registered
- Tool implementations can import the registry without causing circular issues
- Your application code only needs to import the registration file to have access to all tools

### Tool Execution Flow

When the LLM wants to use a tool:

1. The LLM includes a `tool_calls` array in its response
2. Your code extracts these tool calls and executes them
3. The results are added to the conversation as tool response messages
4. The conversation is sent back to the LLM to generate a final response

### Error Handling

The tool system includes robust error handling:

- Invalid tool parameters are caught and reported
- Non-existent tools are detected
- Tool execution errors are captured and returned to the LLM
- All errors are properly logged for debugging

## Best Practices for Tool Design

1. **Clear Descriptions**: Provide detailed descriptions of what each tool does
2. **Specific Parameters**: Define parameter types and descriptions clearly
3. **Thorough Validation**: Validate parameters before execution
4. **Error Handling**: Return informative error messages
5. **Asynchronous Design**: All tool execution should be async for scalability
6. **Timeouts**: Implement timeouts for tools that call external APIs
7. **Logging**: Log tool usage for debugging and analytics

## Example Tool Categories

1. **Recipe Tools**:
   - Recipe lookup
   - Ingredient substitution
   - Meal planning

2. **Cooking Tools**:
   - Conversion calculators
   - Cooking time estimator
   - Temperature guidelines

3. **Nutrition Tools**:
   - Nutrition information
   - Calorie calculation
   - Dietary restriction checking

4. **User-specific Tools**:
   - Save favorite recipes
   - User preference tracking
   - Personalized recommendations

## Implementation Tips

1. **Modular Design**: Keep each tool in its own file for maintainability
2. **Testing**: Create unit tests for each tool function
3. **Documentation**: Document each tool thoroughly
4. **Rate Limiting**: Implement rate limiting for tools that use external APIs
5. **Caching**: Cache common tool results to improve performance

## Security Considerations

1. **Input Validation**: Always validate user inputs
2. **Sanitization**: Sanitize inputs to prevent injection attacks
3. **Authorization**: For user-specific tools, ensure proper authorization
4. **Rate Limiting**: Prevent abuse through rate limiting
5. **API Keys**: Keep external API keys secure in environment variables

## Next Steps

1. Implement core tools relevant to your application
2. Add tool-specific error handling
3. Create a testing framework for tools
4. Document the tool system for other developers
5. Implement user analytics to track tool usage and effectiveness