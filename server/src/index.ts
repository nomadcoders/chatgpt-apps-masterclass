import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Dev Env',
			version: '1.0',
		});

		registerAppResource(server, 'Dev Widget', 'ui://dev-widget', { description: 'Dev widget' }, async () => {
			const html = await env.ASSETS.fetch(new URL('http://hello/index.html'));
			return {
				contents: [
					{
						uri: 'ui://dev-widget',
						text: await html.text(),
						mimeType: RESOURCE_MIME_TYPE,
					},
				],
			};
		});

		registerAppTool(
			server,
			'do-stuff',
			{
				description: 'stuff',
				inputSchema: {},
				_meta: {
					ui: {
						resourceUri: 'ui://dev-widget',
					},
				},
			},
			async () => {
				return {
					content: [{ text: 'stuff', type: 'text' }],
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
