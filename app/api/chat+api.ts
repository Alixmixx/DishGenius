import { OpenAI } from 'openai';

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
 * Handle POST requests to the chat API
 */
export async function POST(request: Request) {
  if (!apiKey) {
    return errorResponse('Server configuration error: Missing API key.', 500);
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse('Invalid request body: messages array is required.', 400);
    }

    // Basic validation of message structure
    const isValidFormat = messages.every(
      (msg: any) => typeof msg.role === 'string' && typeof msg.content === 'string'
    );
    
    if (!isValidFormat) {
      return errorResponse('Invalid message format.', 400);
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    // Extract the response
    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage || !assistantMessage.content) {
      console.error("OpenAI response missing content:", completion);
      return errorResponse('Failed to get response content from OpenAI.', 500);
    }

    // Send only the assistant's message back to the client
    return Response.json(assistantMessage);

  } catch (error: any) {
    console.error('Error calling OpenAI:', error);
    
    // Avoid sending detailed internal errors to the client
    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;

    // Check for specific OpenAI errors if needed
    if (error.response) {
      console.error('OpenAI API Error Status:', error.response.status);
      console.error('OpenAI API Error Data:', error.response.data);
    } else if (error.request) {
      console.error('OpenAI request error:', error.request);
      errorMessage = 'Could not reach OpenAI service.';
    } else {
      console.error('Error setting up OpenAI request:', error.message);
    }

    return errorResponse(errorMessage, statusCode);
  }
}