// Retired: do not silently turn a publicly registered Student into an Admin.
console.error('This legacy promotion command is disabled. Use the explicitly confirmed npm run seed:admin procedure in docs/ADMIN_SETUP.md with a separate administrator email.');
process.exitCode = 1;
