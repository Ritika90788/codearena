import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Fix Node.js DNS SRV resolution on Windows for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import User from '../models/User.js';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';
import Assessment from '../models/Assessment.js';
import AssessmentCandidate from '../models/AssessmentCandidate.js';
import Simulation from '../models/Simulation.js';
import ThinkingProfile from '../models/ThinkingProfile.js';
import Roadmap from '../models/Roadmap.js';
import { seedMissions } from '../seeders/missionSeeder.js';
import { seedDebugChallenges } from '../seeders/debugChallengeSeeder.js';
import { seedFeatureProjects } from '../seeders/featureProjectSeeder.js';
import { PROBLEM_TEMPLATES } from '../config/problemTemplates.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codearena';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected.');

    // Clear existing data
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Problem.deleteMany({}),
      TestCase.deleteMany({}),
      Assessment.deleteMany({}),
      AssessmentCandidate.deleteMany({}),
      Simulation.deleteMany({}),
      ThinkingProfile.deleteMany({}),
      Roadmap.deleteMany({}),
    ]);

    // 1. Create Demo Users
    console.log('[Seed] Creating demo users...');
    const instructor = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'instructor@codearena.demo',
      password: 'password123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Lead Algorithms Evaluator & University CS Faculty at Stanford Open Edu.',
      skills: ['Algorithms', 'System Design', 'JavaScript', 'Distributed Systems'],
      rating: 2150,
      streak: 42,
    });

    const candidate = await User.create({
      name: 'Devon Vance',
      email: 'candidate@codearena.demo',
      password: 'password123',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'Full-stack software engineer prepping for tier-1 tech interviews.',
      skills: ['Arrays', 'Strings', 'JavaScript', 'Trees', 'React'],
      rating: 1420,
      streak: 9,
      problemsSolved: 14,
      assessmentsCompleted: 3,
      averageScore: 88,
    });

    const candidate2 = await User.create({
      name: 'Jordan Lee',
      email: 'jordan@codearena.demo',
      password: 'password123',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      bio: 'Competitive programmer and backend developer.',
      skills: ['Dynamic Programming', 'Graphs', 'Linked Lists'],
      rating: 1560,
      streak: 15,
      problemsSolved: 28,
      assessmentsCompleted: 4,
      averageScore: 92,
    });

    console.log('[Seed] Users seeded successfully.');

    // 2. Define 16 Realistic Coding Problems
    console.log('[Seed] Seeding 16 problems with public & hidden test cases...');

    const problemsData = [
      {
        title: 'Two Sum',
        difficulty: 'Easy',
        topic: 'Arrays',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          '-10^9 <= target <= 10^9',
          'Only one valid answer exists.',
        ],
        inputFormat: 'JSON string array `nums` and integer `target`',
        outputFormat: 'Array of two indices `[i, j]`',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
          },
          {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'nums[1] + nums[2] == 6, we return [1, 2].',
          },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  return [];
}`,
        },
        testCases: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false, explanation: 'Basic sum' },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false, explanation: 'Non-zero start' },
          { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
          { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isHidden: true },
        ],
      },
      {
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        topic: 'Strings',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
        constraints: [
          '1 <= s.length <= 2 * 10^5',
          's consists only of printable ASCII characters.',
        ],
        inputFormat: 'A single string `s`',
        outputFormat: 'Boolean `true` or `false`',
        examples: [
          {
            input: '"A man, a plan, a canal: Panama"',
            output: 'true',
            explanation: '"amanaplanacanalpanama" is a palindrome.',
          },
          {
            input: '"race a car"',
            output: 'false',
            explanation: '"raceacar" is not a palindrome.',
          },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
        },
        testCases: [
          { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
          { input: '"race a car"', expectedOutput: 'false', isHidden: false },
          { input: '" "', expectedOutput: 'true', isHidden: true },
          { input: '"0P"', expectedOutput: 'false', isHidden: true },
        ],
      },
      {
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        description: 'Given the `head` of a singly linked list represented as an array of values, reverse the list, and return the reversed list values.',
        constraints: [
          'The number of nodes in the list is the range [0, 5000].',
          '-5000 <= Node.val <= 5000',
        ],
        inputFormat: 'Array of numbers representing linked list nodes',
        outputFormat: 'Reversed array of numbers',
        examples: [
          { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Reversed sequence.' },
          { input: '[1,2]', output: '[2,1]', explanation: 'Two element reversal.' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function reverseList(head) {
  // In array representation:
  return head.slice().reverse();
}`,
        },
        testCases: [
          { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
          { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
          { input: '[]', expectedOutput: '[]', isHidden: true },
          { input: '[42]', expectedOutput: '[42]', isHidden: true },
        ],
      },
      {
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        topic: 'Stack',
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.",
        constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'."],
        inputFormat: 'String `s`',
        outputFormat: 'Boolean `true` or `false`',
        examples: [
          { input: '"()"', output: 'true', explanation: 'Single matched pair' },
          { input: '"()[]{}"', output: 'true', explanation: 'Multiple matched brackets' },
          { input: '"(]"', output: 'false', explanation: 'Mismatched types' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let ch of s) {
    if (map[ch]) {
      if (stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
        },
        testCases: [
          { input: '"()"', expectedOutput: 'true', isHidden: false },
          { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
          { input: '"(]"', expectedOutput: 'false', isHidden: true },
          { input: '"([)]"', expectedOutput: 'false', isHidden: true },
          { input: '"{[]}"', expectedOutput: 'true', isHidden: true },
        ],
      },
      {
        title: 'Implement Queue using Stacks',
        difficulty: 'Easy',
        topic: 'Queue',
        description: 'Implement a first-in first-out (FIFO) queue using only two stacks. The implemented queue should support all typical functions of a normal queue (`push`, `pop`, `peek`, and `empty`).',
        constraints: ['1 <= ops.length <= 100', 'At most 100 calls will be made.'],
        inputFormat: 'List of operations and values',
        outputFormat: 'List of return values',
        examples: [
          { input: '["push", "push", "peek", "pop", "empty"]\n[[1], [2], [], [], []]', output: '[null, null, 1, 1, false]', explanation: 'Standard FIFO output' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `class MyQueue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }
  push(x) { this.inStack.push(x); }
  pop() {
    this.peek();
    return this.outStack.pop();
  }
  peek() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) this.outStack.push(this.inStack.pop());
    }
    return this.outStack[this.outStack.length - 1];
  }
  empty() { return this.inStack.length === 0 && this.outStack.length === 0; }
}`,
        },
        testCases: [
          { input: '["push","push","peek","pop","empty"]\n[[1],[2],[],[],[]]', expectedOutput: '[null,null,1,1,false]', isHidden: false },
          { input: '["push","empty"]\n[[10],[]]', expectedOutput: '[null,false]', isHidden: true },
        ],
      },
      {
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees',
        description: 'Given the `root` of a binary tree represented as a level-order traversal array, return its maximum depth.\n\nA binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
        constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-100 <= Node.val <= 100'],
        inputFormat: 'Array representing level order traversal',
        outputFormat: 'Integer depth',
        examples: [
          { input: '[3,9,20,null,null,15,7]', output: '3', explanation: 'Root to leaf [3, 20, 15] depth is 3.' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function maxDepth(rootArray) {
  if (!rootArray || rootArray.length === 0) return 0;
  return Math.floor(Math.log2(rootArray.length)) + 1;
}`,
        },
        testCases: [
          { input: '[3,9,20,null,null,15,7]', expectedOutput: '3', isHidden: false },
          { input: '[1,null,2]', expectedOutput: '2', isHidden: true },
          { input: '[]', expectedOutput: '0', isHidden: true },
        ],
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        topic: 'Strings',
        description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
        inputFormat: 'String `s`',
        outputFormat: 'Integer length',
        examples: [
          { input: '"abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
          { input: '"bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
          { input: '"pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function lengthOfLongestSubstring(s) {
  let map = new Map();
  let max = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right]) && map.get(s[right]) >= left) {
      left = map.get(s[right]) + 1;
    }
    map.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
        },
        testCases: [
          { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
          { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
          { input: '"pwwkew"', expectedOutput: '3', isHidden: true },
          { input: '""', expectedOutput: '0', isHidden: true },
          { input: '"aab"', expectedOutput: '2', isHidden: true },
        ],
      },
      {
        title: '3Sum',
        difficulty: 'Medium',
        topic: 'Arrays',
        description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.',
        constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
        inputFormat: 'Array of numbers `nums`',
        outputFormat: '2D array of unique triplets',
        examples: [
          { input: '[-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'The distinct triplets are [-1,0,1] and [-1,-1,2].' },
        ],
        timeLimit: 2500,
        memoryLimit: 256,
        starterCode: {
          javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
        },
        testCases: [
          { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
          { input: '[0,1,1]', expectedOutput: '[]', isHidden: true },
          { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: true },
        ],
      },
      {
        title: 'Coin Change',
        difficulty: 'Medium',
        topic: 'DP',
        description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
        constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
        inputFormat: 'Array `coins` and integer `amount`',
        outputFormat: 'Integer minimum coins count',
        examples: [
          { input: '[1,2,5]\n11', output: '3', explanation: '11 = 5 + 5 + 1' },
          { input: '[2]\n3', output: '-1', explanation: 'Cannot form 3 using only 2s.' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        },
        testCases: [
          { input: '[1,2,5]\n11', expectedOutput: '3', isHidden: false },
          { input: '[2]\n3', expectedOutput: '-1', isHidden: false },
          { input: '[1]\n0', expectedOutput: '0', isHidden: true },
          { input: '[186,419,83,408]\n6249', expectedOutput: '20', isHidden: true },
        ],
      },
      {
        title: 'Number of Islands',
        difficulty: 'Medium',
        topic: 'Graphs',
        description: 'Given an `m x n` 2D binary grid `grid` which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
        constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is \'0\' or \'1\'.'],
        inputFormat: '2D array `grid`',
        outputFormat: 'Integer island count',
        examples: [
          {
            input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
            output: '1',
            explanation: 'All 1s connect into 1 large island.',
          },
        ],
        timeLimit: 2500,
        memoryLimit: 256,
        starterCode: {
          javascript: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  let count = 0;
  const dfs = (r, c) => {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
        },
        testCases: [
          { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isHidden: false },
          { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isHidden: true },
        ],
      },
      {
        title: 'Merge Intervals',
        difficulty: 'Medium',
        topic: 'Sorting',
        description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= starti <= endi <= 10^4'],
        inputFormat: '2D array of interval bounds',
        outputFormat: '2D array of merged intervals',
        examples: [
          { input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merging into [1,6].' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const prev = result[result.length - 1];
    if (current[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], current[1]);
    } else {
      result.push(current);
    }
  }
  return result;
}`,
        },
        testCases: [
          { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
          { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: true },
        ],
      },
      {
        title: 'Binary Search',
        difficulty: 'Easy',
        topic: 'Searching',
        description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.',
        constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All elements in nums are unique.'],
        inputFormat: 'Sorted array `nums` and integer `target`',
        outputFormat: 'Index integer or -1',
        examples: [
          { input: '[-1,0,3,5,9,12]\n9', output: '4', explanation: '9 exists in nums and its index is 4' },
          { input: '[-1,0,3,5,9,12]\n2', output: '-1', explanation: '2 does not exist in nums so return -1' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function search(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
        },
        testCases: [
          { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
          { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
          { input: '[5]\n5', expectedOutput: '0', isHidden: true },
        ],
      },
      {
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
        inputFormat: 'Array of elevation heights',
        outputFormat: 'Integer total trapped volume',
        examples: [
          { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units of water are trapped.' },
          { input: '[4,2,0,3,2,5]', output: '9', explanation: '9 units trapped.' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
        },
        testCases: [
          { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
          { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
          { input: '[1,1,1]', expectedOutput: '0', isHidden: true },
        ],
      },
      {
        title: 'Deep Clone Object',
        difficulty: 'Medium',
        topic: 'JavaScript',
        description: 'Implement a function `deepClone(obj)` in JavaScript that performs an authentic recursive deep clone of nested objects and arrays, correctly handling circular references and Date instances.',
        constraints: ['Object may contain primitive types, nested objects, and arrays.'],
        inputFormat: 'JavaScript Object or JSON string',
        outputFormat: 'Cloned JavaScript Object',
        examples: [
          { input: '{"a": 1, "b": {"c": 2}}', output: '{"a": 1, "b": {"c": 2}}', explanation: 'Reference equality is false, values match' },
        ],
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function deepClone(obj, hash = new WeakMap()) {
  if (Object(obj) !== obj) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (hash.has(obj)) return hash.get(obj);
  const result = Array.isArray(obj) ? [] : {};
  hash.set(obj, result);
  for (let key of Object.keys(obj)) {
    result[key] = deepClone(obj[key], hash);
  }
  return result;
}`,
        },
        testCases: [
          { input: '{"a":1,"b":{"c":2}}', expectedOutput: '{"a":1,"b":{"c":2}}', isHidden: false },
          { input: '[1,[2,[3]]]', expectedOutput: '[1,[2,[3]]]', isHidden: true },
        ],
      },
      {
        title: 'Word Ladder',
        difficulty: 'Hard',
        topic: 'Graphs',
        description: 'A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that every adjacent pair differs by exactly one letter, and `endWord == sk`.\n\nGiven two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence, or 0 if no such sequence exists.',
        constraints: ['1 <= beginWord.length <= 10', 'endWord.length == beginWord.length', '1 <= wordList.length <= 5000'],
        inputFormat: 'beginWord, endWord, and wordList',
        outputFormat: 'Integer step count',
        examples: [
          { input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', output: '5', explanation: 'hit -> hot -> dot -> dog -> cog is 5 words.' },
        ],
        timeLimit: 3000,
        memoryLimit: 256,
        starterCode: {
          javascript: `function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;
  let queue = [[beginWord, 1]];
  while (queue.length > 0) {
    const [curr, steps] = queue.shift();
    if (curr === endWord) return steps;
    for (let i = 0; i < curr.length; i++) {
      for (let c = 97; c <= 122; c++) {
        const nextWord = curr.slice(0, i) + String.fromCharCode(c) + curr.slice(i + 1);
        if (wordSet.has(nextWord)) {
          wordSet.delete(nextWord);
          queue.push([nextWord, steps + 1]);
        }
      }
    }
  }
  return 0;
}`,
        },
        testCases: [
          { input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', isHidden: false },
          { input: '"hit"\n"cog"\n["hot","dot","dog","lot","log"]', expectedOutput: '0', isHidden: true },
        ],
      },
      {
        title: 'LRU Cache',
        difficulty: 'Medium',
        topic: 'Hashing',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class with `get(key)` and `put(key, value)` both running in O(1) average time complexity.',
        constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2 * 10^5 calls'],
        inputFormat: 'Operations and capacity arguments',
        outputFormat: 'Operation results list',
        examples: [
          { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', output: '[null, null, null, 1, null, -1, null, -1, 3, 4]', explanation: 'LRU eviction order' },
        ],
        timeLimit: 2500,
        memoryLimit: 256,
        starterCode: {
          javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
}`,
        },
        testCases: [
          { input: '["LRUCache","put","put","get"]\n[[2],[1,1],[2,2],[1]]', expectedOutput: '[null,null,null,1]', isHidden: false },
        ],
      },
    ];

    const createdProblems = [];

    for (const p of problemsData) {
      const { testCases, ...probFields } = p;
      if (PROBLEM_TEMPLATES[p.title]) {
        probFields.starterCode = PROBLEM_TEMPLATES[p.title];
      }
      const created = await Problem.create({
        ...probFields,
        createdBy: instructor._id,
      });

      if (testCases && testCases.length > 0) {
        const tcDocs = testCases.map((tc, idx) => ({
          problemId: created._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          explanation: tc.explanation || '',
          order: idx + 1,
        }));
        await TestCase.insertMany(tcDocs);
      }

      createdProblems.push(created);
    }

    console.log(`[Seed] Seeded ${createdProblems.length} problems with test cases.`);

    // 3. Create 5 Realistic Assessments
    console.log('[Seed] Seeding 5 assessments...');

    const assessmentsData = [
      {
        title: 'Full-Stack JavaScript & Problem Solving Round',
        description: 'Comprehensive 90-minute benchmark evaluating array manipulations, string algorithms, and asynchronous JavaScript memory structures.',
        instructions: 'Read constraints carefully. Your solutions will be checked against edge-case hidden test cases with 2000ms time limits.',
        duration: 90,
        difficulty: 'Medium',
        status: 'Available',
        totalPoints: 100,
        passingScore: 70,
        isAdaptive: false,
        createdBy: instructor._id,
        problems: [
          { problemId: createdProblems[0]._id, points: 25, order: 1 }, // Two Sum
          { problemId: createdProblems[1]._id, points: 25, order: 2 }, // Valid Palindrome
          { problemId: createdProblems[6]._id, points: 25, order: 3 }, // Longest Substring
          { problemId: createdProblems[13]._id, points: 25, order: 4 }, // Deep Clone Object
        ],
      },
      {
        title: 'Core Data Structures: Stacks, Queues & Trees',
        description: 'Targeted assessment focusing on fundamental linear and hierarchical data structures for technical university students.',
        instructions: 'Focus on optimal space and time complexities. Recursive and iterative implementations are evaluated.',
        duration: 60,
        difficulty: 'Easy',
        status: 'Available',
        totalPoints: 75,
        passingScore: 50,
        isAdaptive: false,
        createdBy: instructor._id,
        problems: [
          { problemId: createdProblems[2]._id, points: 25, order: 1 }, // Reverse Linked List
          { problemId: createdProblems[3]._id, points: 25, order: 2 }, // Valid Parentheses
          { problemId: createdProblems[5]._id, points: 25, order: 3 }, // Max Depth Binary Tree
        ],
      },
      {
        title: 'Advanced Dynamic Programming & Graph Traversal',
        description: 'High-level competitive assessment featuring subproblem memoization, BFS/DFS cycles, and shortest path graph transformations.',
        instructions: 'Watch for timeout limits. Solutions exceeding O(N^2) on large inputs will fail hidden stress tests.',
        duration: 105,
        difficulty: 'Hard',
        status: 'Available',
        totalPoints: 100,
        passingScore: 75,
        isAdaptive: false,
        createdBy: instructor._id,
        problems: [
          { problemId: createdProblems[8]._id, points: 30, order: 1 }, // Coin Change
          { problemId: createdProblems[9]._id, points: 30, order: 2 }, // Number of Islands
          { problemId: createdProblems[12]._id, points: 40, order: 3 }, // Trapping Rain Water
        ],
      },
      {
        title: 'Adaptive Skill Assessment: Algorithmic Mastery',
        description: 'Intelligent assessment engine that adapts dynamically between Easy, Medium, and Hard challenges based on candidate real-time answers.',
        instructions: 'The platform dynamically serves harder problems upon success and simpler reinforcement problems on incorrect attempts.',
        duration: 45,
        difficulty: 'Mixed',
        status: 'Available',
        totalPoints: 100,
        passingScore: 65,
        isAdaptive: true,
        createdBy: instructor._id,
        problems: [
          { problemId: createdProblems[11]._id, points: 20, order: 1 }, // Binary Search (Easy)
          { problemId: createdProblems[7]._id, points: 40, order: 2 },  // 3Sum (Medium)
          { problemId: createdProblems[14]._id, points: 40, order: 3 }, // Word Ladder (Hard)
        ],
      },
      {
        title: 'Senior Systems & Architecture Coding Assessment',
        description: 'Upcoming cohort evaluation for Senior Software Engineering applicants covering LRU caching and interval merges.',
        instructions: 'Starts next week. Candidates must review memory constraints and custom data structure definitions.',
        duration: 75,
        difficulty: 'Medium',
        status: 'Upcoming',
        totalPoints: 100,
        passingScore: 80,
        isAdaptive: false,
        createdBy: instructor._id,
        problems: [
          { problemId: createdProblems[10]._id, points: 50, order: 1 }, // Merge Intervals
          { problemId: createdProblems[15]._id, points: 50, order: 2 }, // LRU Cache
        ],
      },
    ];

    const createdAssessments = await Assessment.insertMany(assessmentsData);
    console.log(`[Seed] Seeded ${createdAssessments.length} assessments.`);

    // 4. Create Sample Completed Assessment Record for Candidate
    console.log('[Seed] Seeding candidate assessment attempt record...');
    await AssessmentCandidate.create({
      assessmentId: createdAssessments[0]._id,
      candidateId: candidate._id,
      status: 'completed',
      startedAt: new Date(Date.now() - 3600 * 1000 * 2),
      submittedAt: new Date(Date.now() - 3600 * 1000 * 1),
      score: 88,
      totalScore: 100,
      problemScores: [
        { problemId: createdProblems[0]._id, score: 25, solved: true, attempts: 1 },
        { problemId: createdProblems[1]._id, score: 25, solved: true, attempts: 1 },
        { problemId: createdProblems[6]._id, score: 25, solved: true, attempts: 2 },
        { problemId: createdProblems[13]._id, score: 13, solved: false, attempts: 3 },
      ],
    });

    // 5. Seed Production Simulation (NovaCart Virtual Company)
    console.log('[Seed] Seeding NovaCart Production Simulation...');
    await Simulation.create({
      companyName: 'NovaCart',
      role: 'Junior Full Stack Developer',
      sprintName: 'Order Management System',
      progress: 68,
      candidateId: candidate._id,
      systemHealth: {
        status: 'DEGRADED',
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
          instructions: 'Enable multi-attribute search across customer orders with pagination.',
        },
        {
          id: 'task-2',
          title: 'Fix checkout payment concurrency bug',
          priority: 'CRITICAL',
          deadline: 'Sprint Day 3',
          status: 'completed',
          instructions: 'Prevent duplicate deduction when users double-tap payment confirmation.',
        },
        {
          id: 'task-3',
          title: 'Investigate slow Order API latency in production',
          priority: 'CRITICAL',
          deadline: 'Immediate',
          status: 'in_progress',
          starterCode: `async function getOrdersForCustomer(customerId) {
  // Missing index on { customerId: 1, createdAt: -1 } causes COLLSCAN
  const orders = await Order.find({ customerId });
  const results = [];
  for (const order of orders) {
    const merchant = await Merchant.findById(order.merchantId); // N+1 Query
    results.push({ ...order.toObject(), merchantName: merchant?.name });
  }
  return results;
}`,
          instructions: 'Diagnose 8.4s response time. Check database indexes and N+1 queries.',
        },
        {
          id: 'task-4',
          title: 'Optimize database compound query index for order history',
          priority: 'HIGH',
          deadline: 'Sprint Day 4',
          status: 'pending',
          instructions: 'Create compound index { customerId: 1, createdAt: -1 }.',
        },
        {
          id: 'task-5',
          title: 'Handle guest user checkout requirement change',
          priority: 'MEDIUM',
          deadline: 'Sprint Day 5',
          status: 'pending',
          instructions: 'Allow guest users to add items to cart and check out.',
        },
        {
          id: 'task-6',
          title: 'Final Technical Interview Viva on architecture decisions',
          priority: 'HIGH',
          deadline: 'Sprint Review',
          status: 'pending',
          instructions: 'Defend database schema choices and caching strategy.',
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
    });

    // 6. Seed Developer Thinking Profile
    console.log('[Seed] Seeding Developer Thinking Profile...');
    await ThinkingProfile.create({
      candidateId: candidate._id,
      metrics: {
        problemSolving: 91,
        debugging: 94,
        systemThinking: 79,
        adaptability: 96,
        decisionMaking: 87,
        codeQuality: 90,
        communication: 82,
        edgeCaseAwareness: 88,
        failureRecovery: 93,
        performanceAwareness: 85,
      },
      overallReadiness: 89,
      readinessStatus: 'Interview Ready',
      failureRecoveryScore: 93,
      normalPerformance: 88,
      pressurePerformance: 74,
      aiInsights: [
        'Strong at debugging and adapting to changing requirements under tight constraints.',
        'Rapidly recovers from initial failure states by isolating edge-case inputs.',
        'Needs improvement in high-scale database query indexing and performance optimization.',
      ],
      strengths: [
        'Rapid root-cause isolation in production logs',
        'Defensive coding preventing state regressions',
        'Adapts flexibly when product requirements evolve',
      ],
      weaknesses: [
        'Database query indexing for sub-100ms SLAs',
        'Distributed transaction idempotency depth',
      ],
    });

    // 7. Seed Personalized Roadmap
    console.log('[Seed] Seeding Personalized Roadmap...');
    await Roadmap.create({
      candidateId: candidate._id,
      title: '7-Day Engineering Readiness Acceleration',
      weakAreas: ['Database Optimization', 'System Design', 'Communication Under Pressure'],
      days: [
        {
          dayNumber: 1,
          topic: 'Database Indexing & Query Optimization',
          description: 'Master compound B-Tree indexes, partial indexes, and eliminate full-table COLLSCAN bottlenecks in MongoDB & PostgreSQL.',
          challengeType: 'Incident Debug',
          actionUrl: '/simulations/current',
          status: 'completed',
        },
        {
          dayNumber: 2,
          topic: 'N+1 Query Elimination & Bulk Aggregations',
          description: 'Refactor sequential per-record queries into optimized aggregate lookups and batch pipelines.',
          challengeType: 'Mission',
          actionUrl: '/missions',
          status: 'current',
        },
        {
          dayNumber: 3,
          topic: 'API Performance & Latency Budgets',
          description: 'Implement streaming JSON responses, response payload gzip compression, and connection pool tuning.',
          challengeType: 'Build Feature',
          actionUrl: '/features',
          status: 'locked',
        },
        {
          dayNumber: 4,
          topic: 'High-Throughput Caching & Invalidation',
          description: 'Design Cache-Aside with Redis, cache stampede prevention via probabilistic early expiration (XFetch).',
          challengeType: 'Mission',
          actionUrl: '/missions',
          status: 'locked',
        },
        {
          dayNumber: 5,
          topic: 'System Design Challenge: 1M User Cart Scaling',
          description: 'Architect horizontally partitioned cart service with redis clustering and asynchronous checkout queue.',
          challengeType: 'System Design',
          actionUrl: '/features',
          status: 'locked',
        },
        {
          dayNumber: 6,
          topic: 'Mock Interview: Architectural Trade-off Defense',
          description: 'Practice defending schema choices, ACID vs BASE tradeoffs, and failover topologies with the AI interviewer.',
          challengeType: 'AI Interview',
          actionUrl: '/interview/simulator',
          status: 'locked',
        },
        {
          dayNumber: 7,
          topic: 'Final Full-Stack Production Assessment',
          description: 'End-to-end simulation covering incident triage, code refactoring, requirement adaptation, and verbal review.',
          challengeType: 'Simulation',
          actionUrl: '/simulations/current',
          status: 'locked',
        },
      ],
    });

    // 8. Seed Missions, Debug Challenges, and Feature Projects
    console.log('[Seed] Seeding Real-World Missions, Debug Arena, and Feature Projects...');
    await seedMissions();
    await seedDebugChallenges();
    await seedFeatureProjects();

    console.log(`
    ===============================================================
       🎉 CODEARENA DATABASE SEED COMPLETED SUCCESSFULLY!
       
       Demo Accounts:
       - Candidate:  candidate@codearena.demo  / password123
       - Instructor: instructor@codearena.demo / password123
       
       Seeded:
       - NovaCart Production Simulator Environment
       - Developer Thinking Profile (10 Evaluation Metrics)
       - 7-Day Personalized Engineering Roadmap
       - 10+ Real-World Company Missions
       - 10+ Production Debug Challenges
       - Feature Engineering Projects
       - 16 Algorithmic Problems with Test Cases
       - 5 Comprehensive Assessments
    ===============================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
