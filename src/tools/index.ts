import { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp';
import { ZodRawShape } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  paramsSchema: ZodRawShape;
  handler: ToolCallback<any>;
}

import * as toolSuggestions from './suggestions.js';

export const registerTools = (server: McpServer) => {
  server.tool(
    toolSuggestions.name,
    toolSuggestions.description,
    toolSuggestions.paramsSchema,
    toolSuggestions.handler
  );
};
