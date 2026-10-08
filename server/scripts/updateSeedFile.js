import fs from 'fs';

let content = fs.readFileSync('server/seeds/seed.js', 'utf8');

const replacements = [
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function twoSum[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction twoSum(nums, target) {\\n  // Write your code here\\n  return [];\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function isPalindrome[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {string} s\\n * @return {boolean}\\n */\\nfunction isPalindrome(s) {\\n  // Write your code here\\n  return false;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function reverseList[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} head\\n * @return {number[]}\\n */\\nfunction reverseList(head) {\\n  // Write your code here\\n  return [];\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function isValid[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {string} s\\n * @return {boolean}\\n */\\nfunction isValid(s) {\\n  // Write your code here\\n  return false;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function lengthOfLongestSubstring[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {string} s\\n * @return {number}\\n */\\nfunction lengthOfLongestSubstring(s) {\\n  // Write your code here\\n  return 0;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function threeSum[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} nums\\n * @return {number[][]}\\n */\\nfunction threeSum(nums) {\\n  // Write your code here\\n  return [];\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function coinChange[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} coins\\n * @param {number} amount\\n * @return {number}\\n */\\nfunction coinChange(coins, amount) {\\n  // Write your code here\\n  return -1;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function numIslands[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {character[][]} grid\\n * @return {number}\\n */\\nfunction numIslands(grid) {\\n  // Write your code here\\n  return 0;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function merge\(intervals[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[][]} intervals\\n * @return {number[][]}\\n */\\nfunction merge(intervals) {\\n  // Write your code here\\n  return [];\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function search\(nums[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number}\\n */\\nfunction search(nums, target) {\\n  // Write your code here\\n  return -1;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function trap\(height[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} height\\n * @return {number}\\n */\\nfunction trap(height) {\\n  // Write your code here\\n  return 0;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function deepClone[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {Object} obj\\n * @return {Object}\\n */\\nfunction deepClone(obj) {\\n  // Write your code here\\n  return null;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function ladderLength[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {string} beginWord\\n * @param {string} endWord\\n * @param {string[]} wordList\\n * @return {number}\\n */\\nfunction ladderLength(beginWord, endWord, wordList) {\\n  // Write your code here\\n  return 0;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`function maxDepth[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`/**\\n * @param {number[]} rootArray\\n * @return {number}\\n */\\nfunction maxDepth(rootArray) {\\n  // Write your code here\\n  return 0;\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`class LRUCache[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`class LRUCache {\\n  constructor(capacity) {\\n    // Initialize your LRU cache here\\n  }\\n  get(key) {\\n    // Write your code here\\n    return -1;\\n  }\\n  put(key, value) {\\n    // Write your code here\\n  }\\n}\`,
        },`,
  },
  {
    target: /starterCode:\s*\{\s*javascript:\s*`class MyQueue[\s\S]*?`\s*\},/m,
    replacement: `starterCode: {
          javascript: \`class MyQueue {\\n  constructor() {\\n    // Initialize your queue here\\n  }\\n  push(x) {\\n    // Write your code here\\n  }\\n  pop() {\\n    // Write your code here\\n  }\\n  peek() {\\n    // Write your code here\\n  }\\n  empty() {\\n    // Write your code here\\n  }\\n}\`,
        },`,
  },
];

for (const { target, replacement } of replacements) {
  content = content.replace(target, replacement);
}

fs.writeFileSync('server/seeds/seed.js', content, 'utf8');
console.log('Successfully updated seed.js with clean starter templates for all problems!');
