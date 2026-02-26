import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from 'zod';
import { createMcpHandler } from 'agents/mcp';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Stocks Server',
			version: '1.0',
		});

		server.registerTool(
			'get-stock-price',
			{
				description: 'Get the price of a stock given a ticker symbol.',
				inputSchema: {
					symbol: z.string(),
				},
				// { symbol: "AAPL" }
			},
			async ({ symbol }) => {
				return {
					content: [
						{
							type: 'text',
							text: `The price of ${symbol} is $10 USD.`,
						},
					],
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
