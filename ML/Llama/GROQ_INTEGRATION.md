# Groq API Integration

This document explains the integration of Groq API for faster chat responses in the AgriGuru application.

## Overview

The chat endpoint now uses Groq's meta-llama/llama-4-scout-17b-16e-instruct model as the primary LLM for responding to user queries. This provides significantly faster response times compared to AWS Bedrock Claude models.

## Implementation Details

- The `/chat` endpoint first attempts to use the Groq API
- If the Groq API call fails for any reason, it automatically falls back to AWS Bedrock
- The response includes information about which model was used (groq or bedrock)

## Configuration

- Groq API Key: `GROQ_API_KEY`
- Model: `meta-llama/llama-4-scout-17b-16e-instruct`

## Dependencies

The implementation relies on the following packages, which are already included in requirements.txt:
- `groq`: The official Groq Python client
- `langchain_groq`: LangChain integration for Groq (optional, for future use)

## Response Format

The response now includes a "model" field that indicates which AI model was used:

```json
{
  "response": "AI-generated response text",
  "language": "English",
  "status": "success",
  "model": "groq:meta-llama/llama-4-scout-17b-16e-instruct"
}
```

Or, when falling back to AWS Bedrock:

```json
{
  "response": "AI-generated response text",
  "language": "English",
  "status": "success",
  "model": "bedrock:claude"
}
```

## Error Handling

If the Groq API call fails, the system automatically falls back to AWS Bedrock Claude. The system logs the Groq error but continues processing the request. This ensures users always get a response even if one of the AI providers has issues.

## Testing

To test the integration:
1. Run the Flask server: `python app.py`
2. Send a POST request to `/chat` with JSON body:
   ```json
   {
     "query": "Tell me about rice cultivation",
     "language": "en"
   }
   ```
3. Check the response speed and the "model" field to confirm it's using Groq

## Performance Comparison

Groq API typically responds 5-10x faster than AWS Bedrock for similar queries. The exact improvement depends on query complexity and server load.
