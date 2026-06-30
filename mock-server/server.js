#!/usr/bin/env node
/**
 * ProofPath Mock API Server
 * Wraps json-server to expose REST endpoints for sync testing.
 * Run: node mock-server/server.js
 * Endpoints: POST /api/beneficiaries, /api/camp_registrations, /api/evidence_items, /api/affidavits
 */
const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ logger: true });

// Mount under /api prefix
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Allow POST to /api/* and map to json-server collections
server.use('/api', router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🟢 ProofPath Mock API running at http://localhost:${PORT}`);
  console.log('   POST /api/beneficiaries');
  console.log('   POST /api/camp_registrations');
  console.log('   POST /api/evidence_items');
  console.log('   POST /api/affidavits\n');
});
