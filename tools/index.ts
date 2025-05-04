/**
 * Tool registry for managing available tools
 */
import { ToolDefinition, ToolName } from './types';

/**
 * Registry of all available tools
 */
const toolRegistry = new Map<string, ToolDefinition>();

/**
 * Register a new tool
 */
export function registerTool(tool: ToolDefinition) {
  toolRegistry.set(tool.function.name, tool);
  console.log(`Tool registered: ${tool.function.name}`);
}

/**
 * Get a tool by name
 */
export function getTool(name: string): ToolDefinition | undefined {
  return toolRegistry.get(name);
}

/**
 * Get all registered tools
 */
export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

/**
 * Get specific tools by their names
 * 
 * @param toolNames - Array of tool names to retrieve. If empty, returns all tools.
 * @returns Array of requested tool definitions
 */
export function getToolDefinitions(toolNames?: ToolName[]): ToolDefinition[] {
  // If no tool names provided, return all tools
  if (!toolNames || toolNames.length === 0) {
    return getAllTools();
  }
  
  // Filter tools by the provided names
  return toolNames
    .map(name => toolRegistry.get(name))
    .filter((tool): tool is ToolDefinition => tool !== undefined);
}