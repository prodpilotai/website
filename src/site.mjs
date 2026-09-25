// Facts about the project that more than one page links to. Each one is checked
// against its source; see the comment beside it.

// The deployed address, the Cloudflare Worker's own. SITE_URL overrides it,
// for example once a custom domain is attached.
export const siteUrl = process.env.SITE_URL ?? 'https://website.prodpilot-ai.workers.dev';

// PyPI project page and name, from https://pypi.org/pypi/prodpilot/json.
export const pypi = 'https://pypi.org/project/prodpilot/';
export const install = 'pip install prodpilot';

// The package repository and its issue tracker. Discussions is not enabled on
// that repository, so nothing here links to it.
export const repo = 'https://github.com/prodpilotai/ProdPilot';
export const issues = `${repo}/issues`;
export const securityReport = `${repo}/security`;
export const license = `${repo}/blob/main/LICENSE`;

// The maintainer address the package lists on PyPI.
export const email = 'msudaiskhalid.ai@gmail.com';

// A small Express API deployed by ProdPilot, answering with its own description.
export const demo = 'https://prodpilot-demo.onrender.com/';

export const team = ['Muhammad Sudais Khalid', 'Muhammad Farooq Khan', 'Muhammad Talha Khan'];
