import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const name = 'npmt-suggestions';

export const description =
  '通过英文关键字查询最相关的 npm 包，返回 npm 包的名称、版本、描述、关键字等信息。';

export const paramsSchema = {
  keyword: z
    .string()
    .min(1, 'Keyword is required')
    .describe('Keyword to search for npm package'),
};

const suggestionItem = z.object({
  package: z.object({
    name: z.string().describe('Name of the package'),
    scope: z.string().optional().describe('Scope of the package'),
    version: z.string().describe('Version of the package'),
    description: z.string().describe('Description of the package'),
    keywords: z.array(z.string()).describe('Keywords of the package'),
  }),
  searchScore: z.number().describe('Search score of the package'),
  score: z.object({
    final: z.number().describe('Final score of the package'),
    detail: z.object({
      maintenance: z.number().describe('Maintenance score'),
      popularity: z.number().describe('Popularity score'),
      quality: z.number().describe('Quality score'),
    }),
  }),
});

export const handler: ToolCallback<typeof paramsSchema> = async (
  args,
  extra
) => {
  try {
    const result = await fetch(
      `https://api.npms.io/v2/search/suggestions?q=${args.keyword}`,
      {
        signal: extra.signal,
      }
    ).then((res) => res.json());

    const parsedResult = result.map((item: any) => ({
      package: {
        name: item.package.name,
        scope: item.package.scope,
        version: item.package.version,
        description: item.package.description,
        keywords: item.package.keywords,
      },
      searchScore: item.searchScore,
      score: {
        final: item.score.final,
        detail: {
          maintenance: item.score.detail.maintenance,
          popularity: item.score.detail.popularity,
          quality: item.score.detail.quality,
        },
      },
    }));

    const contentInfo = `According to the query text ${
      args.keyword
    }, we recommend the following npm packages.
I will provide it to you through the array. The structure of each item in the array is:
${JSON.stringify(zodToJsonSchema(suggestionItem))}

Result:
${JSON.stringify(parsedResult)}
`;

    return {
      content: [
        {
          type: 'text',
          text: contentInfo,
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
