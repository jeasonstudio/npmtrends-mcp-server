import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp';
import { z } from 'zod';

export const name = 'npmt-registry-info';

export const description =
  '根据 npm 包的名称，返回注册表中该包的详细信息，包括名称、版本、描述、关键字等。';

export const paramsSchema = {
  name: z
    .string()
    .min(1, 'Name is required')
    .describe('Name of the npm package'),
};

export const handler: ToolCallback<typeof paramsSchema> = async (
  args,
  extra
) => {
  try {
    const result = await fetch(
      `https://npm-trends-proxy.uidotdev.workers.dev/npm/registry/${args.name}`,
      {
        signal: extra.signal,
      }
    ).then((res) => res.json());

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error: ${JSON.stringify(error)}`,
        },
      ],
    };
  }
};
