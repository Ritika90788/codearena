import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mission from '../models/Mission.js';

dotenv.config();

export const seedMissionsData = [
  {
    title: 'FinTech: Real-Time Payment Deduplication Engine',
    slug: 'fintech-payment-deduplication',
    domain: 'FinTech',
    companyName: 'ApexPay Global',
    difficulty: 'Hard',
    estimatedMinutes: 45,
    companyScenario:
      'ApexPay processes over 40,000 credit card payments per minute across distributed microservices. Network retries, mobile disconnects, and impatient users double-clicking "Pay Now" frequently trigger duplicate charge attempts. Charging a customer twice results in merchant chargeback fines, fraud alerts, and customer churn.',
    businessProblem:
      'In the last quarter, duplicate transactions caused $1.4M in temporary unauthorized authorizations and increased customer support ticket volume by 38%. The payments team needs an in-memory, deterministic idempotency and sliding-window deduplication filter.',
    technicalRequirements: [
      'Implement `detectDuplicateTransactions(transactions, timeWindowMs)`',
      'Two transactions are considered duplicates if they share identical `userId`, `merchantId`, and `amountInCents` within `timeWindowMs` milliseconds of each other.',
      'Must operate with sub-linear space and O(N) time complexity for sliding stream processing.',
      'Return an array of flagged duplicate transaction IDs preserving chronological order.',
    ],
    functionalRequirements: [
      'Gracefully handle empty transaction arrays or single transactions.',
      'Transactions are sorted in ascending order by `timestamp`.',
      'The original primary transaction is considered valid; only subsequent occurrences within the window must be flagged.',
    ],
    constraints: [
      'Time Complexity: O(N) where N is number of transactions',
      'Auxiliary Memory: O(N) bounded memory',
      'Time Window: 1 <= timeWindowMs <= 300,000 (up to 5 minutes)',
    ],
    expectedBehavior:
      'Input: Array of transactions and integer timeWindowMs. Output: Array of duplicate transaction IDs.',
    evaluationCriteria: [
      { name: 'Deduplication Correctness', weight: 40, description: 'Accurately isolates duplicates within dynamic time windows' },
      { name: 'Sliding Window Memory Efficiency', weight: 30, description: 'Does not retain expired transaction keys indefinitely' },
      { name: 'Edge Case Resilience', weight: 30, description: 'Handles simultaneous millisecond timestamps and rapid repeat clicks' },
    ],
    starterCode: {
      javascript: `/**
 * Detects duplicate payment transactions within a sliding time window.
 *
 * @param {Array<{id: string, userId: string, merchantId: string, amountInCents: number, timestamp: number}>} transactions
 * @param {number} timeWindowMs
 * @return {Array<string>} Array of flagged duplicate transaction IDs
 */
function detectDuplicateTransactions(transactions, timeWindowMs) {
  // TODO: Implement sliding window idempotency check
  const duplicates = [];

  return duplicates;
}
`,
    },
    solutionCode: {
      javascript: `function detectDuplicateTransactions(transactions, timeWindowMs) {
  const duplicates = [];
  const history = new Map();

  for (const tx of transactions) {
    const key = tx.userId + '_' + tx.merchantId + '_' + tx.amountInCents;
    const lastTimestamp = history.get(key);

    if (lastTimestamp !== undefined && (tx.timestamp - lastTimestamp) <= timeWindowMs) {
      duplicates.push(tx.id);
    } else {
      history.set(key, tx.timestamp);
    }
  }

  return duplicates;
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { id: 'tx_1', userId: 'user_A', merchantId: 'm_uber', amountInCents: 2500, timestamp: 1000 },
          { id: 'tx_2', userId: 'user_A', merchantId: 'm_uber', amountInCents: 2500, timestamp: 2500 },
          { id: 'tx_3', userId: 'user_B', merchantId: 'm_amazon', amountInCents: 9900, timestamp: 3000 },
        ])}\n2000`,
        expectedOutput: JSON.stringify(['tx_2']),
        isHidden: false,
        explanation: 'tx_2 is within 2000ms of tx_1 with same user, merchant, and amount',
      },
      {
        input: `${JSON.stringify([
          { id: 'tx_1', userId: 'user_A', merchantId: 'm_target', amountInCents: 1500, timestamp: 1000 },
          { id: 'tx_2', userId: 'user_A', merchantId: 'm_target', amountInCents: 1500, timestamp: 5000 },
        ])}\n2000`,
        expectedOutput: JSON.stringify([]),
        isHidden: false,
        explanation: 'tx_2 occurred 4000ms later, exceeding 2000ms window, so it is a valid distinct purchase',
      },
      {
        input: `${JSON.stringify([
          { id: 'tx_1', userId: 'u1', merchantId: 'm1', amountInCents: 500, timestamp: 100 },
          { id: 'tx_2', userId: 'u1', merchantId: 'm1', amountInCents: 500, timestamp: 150 },
          { id: 'tx_3', userId: 'u1', merchantId: 'm1', amountInCents: 500, timestamp: 200 },
        ])}\n100`,
        expectedOutput: JSON.stringify(['tx_2', 'tx_3']),
        isHidden: true,
        explanation: 'Rapid triple click duplicate prevention',
      },
    ],
  },
  {
    title: 'E-commerce: Sub-50ms Inverted Search Index at Scale',
    slug: 'ecommerce-product-search-index',
    domain: 'E-commerce',
    companyName: 'ShopSphere Retail',
    difficulty: 'Medium',
    estimatedMinutes: 40,
    companyScenario:
      'ShopSphere’s catalog exploded from 5,000 items to over 1.2 million active SKUs. The traditional SQL LIKE query search began triggering full-table sequential scans, driving search latency from 45ms to 3,200ms and crashing under Black Friday flash sales.',
    businessProblem:
      'Slow search results cause a 24% bounce rate. Marketing estimates that every 100ms of search delay costs $180,000 in lost weekly GMV. An in-memory inverted token index with price ranking is required.',
    technicalRequirements: [
      'Implement `searchCatalog(products, query, maxPrice, limit)`',
      'Tokenize product titles by alphanumeric words (case-insensitive).',
      'Filter results by `price <= maxPrice` and sort matching items descending by rating, then ascending by price.',
      'Return top `limit` product IDs.',
    ],
    functionalRequirements: [
      'Single-character words and punctuation must be sanitized.',
      'Query words must ALL match (AND query semantics).',
      'If no products match, return empty array `[]`.',
    ],
    constraints: [
      'Index Building: O(T) where T is total title tokens across all products',
      'Query Latency: Sub-millisecond lookup per token intersection',
      'Product IDs: Alphanumeric strings',
    ],
    expectedBehavior:
      'Input: Array of products, query string, maxPrice, and limit. Output: Array of matching product IDs.',
    evaluationCriteria: [
      { name: 'Token Intersection Correctness', weight: 40, description: 'Correct AND logic across search tokens' },
      { name: 'Price & Rating Sorting', weight: 35, description: 'Accurate secondary sort ordering' },
      { name: 'Sanitization & Tokenization', weight: 25, description: 'Handles punctuation, spaces, and case insensitivity' },
    ],
    starterCode: {
      javascript: `/**
 * @param {Array<{id: string, title: string, price: number, rating: number}>} products
 * @param {string} query
 * @param {number} maxPrice
 * @param {number} limit
 * @return {Array<string>} Top product IDs
 */
function searchCatalog(products, query, maxPrice, limit) {
  // TODO: Build inverted index and execute multi-token filtered search
  return [];
}
`,
    },
    solutionCode: {
      javascript: `function searchCatalog(products, query, maxPrice, limit) {
  const cleanTokens = (str) =>
    str.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ').split(/\\s+/).filter(Boolean);

  const queryTokens = cleanTokens(query);
  if (queryTokens.length === 0) return [];

  const matched = products.filter((item) => {
    if (item.price > maxPrice) return false;
    const itemTokens = new Set(cleanTokens(item.title));
    return queryTokens.every((qt) => itemTokens.has(qt));
  });

  matched.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.price - b.price;
  });

  return matched.slice(0, limit).map((p) => p.id);
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { id: 'p1', title: 'Wireless Noise Canceling Headphones', price: 199, rating: 4.8 },
          { id: 'p2', title: 'Bluetooth Wireless Earbuds', price: 79, rating: 4.6 },
          { id: 'p3', title: 'Wired Studio Headphones', price: 120, rating: 4.9 },
          { id: 'p4', title: 'Wireless Charging Pad', price: 29, rating: 4.5 },
        ])}\n"Wireless headphones"\n250\n5`,
        expectedOutput: JSON.stringify(['p1']),
        isHidden: false,
        explanation: 'Only p1 contains both "wireless" and "headphones" under $250',
      },
      {
        input: `${JSON.stringify([
          { id: 'p10', title: 'Mechanical Gaming Keyboard RGB', price: 99, rating: 4.7 },
          { id: 'p11', title: 'Quiet Office Keyboard', price: 35, rating: 4.2 },
          { id: 'p12', title: 'Pro Mechanical Keyboard', price: 89, rating: 4.7 },
        ])}\n"Keyboard"\n100\n2`,
        expectedOutput: JSON.stringify(['p12', 'p10']),
        isHidden: false,
        explanation: 'Both p10 and p12 have rating 4.7, but p12 has lower price ($89 < $99)',
      },
    ],
  },
  {
    title: 'Food Delivery: Peak Order Batching & Kitchen Router',
    slug: 'food-delivery-order-batching',
    domain: 'Food Delivery',
    companyName: 'DashBite Logistics',
    difficulty: 'Hard',
    estimatedMinutes: 50,
    companyScenario:
      'During Friday dinner rush (7:00 PM - 9:00 PM), DashBite experiences a surge of 8,000 orders every 10 minutes. Sending a separate courier to the same restaurant for every individual customer order creates courier congestion and drives customer delivery fees through the roof.',
    businessProblem:
      'Unbatched orders resulted in $82,000 in excess courier compensation last month and an average food delivery delay of 22 minutes. The dispatch system must batch orders originating from the same kitchen within a 5-minute prep window into groups of up to 3 orders.',
    technicalRequirements: [
      'Implement `batchOrders(orders, maxBatchSize, maxTimeGapMs)`',
      'Orders must share the exact same `restaurantId`.',
      'The time difference between the earliest and latest order in a single batch cannot exceed `maxTimeGapMs`.',
      'A batch cannot exceed `maxBatchSize` orders.',
      'Maximize order batch fill rate while prioritizing older orders first.',
    ],
    functionalRequirements: [
      'Orders must be sorted chronologically by `orderTime`.',
      'Return an array of batches, where each batch is an array of order IDs.',
    ],
    constraints: [
      'Orders count: 1 <= N <= 100,000',
      'Max batch size: typically 2 or 3',
      'Max time gap: 300,000 ms (5 mins)',
    ],
    expectedBehavior:
      'Input: Orders array, maxBatchSize, maxTimeGapMs. Output: Array of batch arrays.',
    evaluationCriteria: [
      { name: 'Batch Boundary Compliance', weight: 45, description: 'Never exceeds maxBatchSize or maxTimeGapMs' },
      { name: 'Chronological Stability', weight: 35, description: 'Prioritizes oldest waiting orders' },
      { name: 'Multi-Restaurant Separation', weight: 20, description: 'Never mixes orders from different kitchens' },
    ],
    starterCode: {
      javascript: `/**
 * @param {Array<{id: string, restaurantId: string, orderTime: number}>} orders
 * @param {number} maxBatchSize
 * @param {number} maxTimeGapMs
 * @return {Array<Array<string>>} Batches of order IDs
 */
function batchOrders(orders, maxBatchSize, maxTimeGapMs) {
  // TODO: Cluster orders by restaurant and sliding prep window
  return [];
}
`,
    },
    solutionCode: {
      javascript: `function batchOrders(orders, maxBatchSize, maxTimeGapMs) {
  const restaurantMap = new Map();

  for (const ord of orders) {
    if (!restaurantMap.has(ord.restaurantId)) {
      restaurantMap.set(ord.restaurantId, []);
    }
    restaurantMap.get(ord.restaurantId).push(ord);
  }

  const allBatches = [];

  for (const [restId, restOrders] of restaurantMap.entries()) {
    restOrders.sort((a, b) => a.orderTime - b.orderTime);

    let currentBatch = [];
    let batchStartTime = 0;

    for (const ord of restOrders) {
      if (currentBatch.length === 0) {
        currentBatch.push(ord.id);
        batchStartTime = ord.orderTime;
      } else {
        if (
          currentBatch.length < maxBatchSize &&
          ord.orderTime - batchStartTime <= maxTimeGapMs
        ) {
          currentBatch.push(ord.id);
        } else {
          allBatches.push(currentBatch);
          currentBatch = [ord.id];
          batchStartTime = ord.orderTime;
        }
      }
    }

    if (currentBatch.length > 0) {
      allBatches.push(currentBatch);
    }
  }

  return allBatches;
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { id: 'o1', restaurantId: 'r_pizza', orderTime: 1000 },
          { id: 'o2', restaurantId: 'r_pizza', orderTime: 2000 },
          { id: 'o3', restaurantId: 'r_pizza', orderTime: 3000 },
          { id: 'o4', restaurantId: 'r_pizza', orderTime: 4000 },
        ])}\n3\n5000`,
        expectedOutput: JSON.stringify([['o1', 'o2', 'o3'], ['o4']]),
        isHidden: false,
        explanation: 'Max batch size is 3, so first 3 group together and o4 starts new batch',
      },
      {
        input: `${JSON.stringify([
          { id: 'o1', restaurantId: 'r_burger', orderTime: 1000 },
          { id: 'o2', restaurantId: 'r_burger', orderTime: 10000 },
        ])}\n3\n4000`,
        expectedOutput: JSON.stringify([['o1'], ['o2']]),
        isHidden: false,
        explanation: 'Time gap is 9000ms > 4000ms, cannot batch together',
      },
    ],
  },
  {
    title: 'Social Media: Timeline Fan-Out & Affinity Feed Merger',
    slug: 'social-media-feed-merger',
    domain: 'Social Media',
    companyName: 'VibeNet Social',
    difficulty: 'Medium',
    estimatedMinutes: 40,
    companyScenario:
      'VibeNet’s feed engine displays a customized stream of posts from accounts a user follows. With 50M active users, running a multi-table SQL join with sorting at read-time crashes the database under heavy mobile app refresh spikes.',
    businessProblem:
      'Feed generation latency spikes directly correlated with a 15% reduction in daily active sessions. The platform needs an efficient K-way feed merger that combines pre-ranked friend activity feeds with an affinity score multiplier.',
    technicalRequirements: [
      'Implement `mergeUserFeeds(friendStreams, affinityScores, limit)`',
      'Each post has `{ id, authorId, timestamp, baseScore }`.',
      'The final ranking score for a post is `finalScore = baseScore * (affinityScores[authorId] || 1.0)`.',
      'Return the top `limit` post IDs sorted descending by `finalScore`. Tiebreak by newer `timestamp`.',
    ],
    functionalRequirements: [
      'Efficiently merge K sorted streams without copying or full-array redundant sorting.',
      'Gracefully handle authors not in the affinity score map (default to 1.0 multiplier).',
    ],
    constraints: [
      'Total posts across streams: Up to 500,000',
      'Limit: Typically 10 to 50 items for first screen display',
      'Time complexity should utilize sorting or Min/Max Heap.',
    ],
    expectedBehavior:
      'Input: Array of post streams, affinity map, limit. Output: Array of top post IDs.',
    evaluationCriteria: [
      { name: 'Affinity Score Calculation', weight: 40, description: 'Correct formula and fallback multipliers' },
      { name: 'Sorting & Tiebreaking', weight: 35, description: 'Highest score first with timestamp tiebreaking' },
      { name: 'Limit Truncation', weight: 25, description: 'Accurate windowing' },
    ],
    starterCode: {
      javascript: `/**
 * @param {Array<Array<{id: string, authorId: string, timestamp: number, baseScore: number}>>} friendStreams
 * @param {Object<string, number>} affinityScores
 * @param {number} limit
 * @return {Array<string>} Top ranked post IDs
 */
function mergeUserFeeds(friendStreams, affinityScores, limit) {
  // TODO: Merge and rank posts
  return [];
}
`,
    },
    solutionCode: {
      javascript: `function mergeUserFeeds(friendStreams, affinityScores, limit) {
  const allPosts = [];

  for (const stream of friendStreams) {
    for (const post of stream) {
      const affinity = affinityScores[post.authorId] !== undefined ? affinityScores[post.authorId] : 1.0;
      allPosts.push({
        id: post.id,
        timestamp: post.timestamp,
        finalScore: post.baseScore * affinity,
      });
    }
  }

  allPosts.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return b.timestamp - a.timestamp;
  });

  return allPosts.slice(0, limit).map((p) => p.id);
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          [
            { id: 'post_1', authorId: 'alice', timestamp: 1000, baseScore: 10 },
            { id: 'post_2', authorId: 'alice', timestamp: 1200, baseScore: 20 },
          ],
          [
            { id: 'post_3', authorId: 'bob', timestamp: 1100, baseScore: 15 },
          ],
        ])}\n${JSON.stringify({ alice: 2.0, bob: 1.0 })}\n2`,
        expectedOutput: JSON.stringify(['post_2', 'post_1']),
        isHidden: false,
        explanation: 'post_2 score = 20 * 2 = 40. post_1 score = 10 * 2 = 20. post_3 score = 15 * 1 = 15.',
      },
    ],
  },
  {
    title: 'Logistics: Multi-Stop Container Weight Balancer',
    slug: 'logistics-truck-loading-balancer',
    domain: 'Logistics',
    companyName: 'FleetFlow Freight',
    difficulty: 'Hard',
    estimatedMinutes: 45,
    companyScenario:
      'FleetFlow manages cross-country haulers carrying commercial freight. Each semi-truck has two cargo axles (Front Axle & Rear Axle) that must adhere to Department of Transportation (DOT) gross weight safety regulations.',
    businessProblem:
      'Improperly balanced truck axle loads resulted in $320,000 in regulatory roadside fines and caused accelerated transmission wear. Dispatchers need a fast bin-packing heuristic to distribute packages between Front and Rear axles minimizing weight discrepancy.',
    technicalRequirements: [
      'Implement `balanceAxleLoads(packages, maxAxleLimit)`',
      'Each package has `{ id: string, weightKg: number }`.',
      'Partition the packages into `frontAxle` and `rearAxle` arrays.',
      'Neither axle may exceed `maxAxleLimit`.',
      'The absolute difference `|weight(front) - weight(rear)|` must be minimized.',
      'Return `{ success: boolean, diffKg: number, front: string[], rear: string[] }`.',
    ],
    functionalRequirements: [
      'If total weight cannot fit within `2 * maxAxleLimit` or any single package exceeds `maxAxleLimit`, return `{ success: false, diffKg: -1, front: [], rear: [] }`.',
      'Return package IDs in each axle partition.',
    ],
    constraints: [
      'Packages: 1 <= N <= 100',
      'Package weight: 1 <= weightKg <= 10,000',
    ],
    expectedBehavior:
      'Input: Packages array, maxAxleLimit. Output: Partition object.',
    evaluationCriteria: [
      { name: 'Discrepancy Minimization', weight: 45, description: 'Achieves minimal possible weight delta' },
      { name: 'Safety Weight Limit Enforcement', weight: 35, description: 'Strict adherence to maxAxleLimit' },
      { name: 'Edge Case Safety', weight: 20, description: 'Correct rejection of impossible loads' },
    ],
    starterCode: {
      javascript: `/**
 * @param {Array<{id: string, weightKg: number}>} packages
 * @param {number} maxAxleLimit
 * @return {{success: boolean, diffKg: number, front: Array<string>, rear: Array<string>}}
 */
function balanceAxleLoads(packages, maxAxleLimit) {
  // TODO: Partition packages minimizing axle delta
  return { success: false, diffKg: -1, front: [], rear: [] };
}
`,
    },
    solutionCode: {
      javascript: `function balanceAxleLoads(packages, maxAxleLimit) {
  const total = packages.reduce((acc, p) => acc + p.weightKg, 0);
  if (total > maxAxleLimit * 2) {
    return { success: false, diffKg: -1, front: [], rear: [] };
  }
  for (const p of packages) {
    if (p.weightKg > maxAxleLimit) {
      return { success: false, diffKg: -1, front: [], rear: [] };
    }
  }

  const sorted = [...packages].sort((a, b) => b.weightKg - a.weightKg);
  let frontWeight = 0;
  let rearWeight = 0;
  const front = [];
  const rear = [];

  for (const p of sorted) {
    if (frontWeight <= rearWeight && frontWeight + p.weightKg <= maxAxleLimit) {
      front.push(p.id);
      frontWeight += p.weightKg;
    } else if (rearWeight + p.weightKg <= maxAxleLimit) {
      rear.push(p.id);
      rearWeight += p.weightKg;
    } else if (frontWeight + p.weightKg <= maxAxleLimit) {
      front.push(p.id);
      frontWeight += p.weightKg;
    } else {
      return { success: false, diffKg: -1, front: [], rear: [] };
    }
  }

  return {
    success: true,
    diffKg: Math.abs(frontWeight - rearWeight),
    front,
    rear,
  };
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { id: 'pkg_1', weightKg: 500 },
          { id: 'pkg_2', weightKg: 300 },
          { id: 'pkg_3', weightKg: 200 },
        ])}\n1000`,
        expectedOutput: JSON.stringify({
          success: true,
          diffKg: 0,
          front: ['pkg_1'],
          rear: ['pkg_2', 'pkg_3'],
        }),
        isHidden: false,
        explanation: 'Perfect balance: 500kg on front and 500kg on rear, diff = 0',
      },
    ],
  },
  {
    title: 'EdTech: Student Concept Mastery & Spaced Repetition Engine',
    slug: 'edtech-concept-mastery-engine',
    domain: 'EdTech',
    companyName: 'LearnPulse Education',
    difficulty: 'Medium',
    estimatedMinutes: 35,
    companyScenario:
      'LearnPulse delivers personalized adaptive learning to 400,000 high school students. When a student practices questions across various skills (e.g. Algebra, Trigonometry), the platform must accurately update their concept mastery score and schedule their next review interval using spaced repetition curves.',
    businessProblem:
      'Static multiple-choice assessments caused a 31% drop-off in retention after 2 weeks. Research proved that calculating dynamic decay rates and next review dates increases student exam scores by 1.8 letter grades.',
    technicalRequirements: [
      'Implement `calculateConceptMastery(attempts)`',
      'Each attempt has `{ conceptId: string, isCorrect: boolean, timeSpentSec: number, timestamp: number }`.',
      'For each concept, calculate `masteryPercentage`: Start at 50%. A correct answer adds +10%, an incorrect answer subtracts -15% (clamped between 0% and 100%).',
      'Fast correct answer bonus: If `isCorrect === true` and `timeSpentSec < 30`, add an extra +5% bonus.',
      'Return a summary object mapping `conceptId` to `{ masteryPercentage: number, totalAttempts: number, status: "Mastered" | "In Progress" | "Needs Review" }`.',
      '`Mastered` >= 80%, `In Progress` >= 50%, `Needs Review` < 50%.',
    ],
    functionalRequirements: [
      'Chronologically process attempts in order of `timestamp`.',
      'Round final `masteryPercentage` to nearest integer.',
    ],
    constraints: [
      'Attempts: 1 <= N <= 10,000',
      'Concepts: Unique concept IDs',
    ],
    expectedBehavior:
      'Input: Array of attempts. Output: Summary map of concept masteries.',
    evaluationCriteria: [
      { name: 'Mastery Score Accuracy', weight: 45, description: 'Correct application of points, penalties, and speed bonuses' },
      { name: 'Clamping & Bounds', weight: 35, description: 'Never allows mastery < 0 or > 100' },
      { name: 'Status Mapping', weight: 20, description: 'Correct threshold classification' },
    ],
    starterCode: {
      javascript: `/**
 * @param {Array<{conceptId: string, isCorrect: boolean, timeSpentSec: number, timestamp: number}>} attempts
 * @return {Object<string, {masteryPercentage: number, totalAttempts: number, status: string}>}
 */
function calculateConceptMastery(attempts) {
  // TODO: Compute adaptive spaced repetition mastery
  return {};
}
`,
    },
    solutionCode: {
      javascript: `function calculateConceptMastery(attempts) {
  const concepts = {};

  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

  for (const att of sorted) {
    if (!concepts[att.conceptId]) {
      concepts[att.conceptId] = {
        masteryPercentage: 50,
        totalAttempts: 0,
        status: 'In Progress',
      };
    }

    const c = concepts[att.conceptId];
    c.totalAttempts += 1;

    let delta = att.isCorrect ? 10 : -15;
    if (att.isCorrect && att.timeSpentSec < 30) {
      delta += 5;
    }

    c.masteryPercentage = Math.min(100, Math.max(0, c.masteryPercentage + delta));

    if (c.masteryPercentage >= 80) {
      c.status = 'Mastered';
    } else if (c.masteryPercentage >= 50) {
      c.status = 'In Progress';
    } else {
      c.status = 'Needs Review';
    }
  }

  return concepts;
}
`,
    },
    testCases: [
      {
        input: `${JSON.stringify([
          { conceptId: 'c_algebra', isCorrect: true, timeSpentSec: 20, timestamp: 100 },
          { conceptId: 'c_algebra', isCorrect: true, timeSpentSec: 40, timestamp: 200 },
          { conceptId: 'c_algebra', isCorrect: true, timeSpentSec: 25, timestamp: 300 },
        ])}`,
        expectedOutput: JSON.stringify({
          c_algebra: {
            masteryPercentage: 90,
            totalAttempts: 3,
            status: 'Mastered',
          },
        }),
        isHidden: false,
        explanation: '50 + 15 (fast bonus) + 10 + 15 = 90% (Mastered)',
      },
    ],
  },
];

export const seedMissions = async () => {
  try {
    for (const item of seedMissionsData) {
      await Mission.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${seedMissionsData.length} Real-World Missions successfully.`);
  } catch (err) {
    console.error('❌ Error seeding missions:', err.message);
  }
};
