import { OpenAI } from "openai";
import { getToolDefinitions, getTool } from "../../tools";
import { ToolCall, ToolResult, ToolName } from "../../tools/types";
import "../../tools/register";

/**
 * OpenAI API key from environment variables
 */
const apiKey = process.env.OPENAI_API_KEY;

/**
 * Initialize OpenAI client
 */
const openai = new OpenAI({
  apiKey: apiKey,
});

/**
 * Error response utility function
 */
function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * Execute tool calls and return results
 */
async function executeToolCalls(toolCalls: any[]): Promise<ToolResult[]> {
  return Promise.all(
    toolCalls.map(async (toolCall) => {
      try {
        const toolName = toolCall.function.name;
        let params: any = {};

        try {
          // Parse the arguments JSON string
          params = JSON.parse(toolCall.function.arguments);
        } catch (e: any) {
          throw new Error(`Invalid tool arguments: ${e.message}`);
        }

        // Get the tool from registry
        const tool = getTool(toolName);
        if (!tool) {
          throw new Error(`Tool not found: ${toolName}`);
        }

        // Execute the tool function from the tool definition
        const result = await tool.execute?.(params);
        if (!result) {
          throw new Error(`No execute function found for tool: ${toolName}`);
        }

        return {
          id: toolCall.id,
          result,
        };
      } catch (error) {
        console.error(`Error executing tool:`, error);

        return {
          id: toolCall.id,
          result: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );
}

/**
 * Prepare tools for OpenAI by removing the execute function
 */
function prepareToolsForOpenAI(tools: any[]) {
  return tools.map((tool) => {
    const { execute, ...toolWithoutExecute } = tool;
    return toolWithoutExecute;
  });
}

/**
 * Handle POST requests to the chat API
 */
export async function POST(request: Request) {
  if (!apiKey) {
    return errorResponse("Server configuration error: Missing API key.", 500);
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse(
        "Invalid request body: messages array is required.",
        400
      );
    }

    const isValidFormat = messages.every(
      (msg: any) =>
        typeof msg.role === "string" &&
        (typeof msg.content === "string" ||
          (msg.role === "tool" && typeof msg.tool_call_id === "string"))
    );

    if (!isValidFormat) {
      return errorResponse("Invalid message format.", 400);
    }

    const tools = prepareToolsForOpenAI(
      getToolDefinitions([ToolName.RECIPE_LOOKUP, ToolName.NUTRITION_INFO])
    );

    // Call OpenAI API with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
    });

    // Extract the response
    const assistantMessage = completion.choices[0]?.message;

    // Check if the LLM wants to call tools
    if (
      assistantMessage?.tool_calls &&
      assistantMessage.tool_calls.length > 0
    ) {
      console.log(
        "Model is requesting tool calls:",
        assistantMessage.tool_calls
      );

      // Execute the tools
      const toolResults = await executeToolCalls(assistantMessage.tool_calls);
      console.log("Tool results:", toolResults);

      // Add tool results to messages and continue the conversation
      const updatedMessages = [
        ...messages,
        assistantMessage, // Add the assistant's response with tool calls
        ...toolResults.map((result) => ({
          role: "tool",
          tool_call_id: result.id,
          content: result.error
            ? JSON.stringify({ error: result.error })
            : JSON.stringify(result.result),
        })),
      ];

      // Get the final response with tool outputs integrated
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: updatedMessages,
        tools,
        tool_choice: "auto",
      });

      const finalAssistantMessage = finalCompletion.choices[0]?.message;

      if (!finalAssistantMessage) {
        return errorResponse("Failed to get final response from OpenAI.", 500);
      }

      return Response.json(finalAssistantMessage);
    }

    if (!assistantMessage || !assistantMessage.content) {
      console.error("OpenAI response missing content:", completion);
      return errorResponse("Failed to get response content from OpenAI.", 500);
    }

    // Send only the assistant's message back to the client
    return Response.json(assistantMessage);
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);

    // Avoid sending detailed internal errors to the client
    let errorMessage = "An error occurred while processing your request.";
    let statusCode = 500;

    // Check for specific OpenAI errors if needed
    if (error.response) {
      console.error("OpenAI API Error Status:", error.response.status);
      console.error("OpenAI API Error Data:", error.response.data);
    } else if (error.request) {
      console.error("OpenAI request error:", error.request);
      errorMessage = "Could not reach OpenAI service.";
    } else {
      console.error("Error setting up OpenAI request:", error.message);
    }

    return errorResponse(errorMessage, statusCode);
  }
}
