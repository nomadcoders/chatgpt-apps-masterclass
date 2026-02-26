export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response('Bye bye World!');
	},
} satisfies ExportedHandler<Env>;
