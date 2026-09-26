// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sidebar } from './src/sidebar.mjs';
import { siteUrl, repo } from './src/site.mjs';

export default defineConfig({
	site: siteUrl,
	trailingSlash: 'always',
	output: 'static',
	// Cloudflare answers these from public/_redirects with a 301; this page is
	// the fallback for any host that does not read that file.
	redirects: { '/docs': '/docs/getting-started/introduction/' },
	integrations: [
		starlight({
			title: 'ProdPilot',
			description:
				'Documentation for ProdPilot, the local MCP server that audits a Node.js with Express or React with Vite project, verifies every fix your editor agent makes, and deploys only what passes.',
			// The site title sits beside the mark, so the image needs no alt text.
			logo: { dark: './src/assets/mark-dark.svg', light: './src/assets/mark-light.svg', alt: '' },
			// Wrapped lines keep command output readable on a phone, and a block
			// that never scrolls sideways needs no keyboard stop of its own.
			expressiveCode: { defaultProps: { wrap: true } },
			favicon: '/favicon.svg',
			social: [{ icon: 'github', label: 'ProdPilot on GitHub', href: repo }],
			customCss: [
				'@fontsource-variable/newsreader/opsz.css',
				'@fontsource/b612-mono/400.css',
				'@fontsource/b612-mono/700.css',
				'@fontsource/ibm-plex-sans/400.css',
				'@fontsource/ibm-plex-sans/600.css',
				'./src/styles/tokens.css',
				'./src/styles/docs.css',
			],
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: new URL('/og/docs.png', siteUrl).href } },
				{ tag: 'meta', attrs: { property: 'og:image:secure_url', content: new URL('/og/docs.png', siteUrl).href } },
				{ tag: 'meta', attrs: { property: 'og:image:type', content: 'image/png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'ProdPilot documentation' } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: new URL('/og/docs.png', siteUrl).href } },
				{ tag: 'meta', attrs: { name: 'twitter:image:alt', content: 'ProdPilot documentation' } },
				{ tag: 'meta', attrs: { property: 'og:site_name', content: 'ProdPilot' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				// A wide table scrolls sideways, so it has to be reachable by
				// keyboard. Only tables that actually overflow get a tab stop.
				{
					tag: 'script',
					attrs: { type: 'module' },
					content: `const mark = (t) => {
	if (t.scrollWidth > t.clientWidth) t.setAttribute('tabindex', '0');
	else t.removeAttribute('tabindex');
};
const seen = new ResizeObserver((all) => all.forEach((e) => mark(e.target)));
document.querySelectorAll('.sl-markdown-content table').forEach((t) => seen.observe(t));
document.fonts.ready.then(() => document.querySelectorAll('.sl-markdown-content table').forEach(mark));`,
				},
			],
			sidebar,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			disable404Route: true,
			credits: false,
			lastUpdated: false,
		}),
	],
});
