import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import {
	fetchMovieByGenre,
	fetchMovieDetails,
	fetchMovieGenres,
	fetchMovieReviews,
	fetchNowPlayingMovies,
	fetchSimilarMovies,
	fetchUpcomingMovies,
} from './fetcher';

const WIDGET_URI = 'ui://movies-widget';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Dev Env',
			version: '1.0',
		});

		registerAppResource(server, 'Movies Widget', WIDGET_URI, { description: 'Movies Widget' }, async () => {
			const html = await env.ASSETS.fetch(new URL('http://hello/index.html'));
			return {
				contents: [
					{
						uri: WIDGET_URI,
						text: await html.text(),
						mimeType: RESOURCE_MIME_TYPE,
					},
				],
			};
		});

		registerAppTool(
			server,
			'get-upcoming-movies',
			{
				title: 'Get Upcoming Movies',
				description:
					'Use this when the user wants to see the movies that are going to be released soon or in the future. Do not use this for movies that are currently playing in theaters or available for streaming.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching upcoming movies...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async () => {
				const movies = await fetchUpcomingMovies('x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-now-playing-movies',
			{
				title: 'Get Now Playing Movies',
				description:
					'Use this when the user wants to see the movies that are playing right now. Do not use this for streaming movies or to check the availability of upcoming releases. Do not use this to find a specific movie.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching now playing movies...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async () => {
				const movies = await fetchNowPlayingMovies('x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-similar-movies',
			{
				title: 'Get Similar Movies',
				description:
					'Use this when the user wants to find similar movies to a specific movie. Requires a movie ID from a previous list. Do not use before identifying a specific movie.',
				inputSchema: {
					movieId: z
						.number()
						.positive()
						.describe(
							'The ID of the movie to find similar movies for. Obtained by calling other tools first like `get-upcoming-movies` or `get-now-playing-movies`.',
						),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching similar movies...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ movieId }) => {
				const movies = await fetchSimilarMovies(movieId, 'x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-movie-reviews',
			{
				title: 'Get Movie Reviews',
				description:
					'Use this when the user wants to find reviews about a specific movie. Requires a movie ID from a previous list. Do not use before identifying a specific movie.',
				inputSchema: {
					movieId: z
						.number()
						.positive()
						.describe(
							'The ID of the movie to find reviews for. Obtained by calling other tools first like `get-upcoming-movies` or `get-now-playing-movies`.',
						),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					'openai/toolInvocation/invoking': 'Fetching reviews...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ movieId }) => {
				const movies = await fetchMovieReviews(movieId, 'x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-movie-genres',
			{
				title: 'Get Movie Genres',
				description:
					'Use this to get the list of genres ID. This should be used before calling the `get-movies-by-genre` tool. Do not use this to search for movies directly.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					'openai/toolInvocation/invoking': 'Fetching genres...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async () => {
				const genres = await fetchMovieGenres('x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { genres },
				};
			},
		);

		registerAppTool(
			server,
			'get-movies-by-genre',
			{
				title: 'Get Movies by Genre',
				description:
					'Use this when the user wants to find movies by a specific genre. Use `get-movie-genres` first to get the list of genre IDs first.',
				inputSchema: {
					genreId: z
						.number()
						.positive()
						.describe(
							'The ID of the genre to find movies for. Obtained by calling `get-movie-genres` tool. (example: 28 for Action, 99 for documentary)',
						),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching movies...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ genreId }) => {
				const movies = await fetchMovieByGenre(genreId, 'x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-movie-details',
			{
				title: 'Get Movie Details',
				description:
					'Use this when the user wants to see more details about a specific movie. Details like synopsis, cast, and production companies are available here. Requires a movie ID from a previous list. Do not use this tool before identifying the movie.',
				inputSchema: {
					movieId: z.number().positive().describe('The ID of the movie to find details for. Obtained by any of the list movie tools'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching movie details...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ movieId }) => {
				const movie = await fetchMovieDetails(movieId, 'x');
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movie },
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
