import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DebugChallenge from '../models/DebugChallenge.js';

dotenv.config();

export const seedDebugChallengesData = [
  {
    title: 'Incident #101: Binary Search Off-by-One Array Out-of-Bounds',
    slug: 'binary-search-off-by-one',
    category: 'Off-by-One',
    difficulty: 'Easy',
    incidentSeverity: 'High',
    estimatedMinutes: 15,
    symptomReport:
      'Production service throws intermittent -1 or hangs when searching for targets located at the exact terminal boundaries (index 0 or index length - 1) of sorted catalog IDs.',
    reproductionSteps: [
      'Call `binarySearch(nums, target)` where target equals `nums[nums.length - 1]`',
      'Observe loop terminates prematurely before inspecting the final element',
    ],
    brokenCode: {
      javascript: `/**
 * BUG ALERT: This binary search fails on edge elements.
 * Identify the off-by-one comparison and fix it.
 *
 * @param {number[]} nums Sorted array of integers
 * @param {number} target Integer target to find
 * @return {number} Index of target, or -1 if not found
 */
function binarySearch(nums, target) {
  let left = 0;
  // BUG: Initial right bound is length, causing comparison issues
  let right = nums.length - 1;

  // BUG: Using '<' instead of '<=' misses when left === right
  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
`,
    },
    fixedSolution: {
      javascript: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
`,
    },
    bugExplanation:
      'The while loop condition was `left < right` instead of `left <= right`. When the search space narrows to a single remaining element (`left === right`), the loop terminated without checking whether `nums[mid]` matched the target. Changing the condition to `left <= right` guarantees the final boundary candidate is evaluated.',
    hints: [
      'Examine the while loop termination condition.',
      'What happens when `left === right`? Does the loop body execute or terminate?',
      'Change `while (left < right)` to `while (left <= right)`.',
    ],
    testCases: [
      {
        input: `[-1, 0, 3, 5, 9, 12]\n9`,
        expectedOutput: `4`,
        isHidden: false,
        explanation: 'Standard middle-right element lookup',
      },
      {
        input: `[2, 5]\n5`,
        expectedOutput: `1`,
        isHidden: false,
        explanation: 'Boundary test: Target at the very last index',
      },
      {
        input: `[5]\n5`,
        expectedOutput: `0`,
        isHidden: true,
        explanation: 'Single element array: left === right at start',
      },
      {
        input: `[1, 3, 5, 7]\n2`,
        expectedOutput: `-1`,
        isHidden: true,
        explanation: 'Element absent from array',
      },
    ],
  },
  {
    title: 'Incident #204: Type Coercion Falsy Value Bypass in Checkout',
    slug: 'type-coercion-checkout-bypass',
    category: 'Type Coercion',
    difficulty: 'Medium',
    incidentSeverity: 'Critical',
    estimatedMinutes: 20,
    symptomReport:
      'The billing checkout service allowed promotional gift cards with value 0 to bypass validation, and string numbers like "0" or "false" were incorrectly coerced into free discounts.',
    reproductionSteps: [
      'Submit discount coupon with `{ discountPercent: 0 }`',
      'The validator condition `if (!discount)` treated 0 as invalid and crashed, while loose comparisons `amount == "0"` caused unexpected truthiness',
    ],
    brokenCode: {
      javascript: `/**
 * BUG ALERT: Loose equality and loose truthiness checks cause zero-value items
 * and string representations to fail validation or grant free access.
 *
 * @param {Array<{id: string, price: any, isTaxExempt: any}>} cart
 * @return {number} Calculated total price, or -1 if invalid item found
 */
function calculateCartTotal(cart) {
  let total = 0;

  for (const item of cart) {
    // BUG 1: If price is 0 (free promotional item), '!item.price' evaluates to true and rejects it!
    if (!item.price) {
      return -1;
    }

    // BUG 2: Loose coercion allows strings like "25" without parsing, or NaN
    const priceNum = Number(item.price);
    if (isNaN(priceNum) || priceNum < 0) {
      return -1;
    }

    // BUG 3: Loose comparison treats item.isTaxExempt == 'true' as truthy even if invalid boolean
    const taxRate = item.isTaxExempt === true ? 0 : 0.1;
    total += priceNum * (1 + taxRate);
  }

  return Math.round(total * 100) / 100;
}
`,
    },
    fixedSolution: {
      javascript: `function calculateCartTotal(cart) {
  let total = 0;

  for (const item of cart) {
    if (item.price === undefined || item.price === null) {
      return -1;
    }

    const priceNum = Number(item.price);
    if (isNaN(priceNum) || priceNum < 0) {
      return -1;
    }

    const taxRate = item.isTaxExempt === true ? 0 : 0.1;
    total += priceNum * (1 + taxRate);
  }

  return Math.round(total * 100) / 100;
}
`,
    },
    bugExplanation:
      'In JavaScript, `0` is a falsy value. Using `if (!item.price)` erroneously treats a valid `price: 0` (such as a complimentary item or coupon) as an invalid missing price. Replacing `!item.price` with explicit `item.price === undefined || item.price === null` allows valid zero values while strictly rejecting missing or undefined properties.',
    hints: [
      'In JavaScript, what does `!0` evaluate to?',
      'Check whether the validation check treats price 0 as invalid.',
      'Replace `if (!item.price)` with `if (item.price === undefined || item.price === null)`.',
    ],
    testCases: [
      {
        input: `${JSON.stringify([
          { id: 'item1', price: 100, isTaxExempt: false },
          { id: 'item2', price: 0, isTaxExempt: true },
        ])}`,
        expectedOutput: `110`,
        isHidden: false,
        explanation: 'Item 1 is $100 + 10% tax = $110. Item 2 is $0 free item (should not fail!).',
      },
      {
        input: `${JSON.stringify([
          { id: 'item1', price: 'invalid', isTaxExempt: false },
        ])}`,
        expectedOutput: `-1`,
        isHidden: false,
        explanation: 'Rejects invalid string price',
      },
    ],
  },
  {
    title: 'Incident #309: Overlapping Intervals Merge Logic Error',
    slug: 'overlapping-intervals-logic-error',
    category: 'Logic Error',
    difficulty: 'Medium',
    incidentSeverity: 'High',
    estimatedMinutes: 20,
    symptomReport:
      'Calendar booking system corrupts room reservations when multiple reservations touch or are submitted in unsorted order. Adjacent reservations like [1, 4] and [4, 5] fail to merge.',
    reproductionSteps: [
      'Input intervals `[[1, 4], [4, 5]]`',
      'Code does not sort intervals first, and checks strictly `<` instead of `<=`, producing unmerged fragments',
    ],
    brokenCode: {
      javascript: `/**
 * BUG ALERT: Fails when intervals are unsorted or when intervals touch at endpoints.
 *
 * @param {number[][]} intervals
 * @return {number[][]} Merged overlapping intervals
 */
function mergeIntervals(intervals) {
  if (!intervals || intervals.length <= 1) return intervals || [];

  // BUG 1: Missing sorting! Intervals must be sorted by start time
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];

    // BUG 2: Using strictly '<' fails when endpoints touch (e.g. [1,4] and [4,5])
    if (current[0] < lastMerged[1]) {
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}
`,
    },
    fixedSolution: {
      javascript: `function mergeIntervals(intervals) {
  if (!intervals || intervals.length <= 1) return intervals || [];

  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];

    if (current[0] <= lastMerged[1]) {
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}
`,
    },
    bugExplanation:
      'Two major bugs: 1) Intervals were not pre-sorted by start time `intervals.sort((a, b) => a[0] - b[0])`, so out-of-order meetings were never checked for overlap against previously merged clusters. 2) The overlap condition used `<` instead of `<=`, which failed to combine intervals that share an exact touching boundary (e.g., [1, 4] and [4, 5]).',
    hints: [
      'Can the incoming intervals be in arbitrary order? How should they be pre-sorted?',
      'If one meeting ends at 4:00 and another starts at 4:00 ([1, 4] and [4, 5]), are they considered overlapping?',
      'Sort by start time and change `current[0] < lastMerged[1]` to `current[0] <= lastMerged[1]`.',
    ],
    testCases: [
      {
        input: `${JSON.stringify([[1, 3], [2, 6], [8, 10], [15, 18]])}`,
        expectedOutput: `${JSON.stringify([[1, 6], [8, 10], [15, 18]])}`,
        isHidden: false,
        explanation: '[1, 3] and [2, 6] merge into [1, 6]',
      },
      {
        input: `${JSON.stringify([[1, 4], [4, 5]])}`,
        expectedOutput: `${JSON.stringify([[1, 5]])}`,
        isHidden: false,
        explanation: 'Touching endpoints [1, 4] and [4, 5] should merge into [1, 5]',
      },
      {
        input: `${JSON.stringify([[4, 7], [1, 3], [2, 5]])}`,
        expectedOutput: `${JSON.stringify([[1, 7]])}`,
        isHidden: true,
        explanation: 'Unsorted input array merging into single range',
      },
    ],
  },
  {
    title: 'Incident #415: Fast-Slow Pointer Step Increment in Cycle Detection',
    slug: 'fast-slow-pointer-cycle-detection',
    category: 'Infinite Loop',
    difficulty: 'Medium',
    incidentSeverity: 'Critical',
    estimatedMinutes: 20,
    symptomReport:
      'Worker process entered 100% CPU lockup and timed out when scanning user navigation journeys for circular redirect loops.',
    reproductionSteps: [
      'Input array representation of linked node indices `[1, 2, 0]`',
      'The while loop advances slow and fast at identical speeds or increments past null checks, hanging indefinitely',
    ],
    brokenCode: {
      javascript: `/**
 * BUG ALERT: Contains an infinite loop bug where pointers fail to detect
 * cycle convergence or advance incorrectly.
 *
 * @param {number[]} nextPointers Array where index i points to next index nextPointers[i] (-1 means null)
 * @return {boolean} True if circular loop exists, false otherwise
 */
function hasCycle(nextPointers) {
  if (!nextPointers || nextPointers.length === 0) return false;

  let slow = 0;
  let fast = 0;

  // BUG: Pointers advance at identical rates or loop never terminates
  while (fast !== -1 && nextPointers[fast] !== -1 && nextPointers[fast] !== undefined) {
    slow = nextPointers[slow];
    // BUG: Fast should take TWO steps, but is only taking one step or skipping checks!
    fast = nextPointers[fast]; 

    if (slow === fast) {
      return true;
    }
  }

  return false;
}
`,
    },
    fixedSolution: {
      javascript: `function hasCycle(nextPointers) {
  if (!nextPointers || nextPointers.length === 0) return false;

  let slow = 0;
  let fast = 0;

  while (fast !== -1 && nextPointers[fast] !== -1 && nextPointers[fast] !== undefined) {
    slow = nextPointers[slow];
    const nextFast = nextPointers[fast];
    if (nextFast === -1 || nextFast === undefined) break;
    fast = nextPointers[nextFast];

    if (slow === fast) {
      return true;
    }
  }

  return false;
}
`,
    },
    bugExplanation:
      'In Floyd’s Cycle-Finding Algorithm (Tortoise and Hare), the `slow` pointer advances by 1 node while the `fast` pointer MUST advance by 2 nodes (`fast = next[next[fast]]`). Because `fast` was only taking 1 step (`fast = next[fast]`), both pointers advanced at the exact same velocity and stayed synchronized if initialized at 0, or could loop endlessly without catching up.',
    hints: [
      'In Tortoise and Hare cycle detection, what is the speed ratio between slow and fast?',
      'Check how many steps `fast` takes in each loop iteration.',
      'Ensure `fast` advances TWO steps per iteration: `fast = nextPointers[nextPointers[fast]]`.',
    ],
    testCases: [
      {
        input: `${JSON.stringify([1, 2, 0])}`,
        expectedOutput: `true`,
        isHidden: false,
        explanation: '0 -> 1 -> 2 -> 0 has a cycle',
      },
      {
        input: `${JSON.stringify([1, 2, -1])}`,
        expectedOutput: `false`,
        isHidden: false,
        explanation: '0 -> 1 -> 2 -> -1 terminates with no cycle',
      },
    ],
  },
  {
    title: 'Incident #520: Exponential Recursion Memory Saturation',
    slug: 'fibonacci-exponential-recursion',
    category: 'Performance Bug',
    difficulty: 'Easy',
    incidentSeverity: 'High',
    estimatedMinutes: 15,
    symptomReport:
      'Backend CPU spikes to 100% and triggers Node.js Call Stack Exceeded or Request Timeout when evaluating step 40 of Fibonacci escalation tiers.',
    reproductionSteps: [
      'Invoke `calculateEscalationTier(40)`',
      'Naive O(2^N) recursion executes over 1 trillion call frames and times out',
    ],
    brokenCode: {
      javascript: `/**
 * BUG ALERT: Severe performance bug! Naive recursion causes O(2^N) exponential time complexity.
 * Refactor to O(N) iterative or memoized solution.
 *
 * @param {number} n Target tier (0 <= n <= 50)
 * @return {number} Calculated value
 */
function calculateEscalationTier(n) {
  // BUG: Naive unmemoized recursion chokes on n > 30
  if (n <= 0) return 0;
  if (n === 1) return 1;

  return calculateEscalationTier(n - 1) + calculateEscalationTier(n - 2);
}
`,
    },
    fixedSolution: {
      javascript: `function calculateEscalationTier(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  let prev2 = 0;
  let prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}
`,
    },
    bugExplanation:
      'The naive recursive implementation calls itself twice at every step without caching results, resulting in `O(2^N)` exponential time complexity. For `n = 40`, this executes over 1 billion redundant computations. Refactoring to an `O(N)` bottom-up iterative approach with two variables achieves sub-millisecond execution with `O(1)` auxiliary memory.',
    hints: [
      'Why is the time complexity exponential here?',
      'Are subproblems being computed repeatedly without any caching?',
      'Replace the recursion with a simple `for` loop from 2 to n tracking `prev1` and `prev2`.',
    ],
    testCases: [
      {
        input: `10`,
        expectedOutput: `55`,
        isHidden: false,
        explanation: 'F(10) = 55',
      },
      {
        input: `40`,
        expectedOutput: `102334155`,
        isHidden: false,
        explanation: 'F(40) = 102334155 (must complete in < 5ms)',
      },
    ],
  },
];

export const seedDebugChallenges = async () => {
  try {
    for (const item of seedDebugChallengesData) {
      await DebugChallenge.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${seedDebugChallengesData.length} Debug Arena Challenges successfully.`);
  } catch (err) {
    console.error('❌ Error seeding debug challenges:', err.message);
  }
};
