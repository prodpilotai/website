// Figures on the landing page that do not come from the installed package.
// Each carries the docs page that states it and where that page takes it from.

export const facts = {
	// docs/evaluation.md in the ProdPilot repository, "The data".
	deployments: { total: 684, live: 129, source: '/docs/results/evaluation/#the-data' },

	// docs/compatibility.md, the compatibility matrix, recorded 14 September 2026.
	ides: { count: 3, source: '/docs/results/compatibility/' },

	// `python -m pytest --collect-only -q` at the v1.0.0 tag, commit 7b7693f, run
	// again on 27 September 2026: 1,799 collected. The Tests workflow run on that
	// commit, 35516692883, passed all 15 jobs: the suite on Linux, macOS and
	// Windows with Python 3.11 to 3.14, and the wheel check on all three.
	tests: { collected: 1799, source: '/docs/help/contributing/#tests' },
};
