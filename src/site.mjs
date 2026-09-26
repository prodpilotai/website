// Facts about the project that more than one page links to. Each one is checked
// against its source; see the comment beside it.

// The deployed address, the Cloudflare Worker's own. Link previews, canonical
// links and the sitemap are built from it. PRODPILOT_SITE_URL overrides it, for
// example once a custom domain is attached.
export const siteUrl = process.env.PRODPILOT_SITE_URL ?? 'https://website.prodpilot-ai.workers.dev';

// PyPI project page and name, from https://pypi.org/pypi/prodpilot/json.
export const pypi = 'https://pypi.org/project/prodpilot/';
export const install = 'pip install prodpilot';

// The package repository and its issue tracker. Discussions is not enabled on
// that repository, so nothing here links to it.
export const repo = 'https://github.com/prodpilotai/ProdPilot';
export const issues = `${repo}/issues`;
export const securityReport = `${repo}/security`;
export const license = `${repo}/blob/main/LICENSE`;

// The project's own contact address, and the reasons a visitor might write.
export const email = 'prodpilot.ai@gmail.com';
export const topics = [
	{ label: 'Ask a question', subject: 'Question about ProdPilot' },
	{ label: 'Share feedback', subject: 'Feedback on ProdPilot' },
	{ label: 'Work with us', subject: 'Working together on ProdPilot' },
];
export const mailto = (subject) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

// A small Express API deployed by ProdPilot, answering with its own description.
export const demo = 'https://prodpilot-demo.onrender.com/';

// The team, each with the profile they chose.
export const team = [
	{ name: 'Muhammad Sudais Khalid', url: 'https://sudaiskhalid.com/' },
	{ name: 'Muhammad Farooq Khan', url: 'https://farooqhoti.com/' },
	{ name: 'Muhammad Talha Khan', url: 'https://github.com/muhammadtalhakhanhoti' },
];
