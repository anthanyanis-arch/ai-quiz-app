require('dotenv').config();

const DEFAULT_URL = process.env.LOAD_TEST_URL || 'http://localhost:3000/api/quiz/status';
const TOTAL_REQUESTS = Number(process.env.LOAD_TEST_REQUESTS || process.argv[2] || 500);
const CONCURRENCY = Number(process.env.LOAD_TEST_CONCURRENCY || process.argv[3] || 50);

async function timedFetch(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { cache: 'no-store' });
    await res.arrayBuffer();
    return { ok: res.ok, status: res.status, ms: Date.now() - start };
  } catch (err) {
    return { ok: false, status: 'ERR', ms: Date.now() - start, error: err.message };
  }
}

function percentile(values, pct) {
  if (!values.length) return 0;
  const index = Math.ceil((pct / 100) * values.length) - 1;
  return values[Math.max(0, Math.min(index, values.length - 1))];
}

async function main() {
  const url = process.env.LOAD_TEST_URL || DEFAULT_URL;
  const results = [];
  let nextRequest = 0;

  console.log(`Load testing ${url}`);
  console.log(`Requests: ${TOTAL_REQUESTS}, concurrency: ${CONCURRENCY}`);

  async function worker() {
    while (nextRequest < TOTAL_REQUESTS) {
      nextRequest += 1;
      results.push(await timedFetch(url));
    }
  }

  const startedAt = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const totalMs = Date.now() - startedAt;

  const timings = results.map((r) => r.ms).sort((a, b) => a - b);
  const statusCounts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const okCount = results.filter((r) => r.ok).length;

  console.log('\nResults');
  console.log(`Success: ${okCount}/${results.length}`);
  console.log(`Duration: ${(totalMs / 1000).toFixed(2)}s`);
  console.log(`Throughput: ${(results.length / (totalMs / 1000)).toFixed(1)} req/s`);
  console.log(`Latency p50/p95/p99: ${percentile(timings, 50)}ms / ${percentile(timings, 95)}ms / ${percentile(timings, 99)}ms`);
  console.log(`Status counts: ${JSON.stringify(statusCounts)}`);

  const errors = results.filter((r) => r.error).slice(0, 3);
  if (errors.length) {
    console.log(`Sample errors: ${errors.map((e) => e.error).join(' | ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
