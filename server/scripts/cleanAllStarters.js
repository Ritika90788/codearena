import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const mongoUri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codearena').replace(/^["']+|["']+$/g, '').trim();
await mongoose.connect(mongoUri);

const cleanTemplates = {
  'Two Sum': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  return [];
}`,
    python: `def twoSum(nums, target):
    # Write your code here
    return []`,
    cpp: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    return {};
}`,
    java: `public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    *returnSize = 0;
    return NULL;
}`,
  },

  'Valid Palindrome': {
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your code here
  return false;
}`,
    python: `def isPalindrome(s):
    # Write your code here
    return False`,
    cpp: `#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Write your code here
    return false;
}`,
    java: `public class Solution {
    public static boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }
}`,
    c: `#include <stdbool.h>

bool isPalindrome(char* s) {
    // Write your code here
    return false;
}`,
  },

  'Reverse Linked List': {
    javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
  // Write your code here
  return [];
}`,
    python: `def reverseList(head):
    # Write your code here
    return []`,
    cpp: `#include <vector>
using namespace std;

vector<int> reverseList(vector<int>& head) {
    // Write your code here
    return {};
}`,
    java: `public class Solution {
    public static int[] reverseList(int[] head) {
        // Write your code here
        return new int[]{};
    }
}`,
    c: `int* reverseList(int* head, int headSize) {
    // Write your code here
    return head;
}`,
  },

  'Valid Parentheses': {
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  return false;
}`,
    python: `def isValid(s):
    # Write your code here
    return False`,
    cpp: `#include <string>
using namespace std;

bool isValid(string s) {
    // Write your code here
    return false;
}`,
    java: `public class Solution {
    public static boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
    c: `#include <stdbool.h>

bool isValid(char* s) {
    // Write your code here
    return false;
}`,
  },

  'Implement Queue using Stacks': {
    javascript: `class MyQueue {
  constructor() {
    // Initialize your data structure here
  }
  push(x) {
    // Write your code here
  }
  pop() {
    // Write your code here
  }
  peek() {
    // Write your code here
  }
  empty() {
    // Write your code here
  }
}`,
    python: `class MyQueue:
    def __init__(self):
        # Initialize your data structure here
        pass

    def push(self, x: int) -> None:
        pass

    def pop(self) -> int:
        return 0

    def peek(self) -> int:
        return 0

    def empty(self) -> bool:
        return True`,
    cpp: `#include <stack>
using namespace std;

class MyQueue {
public:
    MyQueue() {}
    void push(int x) {}
    int pop() { return 0; }
    int peek() { return 0; }
    bool empty() { return true; }
};`,
    java: `class MyQueue {
    public MyQueue() {}
    public void push(int x) {}
    public int pop() { return 0; }
    public int peek() { return 0; }
    public boolean empty() { return true; }
}`,
    c: `// Implement Queue using Stacks in C`,
  },

  'Maximum Depth of Binary Tree': {
    javascript: `/**
 * @param {number[]} rootArray
 * @return {number}
 */
function maxDepth(rootArray) {
  // Write your code here
  return 0;
}`,
    python: `def maxDepth(rootArray):
    # Write your code here
    return 0`,
    cpp: `#include <vector>
using namespace std;

int maxDepth(const vector<int>& rootArray) {
    // Write your code here
    return 0;
}`,
    java: `public class Solution {
    public static int maxDepth(int[] rootArray) {
        // Write your code here
        return 0;
    }
}`,
    c: `int maxDepth(int* rootArray, int size) {
    // Write your code here
    return 0;
}`,
  },

  'Longest Substring Without Repeating Characters': {
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your code here
  return 0;
}`,
    python: `def lengthOfLongestSubstring(s):
    # Write your code here
    return 0`,
    cpp: `#include <string>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your code here
    return 0;
}`,
    java: `public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }
}`,
    c: `int lengthOfLongestSubstring(char* s) {
    // Write your code here
    return 0;
}`,
  },

  '3Sum': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Write your code here
  return [];
}`,
    python: `def threeSum(nums):
    # Write your code here
    return []`,
    cpp: `#include <vector>
using namespace std;

vector<vector<int>> threeSum(vector<int>& nums) {
    // Write your code here
    return {};
}`,
    java: `import java.util.*;

public class Solution {
    public static List<List<Integer>> threeSum(int[] nums) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
    c: `// 3Sum in C`,
  },

  'Coin Change': {
    javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your code here
  return -1;
}`,
    python: `def coinChange(coins, amount):
    # Write your code here
    return -1`,
    cpp: `#include <vector>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    // Write your code here
    return -1;
}`,
    java: `public class Solution {
    public static int coinChange(int[] coins, int amount) {
        // Write your code here
        return -1;
    }
}`,
    c: `int coinChange(int* coins, int coinsSize, int amount) {
    // Write your code here
    return -1;
}`,
  },

  'Number of Islands': {
    javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Write your code here
  return 0;
}`,
    python: `def numIslands(grid):
    # Write your code here
    return 0`,
    cpp: `#include <vector>
using namespace std;

int numIslands(vector<vector<char>>& grid) {
    // Write your code here
    return 0;
}`,
    java: `public class Solution {
    public static int numIslands(char[][] grid) {
        // Write your code here
        return 0;
    }
}`,
    c: `int numIslands(char** grid, int gridSize, int* gridColSize) {
    // Write your code here
    return 0;
}`,
  },

  'Merge Intervals': {
    javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your code here
  return [];
}`,
    python: `def merge(intervals):
    # Write your code here
    return []`,
    cpp: `#include <vector>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // Write your code here
    return {};
}`,
    java: `public class Solution {
    public static int[][] merge(int[][] intervals) {
        // Write your code here
        return new int[0][0];
    }
}`,
    c: `// Merge Intervals in C`,
  },

  'Binary Search': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Write your code here
  return -1;
}`,
    python: `def search(nums, target):
    # Write your code here
    return -1`,
    cpp: `#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    // Write your code here
    return -1;
}`,
    java: `public class Solution {
    public static int search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`,
    c: `int search(int* nums, int numsSize, int target) {
    // Write your code here
    return -1;
}`,
  },

  'Trapping Rain Water': {
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your code here
  return 0;
}`,
    python: `def trap(height):
    # Write your code here
    return 0`,
    cpp: `#include <vector>
using namespace std;

int trap(vector<int>& height) {
    // Write your code here
    return 0;
}`,
    java: `public class Solution {
    public static int trap(int[] height) {
        // Write your code here
        return 0;
    }
}`,
    c: `int trap(int* height, int heightSize) {
    // Write your code here
    return 0;
}`,
  },

  'Deep Clone Object': {
    javascript: `/**
 * @param {Object} obj
 * @return {Object}
 */
function deepClone(obj) {
  // Write your code here
  return null;
}`,
    python: `def deepClone(obj):
    # Write your code here
    return None`,
    cpp: `// Deep Clone in C++`,
    java: `// Deep Clone in Java`,
    c: `// Deep Clone in C`,
  },

  'Word Ladder': {
    javascript: `/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
  // Write your code here
  return 0;
}`,
    python: `def ladderLength(beginWord, endWord, wordList):
    # Write your code here
    return 0`,
    cpp: `#include <string>
#include <vector>
using namespace std;

int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    // Write your code here
    return 0;
}`,
    java: `import java.util.*;

public class Solution {
    public static int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // Write your code here
        return 0;
    }
}`,
    c: `// Word Ladder in C`,
  },

  'LRUCache': {
    javascript: `class LRUCache {
  constructor(capacity) {
    // Initialize your LRU cache here
  }
  get(key) {
    // Write your code here
    return -1;
  }
  put(key, value) {
    // Write your code here
  }
}`,
    python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass`,
    cpp: `class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};`,
    java: `class LRUCache {
    public LRUCache(int capacity) {}
    public int get(int key) { return -1; }
    public void put(int key, int value) {}
}`,
    c: `// LRUCache in C`,
  },
  'LRU Cache': {
    javascript: `class LRUCache {
  constructor(capacity) {
    // Initialize your LRU cache here
  }
  get(key) {
    // Write your code here
    return -1;
  }
  put(key, value) {
    // Write your code here
  }
}`,
    python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass`,
    cpp: `class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};`,
    java: `class LRUCache {
    public LRUCache(int capacity) {}
    public int get(int key) { return -1; }
    public void put(int key, int value) {}
}`,
    c: `// LRUCache in C`,
  },
};

const allProblems = await Problem.find({});
console.log(`Found ${allProblems.length} problems in database.`);

for (const prob of allProblems) {
  const match = cleanTemplates[prob.title];
  if (match) {
    prob.starterCode = match;
    await prob.save();
    console.log(`Cleaned starter code for: ${prob.title}`);
  } else {
    console.log(`No specific template for ${prob.title}, checking default`);
  }
}

console.log('Finished updating MongoDB problems!');
process.exit(0);
