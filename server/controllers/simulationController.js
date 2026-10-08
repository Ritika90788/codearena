import mongoose from 'mongoose';
import Simulation from '../models/Simulation.js';
import ThinkingProfile from '../models/ThinkingProfile.js';
import Roadmap from '../models/Roadmap.js';

// Helper to find simulation by Mongo ID, 'current', or company name
export const findSimulationByIdOrCurrent = async (id, userId) => {
  if (!id || id === 'current') {
    if (userId) {
      const userSim = await Simulation.findOne({ candidateId: userId, status: 'in_progress' });
      if (userSim) return userSim;
    }
    return await Simulation.findOne({ companyName: 'NovaCart' });
  }
  if (mongoose.isValidObjectId(id)) {
    const sim = await Simulation.findById(id);
    if (sim) return sim;
  }
  return await Simulation.findOne({ companyName: 'NovaCart' });
};

// Default NovaCart virtual codebase files
export const getDefaultNovaCartFiles = () => [
  {
    path: 'controllers/orderController.js',
    name: 'orderController.js',
    language: 'javascript',
    content: `/**
 * NovaCart Order Management Controller
 * Endpoint: GET /api/v1/orders?customerId=:id
 * 
 * PRODUCTION LATENCY SLA: 200ms
 * CURRENT OBSERVED LATENCY: 8,420ms (CRITICAL BREACH)
 * 
 * TODO:
 * 1. Eliminate full collection scan (COLLSCAN) on 412,890 orders.
 * 2. Eliminate N+1 loop querying Merchant collection sequentially.
 */

import { Order } from '../models/Order.js';
import { Merchant } from '../models/Merchant.js';

// UNOPTIMIZED (CURRENT PRODUCTION BUG):
export async function getOrdersForCustomer(customerId, options = {}) {
  // Query orders without compound index on { customerId: 1, createdAt: -1 }
  const orders = await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);

  // N+1 sequential query loop:
  const populatedOrders = [];
  for (const order of orders) {
    const merchant = await Merchant.findById(order.merchantId);
    populatedOrders.push({
      ...order.toObject(),
      merchantName: merchant ? merchant.name : 'Unknown Merchant',
    });
  }

  return populatedOrders;
}

// OPTIMIZED IMPLEMENTATION (REFACTOR CANDIDATE):
export async function getOrdersForCustomerOptimized(customerId, options = {}) {
  // Uses compound index + MongoDB $lookup aggregation to resolve in single pass
  const orders = await Order.aggregate([
    { $match: { customerId } },
    { $sort: { createdAt: -1 } },
    { $limit: options.limit || 50 },
    {
      $lookup: {
        from: 'merchants',
        localField: 'merchantId',
        foreignField: '_id',
        as: 'merchant',
      },
    },
    { $unwind: { path: '$merchant', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        orderId: '$_id',
        customerId: 1,
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        merchantName: '$merchant.name',
      },
    },
  ]);

  return orders;
}
`,
  },
  {
    path: 'models/Order.js',
    name: 'Order.js',
    language: 'javascript',
    content: `/**
 * NovaCart Order Model
 * Collection: orders (412,890 documents)
 */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      index: true, // Note: Single-field index is inefficient for compound sort
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    items: [
      {
        productId: String,
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// FIX: Add compound index for high-throughput customer order history sorting:
// orderSchema.index({ customerId: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
`,
  },
  {
    path: 'models/Merchant.js',
    name: 'Merchant.js',
    language: 'javascript',
    content: `/**
 * NovaCart Merchant Model
 */

import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Retail' },
  tier: { type: String, default: 'Standard' },
  verified: { type: Boolean, default: true },
});

export const Merchant = mongoose.model('Merchant', merchantSchema);
export default Merchant;
`,
  },
  {
    path: 'services/cartService.js',
    name: 'cartService.js',
    language: 'javascript',
    content: `/**
 * NovaCart Cart Service
 * 
 * CHANGING REQUIREMENTS STAGES:
 * Stage 1: Auth users only (req.user required).
 * Stage 2: Guest users can add items using guestSessionId.
 * Stage 3: Scale to 1M users via redis session clustering.
 */

export class CartService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.carts = new Map(); // In-memory fallback
  }

  async addItemToCart(userContext, item) {
    // Stage 1 vs Stage 2 Adaptation:
    const sessionId = userContext?.userId || userContext?.guestSessionId;
    if (!sessionId) {
      throw new Error('400: Valid userId or guestSessionId required');
    }

    const currentCart = this.carts.get(sessionId) || [];
    currentCart.push(item);
    this.carts.set(sessionId, currentCart);

    return {
      success: true,
      sessionId,
      isGuest: !userContext?.userId,
      itemCount: currentCart.length,
      items: currentCart,
    };
  }

  async getCart(userContext) {
    const sessionId = userContext?.userId || userContext?.guestSessionId;
    return this.carts.get(sessionId) || [];
  }
}
`,
  },
  {
    path: 'routes/orderRoutes.js',
    name: 'orderRoutes.js',
    language: 'javascript',
    content: `import express from 'express';
import { getOrdersForCustomer } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { customerId, limit } = req.query;
  if (!customerId) {
    return res.status(400).json({ error: 'customerId query parameter is required' });
  }

  const start = Date.now();
  const orders = await getOrdersForCustomer(customerId, { limit: parseInt(limit, 10) || 50 });
  const duration = Date.now() - start;

  res.setHeader('X-Response-Time-Ms', duration);
  res.json({ orders, count: orders.length, durationMs: duration });
});

export default router;
`,
  },
  {
    path: 'package.json',
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "novacart-order-service",
  "version": "2.4.1",
  "private": true,
  "dependencies": {
    "express": "^4.21.0",
    "mongoose": "^8.9.0",
    "ioredis": "^5.4.1"
  }
}
`,
  },
];

// Default NovaCart simulation template
const getDefaultSimulationData = (userId) => ({
  companyName: 'NovaCart',
  role: 'Junior Full Stack Developer',
  sprintName: 'Order Management System',
  progress: 68,
  systemHealth: {
    status: 'CRITICAL',
    uptime: 99.4,
    errorRate: 17,
    avgLatencyMs: 8400,
    dbLoad: 91,
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Implement order search with dynamic filters',
      priority: 'HIGH',
      deadline: 'Sprint Day 2',
      status: 'completed',
      starterCode: '// Implemented',
      instructions: 'Enable multi-attribute search across customer orders with pagination.',
    },
    {
      id: 'task-2',
      title: 'Fix checkout payment concurrency bug',
      priority: 'CRITICAL',
      deadline: 'Sprint Day 3',
      status: 'completed',
      starterCode: '// Fixed',
      instructions: 'Prevent duplicate deduction when users double-tap payment confirmation.',
    },
    {
      id: 'task-3',
      title: 'Investigate slow Order API latency in production',
      priority: 'CRITICAL',
      deadline: 'Immediate SLA Breach',
      status: 'in_progress',
      instructions: 'Diagnose 8.4s response time. Check database indexes, N+1 query patterns, and connection pools.',
    },
    {
      id: 'task-4',
      title: 'Optimize database compound query index for order history',
      priority: 'HIGH',
      deadline: 'Sprint Day 4',
      status: 'pending',
      instructions: 'Create compound index { customerId: 1, createdAt: -1 } to avoid COLLSCAN.',
    },
    {
      id: 'task-5',
      title: 'Handle guest user checkout requirement change',
      priority: 'MEDIUM',
      deadline: 'Sprint Day 5',
      status: 'pending',
      instructions: 'Refactor cart service to allow guest sessions without authentication token.',
    },
    {
      id: 'task-6',
      title: 'Final Technical Interview Viva on architecture decisions',
      priority: 'HIGH',
      deadline: 'Sprint Review',
      status: 'pending',
      instructions: 'Defend database schema choices, caching strategy, and indexing design to the Lead Architect.',
    },
  ],
  incidents: [
    {
      id: 'inc-01',
      title: 'Order API Latency Spike (8.4s Response Time)',
      description: 'Order API response time has degraded from 200ms baseline to 8.4s during peak flash sale. 40,281 users affected.',
      severity: 'CRITICAL',
      normalResponseMs: 200,
      currentResponseMs: 8400,
      affectedUsers: 40281,
      errorRate: 17,
      dbLoad: 91,
      rootCause: 'Missing database index and N+1 query loop',
      possibleCauses: [
        'Missing database index',
        'N+1 query loop',
        'Memory leak in worker process',
        'Bad API logic & redundant serialization',
        'Infinite loop in order status state machine',
        'Inefficient algorithm',
        'Incorrect caching invalidation',
        'Database connection pool exhaustion',
        'Race condition in inventory reservation',
      ],
      logs: [
        '[10:14:02.102] WARN  [order-service] Mongo query execution time exceeded 7500ms on collection "orders"',
        '[10:14:02.215] INFO  [order-service] Query plan: COLLSCAN (examined: 412,890 docs, returned: 12 docs)',
        '[10:14:03.011] ERROR [gateway] Upstream timeout 504 on route /api/v1/orders?customerId=usr_99812',
        '[10:14:03.490] WARN  [db-cluster] High CPU utilization on primary replica: 91.4%',
        '[10:14:04.112] WARN  [order-service] Executing 42 sequential queries in loop for merchant metadata resolution',
        '[10:14:05.002] CRIT  [healthcheck] Service latency breach: 8.42s vs 0.20s SLA threshold',
      ],
      metrics: {
        rps: 1420,
        cpu: '91%',
        memory: '78%',
        p95Latency: '8.4s',
        p99Latency: '11.2s',
        connectionPool: '98/100 active',
      },
      isResolved: false,
    },
  ],
  requirementChanges: [
    {
      step: 1,
      title: 'Initial Requirement',
      description: 'Users must login before adding products to cart and initiating order checkout.',
      status: 'completed',
    },
    {
      step: 2,
      title: 'Requirement Change 1: Guest Checkout',
      description: 'Guest users should also be able to add products to cart without creating an account.',
      status: 'active',
    },
    {
      step: 3,
      title: 'Requirement Change 2: Scale to 1M Users',
      description: 'System must support 1,000,000 active concurrent carts with sub-50ms session retrieval.',
      status: 'upcoming',
    },
  ],
  files: getDefaultNovaCartFiles(),
  candidateId: userId,
  isPressureMode: false,
  timeRemainingSec: 900,
  status: 'in_progress',
});

// @desc    Get or initialize current simulation for candidate
// @route   GET /api/simulations/current
// @access  Public / Optional Auth
export const getCurrentSimulation = async (req, res, next) => {
  try {
    const candidateId = req.user?._id;

    let simulation = null;
    if (candidateId) {
      simulation = await Simulation.findOne({ candidateId, status: 'in_progress' });
    }

    if (!simulation) {
      simulation = await Simulation.findOne({ companyName: 'NovaCart' });
      if (!simulation) {
        simulation = await Simulation.create(getDefaultSimulationData(candidateId));
      } else if (!simulation.files || simulation.files.length === 0) {
        simulation.files = getDefaultNovaCartFiles();
        await simulation.save();
      }
    }

    res.status(200).json({
      success: true,
      simulation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get simulation by ID
// @route   GET /api/simulations/:id
// @access  Public
export const getSimulationById = async (req, res, next) => {
  try {
    const simulation = await findSimulationByIdOrCurrent(req.params.id, req.user?._id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found',
      });
    }

    res.status(200).json({
      success: true,
      simulation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status in simulation
// @route   PUT /api/simulations/:id/task/:taskId
// @access  Private / Public
export const updateSimulationTask = async (req, res, next) => {
  try {
    const { status } = req.body;
    let simulation = await findSimulationByIdOrCurrent(req.params.id, req.user?._id);
    if (!simulation) {
      return res.status(404).json({ success: false, message: 'Simulation not found' });
    }

    const task = simulation.tasks.find((t) => t.id === req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in simulation' });
    }

    task.status = status || 'completed';

    // Recalculate progress
    const completedTasks = simulation.tasks.filter((t) => t.status === 'completed').length;
    simulation.progress = Math.round((completedTasks / simulation.tasks.length) * 100);

    await simulation.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      simulation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve production incident in simulation
// @route   POST /api/simulations/:id/incident/:incidentId/resolve
// @access  Private / Public
export const resolveSimulationIncident = async (req, res, next) => {
  try {
    const { selectedRootCause, explanation, codeFix } = req.body;
    let simulation = await findSimulationByIdOrCurrent(req.params.id, req.user?._id);
    if (!simulation) {
      return res.status(404).json({ success: false, message: 'Simulation not found' });
    }

    const incident = simulation.incidents.find((inc) => inc.id === req.params.incidentId) || simulation.incidents[0];
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const causeLower = (selectedRootCause || '').toLowerCase();
    const isCorrectRootCause =
      causeLower.includes('index') ||
      causeLower.includes('n+1') ||
      causeLower.includes('compound');

    incident.isResolved = true;
    incident.currentResponseMs = isCorrectRootCause ? 145 : 4200;
    incident.errorRate = isCorrectRootCause ? 0.1 : 5.4;
    incident.dbLoad = isCorrectRootCause ? 24 : 62;

    simulation.systemHealth = {
      status: isCorrectRootCause ? 'HEALTHY' : 'DEGRADED',
      uptime: 99.98,
      errorRate: incident.errorRate,
      avgLatencyMs: incident.currentResponseMs,
      dbLoad: incident.dbLoad,
    };

    // Mark task-3 as completed if correct
    const task3 = simulation.tasks.find((t) => t.id === 'task-3');
    if (task3 && isCorrectRootCause) {
      task3.status = 'completed';
    }

    // Recalculate progress
    const completedTasks = simulation.tasks.filter((t) => t.status === 'completed').length;
    simulation.progress = Math.round((completedTasks / simulation.tasks.length) * 100);

    await simulation.save();

    res.status(200).json({
      success: true,
      message: isCorrectRootCause
        ? 'Production Incident Successfully Mitigated! Latency: 145ms.'
        : 'Incident partially mitigated, but sub-optimal query path persists.',
      isCorrectRootCause,
      systemHealth: simulation.systemHealth,
      simulation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run benchmark against candidate's order API code
// @route   POST /api/simulations/:id/benchmark
// @access  Public
export const runBenchmark = async (req, res, next) => {
  try {
    const { code } = req.body;
    let simulation = await findSimulationByIdOrCurrent(req.params.id, req.user?._id);

    // Check if candidate code contains optimization patterns:
    // e.g. aggregate, lookup, compound index, or batch query
    const hasAggregation = code && (code.includes('$lookup') || code.includes('aggregate'));
    const hasCompoundIndex = code && (code.includes('customerId: 1') && code.includes('createdAt: -1'));
    const stillHasNPlus1 = code && code.includes('for (const order of orders)') && code.includes('Merchant.findById');

    let latency = 8420;
    let passed = false;
    let message = '';
    let logs = [];

    if ((hasAggregation || !stillHasNPlus1) && hasCompoundIndex) {
      latency = 138;
      passed = true;
      message = 'PERFECT OPTIMIZATION: Index and N+1 query loop eliminated. Latency: 138ms (SLA: 200ms)';
      logs = [
        '[BENCHMARK] Executing query against 412,890 orders...',
        '[INDEX] Compound index used: { customerId: 1, createdAt: -1 } -> IXSCAN (12 keys examined)',
        '[PIPELINE] Single-pass $lookup aggregation merged merchant data',
        `[SLA PASSED] Response time: ${latency}ms (Threshold: 200ms)`,
      ];
    } else if (hasAggregation || !stillHasNPlus1) {
      latency = 185;
      passed = true;
      message = 'PASS: N+1 query eliminated. Response time within 200ms SLA.';
      logs = [
        '[BENCHMARK] Executing aggregation query...',
        '[INDEX] Warning: Consider compound index for sub-50ms query plan',
        `[SLA PASSED] Response time: ${latency}ms (Threshold: 200ms)`,
      ];
    } else {
      latency = 8400;
      passed = false;
      message = 'SLA BREACH: Response time 8.4s exceeds 200ms threshold. Query plan: COLLSCAN.';
      logs = [
        '[BENCHMARK] Executing query against 412,890 orders...',
        '[WARN] COLLSCAN detected: examined 412,890 docs, returned 12 docs',
        '[WARN] 42 sequential queries in loop for merchant metadata resolution',
        `[SLA FAILED] Response time: ${latency}ms (>200ms SLA)`,
      ];
    }

    res.status(200).json({
      success: true,
      passed,
      latency,
      message,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Advance to next changing requirement stage
// @route   POST /api/simulations/:id/requirement/next
// @access  Public
export const advanceRequirementStage = async (req, res, next) => {
  try {
    let simulation = await findSimulationByIdOrCurrent(req.params.id, req.user?._id);
    if (!simulation) {
      return res.status(404).json({ success: false, message: 'Simulation not found' });
    }

    const changes = simulation.requirementChanges;
    const currentActiveIdx = changes.findIndex((c) => c.status === 'active');

    if (currentActiveIdx !== -1 && currentActiveIdx < changes.length - 1) {
      changes[currentActiveIdx].status = 'completed';
      changes[currentActiveIdx + 1].status = 'active';
    } else if (currentActiveIdx === -1 && changes.length > 0) {
      changes[0].status = 'active';
    }

    await simulation.save();

    res.status(200).json({
      success: true,
      message: 'Advanced to next requirement change stage',
      requirementChanges: simulation.requirementChanges,
      activeRequirement: simulation.requirementChanges.find((c) => c.status === 'active'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save virtual file in simulation
// @route   POST /api/simulations/:id/save-file
// @access  Public
export const saveVirtualFile = async (req, res, next) => {
  try {
    const { path, content } = req.body;
    let simulation = await findSimulationByIdOrCurrent(req.params.id, req.user?._id);
    if (!simulation) {
      return res.status(404).json({ success: false, message: 'Simulation not found' });
    }

    let file = simulation.files.find((f) => f.path === path);
    if (file) {
      file.content = content;
    } else {
      simulation.files.push({
        path,
        name: path.split('/').pop(),
        content,
        language: path.endsWith('.json') ? 'json' : 'javascript',
      });
    }

    await simulation.save();

    res.status(200).json({
      success: true,
      message: `File ${path} saved successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate candidate technical explanation
// @route   POST /api/simulations/:id/explain
// @access  Public
export const evaluateExplanation = async (req, res, next) => {
  try {
    const { explanation, implementationCode } = req.body;

    const explanationLower = (explanation || '').toLowerCase();
    const hasIndexMention = explanationLower.includes('index') || explanationLower.includes('b-tree');
    const hasNPlus1Mention = explanationLower.includes('n+1') || explanationLower.includes('lookup') || explanationLower.includes('join');
    const hasLatencyMention = explanationLower.includes('latency') || explanationLower.includes('sla') || explanationLower.includes('collscan');

    let understandingScore = 75;
    let accuracyScore = 70;
    let consistencySignal = 'Matches Implementation';
    let feedback = '';

    if (hasIndexMention && hasNPlus1Mention) {
      understandingScore = 95;
      accuracyScore = 92;
      consistencySignal = 'Strong Match: Technical rationale directly explains both bottleneck layers.';
      feedback = 'Outstanding explanation. Candidate accurately connected the database compound index with COLLSCAN prevention, and explained eliminating the sequential N+1 query loop.';
    } else if (hasIndexMention || hasNPlus1Mention) {
      understandingScore = 84;
      accuracyScore = 80;
      consistencySignal = 'Partial Match: Explains primary bottleneck layer.';
      feedback = 'Good explanation. Candidate identified the primary bottleneck, but should also articulate how eliminating the second layer prevents future regression under high traffic.';
    } else {
      understandingScore = 65;
      accuracyScore = 60;
      consistencySignal = 'Weak Match: Explanation is vague and does not address query execution plan.';
      feedback = 'Explanation lacks specific technical keywords regarding compound indexing or N+1 query loops.';
    }

    res.status(200).json({
      success: true,
      understandingScore,
      accuracyScore,
      consistencySignal,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};
