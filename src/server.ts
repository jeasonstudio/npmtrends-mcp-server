import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js'; // Import McpServer
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './config.js';
import { z } from 'zod';
import { registerTools } from './tools/index.js';

// import { registerEchoResource } from './resources/echoResource/index.js';
// import { registerEchoTool } from './tools/echoTool/index.js';

/**
 * Creates, configures, and connects the main MCP server instance.
 * This function initializes the server with configuration values, registers
 * available resources and tools, and establishes communication via stdio.
 *
 * @async
 * @function createMcpServer
 * @returns {Promise<McpServer>} A promise that resolves with the configured and connected McpServer instance.
 * @throws {Error} Throws an error if critical failures occur during registration or connection.
 */
export const createMcpServer = async (): Promise<McpServer> => {
  const operationContext = { operation: 'ServerInitialization' };
  console.info('Initializing MCP server...', operationContext);

  // Create the server instance using McpServer
  const server = new McpServer(
    {
      name: config.mcpServerName,
      version: config.mcpServerVersion,
    },
    {
      capabilities: {
        // Capabilities are defined dynamically via registration functions below
        resources: {},
        tools: {},
      },
    }
  );

  console.debug('McpServer instance created.', {
    ...operationContext,
    serverName: config.mcpServerName,
  });

  // Register resources and tools using their dedicated functions
  try {
    console.info('Registering resources and tools...', operationContext);
    // Pass the McpServer instance to the registration functions
    // await registerEchoResource(server);

    // Static resource
    server.resource('config', 'config://app', async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: 'App configuration here',
        },
      ],
    }));

    // Dynamic resource with parameters
    server.resource(
      'user-profile',
      new ResourceTemplate('users://{userId}/profile', { list: undefined }),
      async (uri, { userId }) => ({
        contents: [
          {
            uri: uri.href,
            text: `Profile data for user ${userId}: height 180cm, weight 75kg`,
          },
        ],
      })
    );

    // Simple tool with parameters
    // server.tool(
    //   'calculate-bmi',
    //   {
    //     weightKg: z.number(),
    //     heightM: z.number(),
    //   },
    //   async ({ weightKg, heightM }) => ({
    //     content: [
    //       {
    //         type: 'text',
    //         text: String(weightKg / (heightM * heightM)),
    //       },
    //     ],
    //   })
    // );

    registerTools(server);

    console.debug('Echo resource registered.', operationContext);
    // await registerEchoTool(server);
    console.debug('Echo tool registered.', operationContext);
    console.info(
      'Resources and tools registered successfully.',
      operationContext
    );
  } catch (registrationError) {
    // ErrorHandler within registration functions should handle specific logging/throwing
    // This catch block handles unexpected errors during the registration process itself
    console.error('Critical error during resource/tool registration process', {
      ...operationContext,
      error:
        registrationError instanceof Error
          ? registrationError.message
          : String(registrationError),
      stack:
        registrationError instanceof Error
          ? registrationError.stack
          : undefined,
    });
    // Rethrow to halt server startup if registration fails critically
    throw registrationError;
  }

  // Connect the server using Stdio transport
  try {
    console.info('Connecting server via Stdio transport...', operationContext);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.info(`${config.mcpServerName} connected successfully via stdio`, {
      ...operationContext,
      serverName: config.mcpServerName,
      version: config.mcpServerVersion,
    });
  } catch (connectionError) {
    // Handle connection errors specifically
    // ErrorHandler.handleError(connectionError, {
    //   operation: 'Server Connection',
    //   context: operationContext,
    //   critical: true,
    //   rethrow: true, // Rethrow to allow the main startup process (in index.ts) to handle exit
    // });

    // The line below won't be reached if rethrow is true, but needed for type safety if rethrow were false
    throw connectionError;
  }

  console.info('MCP server initialization complete.', operationContext);
  return server;
};
