/**
 * Type definitions for the tool system
 */

/**
 * Enum of available tool names
 * Add new tool names here as they're created
 */
export enum ToolName {
  RECIPE_LOOKUP = "lookupRecipe",
  NUTRITION_INFO = "getNutritionInfo"
}

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