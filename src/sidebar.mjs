// The docs navigation. Slugs are paths under src/content/docs.
//
// Every group after Getting Started starts collapsed, and Starlight opens the
// group that holds the current page, so the whole navigation fits one screen:
// every group is visible and every page is one click away.

const page = (label, slug) => ({ label, slug: `docs/${slug}` });

export const sidebar = [
	{
		label: 'Getting Started',
		items: [
			page('Introduction', 'getting-started/introduction'),
			page('Installation', 'getting-started/installation'),
			page('Quickstart', 'getting-started/quickstart'),
			{
				label: 'Connecting your IDE',
				items: [
					page('VS Code', 'getting-started/vscode'),
					page('Cursor', 'getting-started/cursor'),
					page('Windsurf (now Devin)', 'getting-started/windsurf'),
				],
			},
		],
	},
	{
		label: 'Concepts',
		collapsed: true,
		items: [
			page('The five layers', 'concepts/five-layers'),
			page('Fix types', 'concepts/fix-types'),
			page('Independent verification', 'concepts/verification'),
			page('The bounded loop', 'concepts/bounded-loop'),
			page('The scoring gate', 'concepts/scoring-gate'),
			page('Security model', 'concepts/security'),
		],
	},
	{
		label: 'ProdPush',
		collapsed: true,
		items: [
			page('1. Pre-flight checks', 'prodpush/preflight'),
			page('2. Environment sealing', 'prodpush/sealing'),
			page('3. Docker build test', 'prodpush/docker-build'),
			page('4. Git push', 'prodpush/git-push'),
			page('5. Render deployment', 'prodpush/render-deploy'),
			page('6. Deploy monitoring', 'prodpush/monitoring'),
			page('7. Post-deploy smoke test', 'prodpush/smoke-test'),
			page('8. CI/CD wiring', 'prodpush/cicd'),
			page('Provider interface', 'prodpush/provider'),
		],
	},
	{
		label: 'Reference',
		collapsed: true,
		items: [
			page('CLI commands', 'reference/cli'),
			page('MCP tools', 'reference/mcp-tools'),
			page('Rule catalog', 'reference/rules'),
			page('Configuration files', 'reference/configuration'),
			page('Score bands and gate policy', 'reference/score-bands'),
		],
	},
	{
		label: 'Results',
		collapsed: true,
		items: [
			page('Evaluation', 'results/evaluation'),
			page('Metrics', 'results/metrics'),
			page('Compatibility matrix', 'results/compatibility'),
		],
	},
	{
		label: 'Help',
		collapsed: true,
		items: [
			page('Troubleshooting', 'help/troubleshooting'),
			page('FAQ', 'help/faq'),
			page('Known limitations', 'help/limitations'),
			page('Contributing', 'help/contributing'),
			page('Changelog', 'help/changelog'),
		],
	},
];
