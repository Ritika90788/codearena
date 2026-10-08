import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FeatureProject from '../models/FeatureProject.js';

dotenv.config();

export const seedFeatureProjectsData = [
  {
    title: 'Build a Production-Ready URL Shortener Service',
    slug: 'build-url-shortener-service',
    category: 'Microservices & APIs',
    difficulty: 'Medium',
    estimatedMinutes: 45,
    featureScenario:
      'Marketing campaigns and mobile SMS alerts need concise, branded link redirects. You are assigned to design the core URL shortening and resolution service for an enterprise SaaS marketing platform.',
    endpoints: [
      {
        method: 'POST',
        path: '/shorten',
        description: 'Generates a unique 6-character shortcode for a valid HTTP/HTTPS URL',
        requestBody: '{"url": "https://example.com/long/path"}',
        responseFormat: '{"status": 201, "shortCode": "aB3x9Z", "url": "..."}',
        statusCodes: [201, 200, 400],
      },
      {
        method: 'GET',
        path: '/:shortCode',
        description: 'Resolves a shortcode to the original destination URL for 302 redirection',
        requestBody: 'None',
        responseFormat: '{"status": 302, "url": "https://example.com/long/path"}',
        statusCodes: [302, 404],
      },
    ],
    functionalRequirements: [
      'Generate a unique alphanumeric short code (6 characters) for each new URL.',
      'Validate input URL: must begin with http:// or https://, and contain a valid domain. Invalid URLs return status 400.',
      'Idempotency: If an identical URL is shortened again, return the existing short code with status 200.',
      'Lookup resolution: Resolving an existing shortCode returns status 302 with the original URL.',
      'Missing code: Resolving a non-existent shortCode returns status 404.',
    ],
    nonFunctionalRequirements: [
      'O(1) average-time lookups using in-memory hash maps or dictionaries.',
      'Collision avoidance on generated hashes.',
      'Defensive sanitization of whitespace and trailing slashes.',
    ],
    evaluationRubric: [
      { criterion: 'Functional Correctness', weight: 35, description: 'Shortening, resolving, and collision handling' },
      { criterion: 'API Behavior & Status Codes', weight: 25, description: 'Correct 201, 200, 302, 400, 404 response semantics' },
      { criterion: 'Edge Cases & URL Validation', weight: 20, description: 'Rejects mailto:, javascript:, ftp:, and malformed strings' },
      { criterion: 'Error Handling & Code Quality', weight: 20, description: 'Clean architecture, deterministic testability, defensive validation' },
    ],
    starterCode: {
      javascript: `/**
 * BUILD A URL SHORTENER SERVICE
 *
 * Requirements:
 * 1. shorten(url):
 *    - Validate URL (must start with http:// or https://)
 *    - If invalid, return { status: 400, error: 'Invalid URL' }
 *    - If URL already shortened, return { status: 200, shortCode: existingCode, url }
 *    - If new, generate unique 6-character alphanumeric code
 *    - Return { status: 201, shortCode, url }
 *
 * 2. resolve(shortCode):
 *    - If found, return { status: 302, url: originalUrl }
 *    - If not found, return { status: 404, error: 'Not Found' }
 *
 * 3. execute(request):
 *    - Unified API dispatcher supporting { action: 'shorten', url } and { action: 'resolve', shortCode }
 */

class UrlShortenerService {
  constructor() {
    this.urlToCode = new Map();
    this.codeToUrl = new Map();
  }

  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return /^https?:\\/\\/[\\w.-]+(\\.[a-zA-Z]{2,})/.test(url.trim());
  }

  generateCode(url) {
    // Generate 6-char code
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  shorten(url) {
    // TODO: Implement shortening with validation and deduplication
    return { status: 400, error: 'Not implemented' };
  }

  resolve(shortCode) {
    // TODO: Implement lookup resolution
    return { status: 404, error: 'Not implemented' };
  }
}

// Global dispatcher function for the test harness
function runUrlShortener(operations) {
  const service = new UrlShortenerService();
  const results = [];

  for (const op of operations) {
    if (op.action === 'shorten') {
      results.push(service.shorten(op.url));
    } else if (op.action === 'resolve') {
      results.push(service.resolve(op.shortCode));
    }
  }

  return results;
}
`,
    },
    solutionCode: {
      javascript: `class UrlShortenerService {
  constructor() {
    this.urlToCode = new Map();
    this.codeToUrl = new Map();
    this.counter = 100000;
  }

  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return /^https?:\\/\\/[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/.test(url.trim());
  }

  generateCode() {
    this.counter += 1;
    return this.counter.toString(36).padStart(6, '0');
  }

  shorten(rawUrl) {
    if (!rawUrl || !this.isValidUrl(rawUrl)) {
      return { status: 400, error: 'Invalid URL' };
    }
    const url = rawUrl.trim();

    if (this.urlToCode.has(url)) {
      return {
        status: 200,
        shortCode: this.urlToCode.get(url),
        url,
      };
    }

    const shortCode = this.generateCode();
    this.urlToCode.set(url, shortCode);
    this.codeToUrl.set(shortCode, url);

    return {
      status: 201,
      shortCode,
      url,
    };
  }

  resolve(shortCode) {
    if (!shortCode || !this.codeToUrl.has(shortCode)) {
      return { status: 404, error: 'Not Found' };
    }

    return {
      status: 302,
      url: this.codeToUrl.get(shortCode),
    };
  }
}

function runUrlShortener(operations) {
  const service = new UrlShortenerService();
  const results = [];

  for (const op of operations) {
    if (op.action === 'shorten') {
      const res = service.shorten(op.url);
      if (res.status === 400) {
        results.push({ status: 400, error: res.error });
      } else {
        results.push({ status: res.status, url: res.url, hasCode: !!res.shortCode });
      }
    } else if (op.action === 'resolve') {
      results.push(service.resolve(op.shortCode));
    }
  }

  return results;
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { action: 'shorten', url: 'https://google.com/search' },
          { action: 'shorten', url: 'https://google.com/search' },
          { action: 'shorten', url: 'invalid-url-without-protocol' },
        ])}`,
        expectedOutput: `${JSON.stringify([
          { status: 201, url: 'https://google.com/search', hasCode: true },
          { status: 200, url: 'https://google.com/search', hasCode: true },
          { status: 400, error: 'Invalid URL' },
        ])}`,
        isHidden: false,
        explanation: 'Validates 201 for new URL, 200 for duplicate, 400 for invalid URL',
      },
      {
        input: `${JSON.stringify([
          { action: 'resolve', shortCode: 'unknown999' },
        ])}`,
        expectedOutput: `${JSON.stringify([
          { status: 404, error: 'Not Found' },
        ])}`,
        isHidden: false,
        explanation: 'Resolving non-existent shortcode returns 404 Not Found',
      },
    ],
  },
  {
    title: 'Build a Sliding Window API Rate Limiter',
    slug: 'build-sliding-window-rate-limiter',
    category: 'System Infrastructure',
    difficulty: 'Hard',
    estimatedMinutes: 50,
    featureScenario:
      'To defend public API endpoints against denial-of-service (DoS) attacks and credential stuffing, you need to build a high-performance in-memory sliding-window log rate limiter with sub-millisecond evaluation latency.',
    endpoints: [
      {
        method: 'POST',
        path: '/middleware/rate-limit',
        description: 'Evaluates whether a client IP or API key may execute a request',
        requestBody: '{"clientId": "api_key_123", "timestamp": 1000}',
        responseFormat: '{"allowed": true, "remaining": 4, "retryAfterMs": 0}',
        statusCodes: [200, 429],
      },
    ],
    functionalRequirements: [
      'Implement `allowRequest(clientId, maxRequests, windowMs, timestamp)`',
      'Track timestamps of successful requests within the sliding window `[timestamp - windowMs + 1, timestamp]`.',
      'If requests in window < maxRequests, allow request, record timestamp, and return `{ allowed: true, remaining: count, retryAfterMs: 0 }`.',
      'If threshold reached, block request and return `{ allowed: false, remaining: 0, retryAfterMs: msUntilFirstEviction }`.',
    ],
    nonFunctionalRequirements: [
      'Prune expired timestamps from storage to avoid unbounded memory leaks.',
      'Support multi-tenant isolation across independent client IDs.',
    ],
    evaluationRubric: [
      { criterion: 'Sliding Window Precision', weight: 40, description: 'Accurate window boundary calculation' },
      { criterion: 'Memory Cleanup & Eviction', weight: 30, description: 'Prunes expired timestamps' },
      { criterion: 'Retry-After Accuracy', weight: 30, description: 'Calculates exact wait time until window clears' },
    ],
    starterCode: {
      javascript: `/**
 * BUILD A SLIDING WINDOW RATE LIMITER
 *
 * @param {Array<{clientId: string, maxRequests: number, windowMs: number, timestamp: number}>} requests
 * @return {Array<{allowed: boolean, remaining: number, retryAfterMs: number}>}
 */
function runRateLimiter(requests) {
  // TODO: Implement sliding window log rate limiter
  return [];
}
`,
    },
    solutionCode: {
      javascript: `function runRateLimiter(requests) {
  const clientLogs = new Map(); // clientId -> array of timestamps
  const results = [];

  for (const req of requests) {
    const { clientId, maxRequests, windowMs, timestamp } = req;
    if (!clientLogs.has(clientId)) {
      clientLogs.set(clientId, []);
    }

    const logs = clientLogs.get(clientId);
    const windowStart = timestamp - windowMs;

    // Prune timestamps older than window
    while (logs.length > 0 && logs[0] <= windowStart) {
      logs.shift();
    }

    if (logs.length < maxRequests) {
      logs.push(timestamp);
      results.push({
        allowed: true,
        remaining: maxRequests - logs.length,
        retryAfterMs: 0,
      });
    } else {
      const oldestInWindow = logs[0];
      const retryAfterMs = oldestInWindow + windowMs - timestamp;
      results.push({
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(1, retryAfterMs),
      });
    }
  }

  return results;
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { clientId: 'user_1', maxRequests: 2, windowMs: 1000, timestamp: 100 },
          { clientId: 'user_1', maxRequests: 2, windowMs: 1000, timestamp: 200 },
          { clientId: 'user_1', maxRequests: 2, windowMs: 1000, timestamp: 300 },
          { clientId: 'user_1', maxRequests: 2, windowMs: 1000, timestamp: 1200 },
        ])}`,
        expectedOutput: `${JSON.stringify([
          { allowed: true, remaining: 1, retryAfterMs: 0 },
          { allowed: true, remaining: 0, retryAfterMs: 0 },
          { allowed: false, remaining: 0, retryAfterMs: 800 },
          { allowed: true, remaining: 1, retryAfterMs: 0 },
        ])}`,
        isHidden: false,
        explanation: '3rd request at t=300 is blocked (exceeds 2/window). 4th at t=1200 is allowed because t=100 expired.',
      },
    ],
  },
  {
    title: 'Build an E-commerce Cart Checkout & Promotion Engine',
    slug: 'build-ecommerce-cart-promotion-engine',
    category: 'E-commerce & Payments',
    difficulty: 'Medium',
    estimatedMinutes: 40,
    featureScenario:
      'Online retailers frequently suffer cart abandonment due to confusing discount stacking and incorrect currency rounding. You must build an e-commerce cart engine that manages items, coupon discounts, and tax computation.',
    endpoints: [
      {
        method: 'POST',
        path: '/cart/checkout',
        description: 'Processes cart items, applies promo coupon codes, and outputs itemized receipt',
        requestBody: '{"items": [...], "coupon": "SAVE20", "taxRate": 0.08}',
        responseFormat: '{"subtotal": 100, "discount": 20, "tax": 6.4, "total": 86.4}',
        statusCodes: [200, 400],
      },
    ],
    functionalRequirements: [
      'Calculate subtotal = sum of (item.price * item.quantity).',
      'Validate coupons: "PERCENT_{N}" deducts N% off subtotal. "FIXED_{N}" deducts $N off subtotal. Invalid coupons return 400 error.',
      'Max discount cannot exceed subtotal (total cannot be negative).',
      'Tax is applied on the discounted subtotal: `tax = (subtotal - discount) * taxRate`.',
      'Return `{ status: 200, subtotal, discount, tax, total }` with all amounts rounded to 2 decimal places.',
    ],
    nonFunctionalRequirements: [
      'Prevent floating-point precision errors (e.g. 0.1 + 0.2 !== 0.3).',
      'Handle zero-quantity items and empty carts gracefully.',
    ],
    evaluationRubric: [
      { criterion: 'Financial Calculations', weight: 40, description: 'Subtotal, discount, tax, and total formulas' },
      { criterion: 'Coupon Parsing & Bounds', weight: 30, description: 'Percentage, fixed, and invalid code handling' },
      { criterion: 'Precision & Rounding', weight: 30, description: 'Sub-cent rounding accuracy without floating point drift' },
    ],
    starterCode: {
      javascript: `/**
 * BUILD AN E-COMMERCE CART ENGINE
 *
 * @param {Array<{price: number, quantity: number}>} items
 * @param {string|null} coupon
 * @param {number} taxRate
 * @return {{status: number, subtotal?: number, discount?: number, tax?: number, total?: number, error?: string}}
 */
function checkoutCart(items, coupon, taxRate) {
  // TODO: Calculate itemized cart total
  return { status: 400, error: 'Not implemented' };
}
`,
    },
    solutionCode: {
      javascript: `function checkoutCart(items, coupon, taxRate) {
  if (!Array.isArray(items) || items.length === 0) {
    return { status: 400, error: 'Cart is empty' };
  }

  let subtotal = 0;
  for (const item of items) {
    if (item.price < 0 || item.quantity <= 0) {
      return { status: 400, error: 'Invalid item attributes' };
    }
    subtotal += item.price * item.quantity;
  }

  let discount = 0;
  if (coupon) {
    if (coupon.startsWith('PERCENT_')) {
      const pct = parseFloat(coupon.replace('PERCENT_', ''));
      if (isNaN(pct) || pct < 0 || pct > 100) return { status: 400, error: 'Invalid coupon' };
      discount = (subtotal * pct) / 100;
    } else if (coupon.startsWith('FIXED_')) {
      const fixed = parseFloat(coupon.replace('FIXED_', ''));
      if (isNaN(fixed) || fixed < 0) return { status: 400, error: 'Invalid coupon' };
      discount = fixed;
    } else {
      return { status: 400, error: 'Invalid coupon' };
    }
  }

  discount = Math.min(subtotal, discount);
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * (taxRate || 0);
  const total = discountedSubtotal + tax;

  const round = (num) => Math.round(num * 100) / 100;

  return {
    status: 200,
    subtotal: round(subtotal),
    discount: round(discount),
    tax: round(tax),
    total: round(total),
  };
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { price: 50, quantity: 2 },
          { price: 20, quantity: 1 },
        ])}\n"PERCENT_20"\n0.1`,
        expectedOutput: `${JSON.stringify({
          status: 200,
          subtotal: 120,
          discount: 24,
          tax: 9.6,
          total: 105.6,
        })}`,
        isHidden: false,
        explanation: 'Subtotal $120. 20% discount = $24. Taxable = $96. 10% tax = $9.60. Total = $105.60.',
      },
      {
        input: `${JSON.stringify([])}\nnull\n0.05`,
        expectedOutput: `${JSON.stringify({
          status: 400,
          error: 'Cart is empty',
        })}`,
        isHidden: false,
        explanation: 'Empty cart returns 400 error',
      },
    ],
  },
];

export const seedFeatureProjects = async () => {
  try {
    for (const item of seedFeatureProjectsData) {
      await FeatureProject.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${seedFeatureProjectsData.length} Feature Projects successfully.`);
  } catch (err) {
    console.error('❌ Error seeding feature projects:', err.message);
  }
};
