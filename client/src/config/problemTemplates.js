export const PROBLEM_TEMPLATES = {
  'Two Sum': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  return [];
}`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        return []`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
    java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
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
  // Write your solution here
  return false;
}`,
    python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your solution here
        return False`,
    cpp: `#include <iostream>
#include <string>

using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        // Write your solution here
        return false;
    }
};`,
    java: `public class Solution {
    public static boolean isPalindrome(String s) {
        // Write your solution here
        return false;
    }
}`,
    c: `#include <stdbool.h>

bool isPalindrome(char* s) {
    // Write your solution here
    return false;
}`,
  },

  'Reverse Linked List': {
    javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
  // Write your solution here
  return [];
}`,
    python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your solution here
        return None`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        return nullptr;
    }
};`,
    java: `import java.util.*;

public class Solution {
    public static int[] reverseList(int[] head) {
        // Write your solution here
        return new int[]{};
    }
}`,
    c: `int* reverseList(int* head, int headSize) {
    // Write your solution here
    return head;
}`,
  },

  'Valid Parentheses': {
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
  return false;
}`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        return False`,
    cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};`,
    java: `public class Solution {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
    c: `#include <stdbool.h>

bool isValid(char* s) {
    // Write your solution here
    return false;
}`,
  },

  'Implement Queue using Stacks': {
    javascript: `class MyQueue {
  constructor() {
    // Initialize your data structure here
  }

  push(x) {
    // Write your solution here
  }

  pop() {
    // Write your solution here
    return 0;
  }

  peek() {
    // Write your solution here
    return 0;
  }

  empty() {
    // Write your solution here
    return true;
  }
}`,
    python: `class MyQueue:
    def __init__(self):
        # Initialize your data structure here
        pass

    def push(self, x: int) -> None:
        # Write your solution here
        pass

    def pop(self) -> int:
        # Write your solution here
        return 0

    def peek(self) -> int:
        # Write your solution here
        return 0

    def empty(self) -> bool:
        # Write your solution here
        return True`,
    cpp: `#include <iostream>
#include <stack>

using namespace std;

class MyQueue {
public:
    MyQueue() {
        // Initialize your data structure here
    }

    void push(int x) {
        // Write your solution here
    }

    int pop() {
        // Write your solution here
        return 0;
    }

    int peek() {
        // Write your solution here
        return 0;
    }

    bool empty() {
        // Write your solution here
        return true;
    }
};`,
    java: `class MyQueue {
    public MyQueue() {
        // Initialize your data structure here
    }

    public void push(int x) {
        // Write your solution here
    }

    public int pop() {
        // Write your solution here
        return 0;
    }

    public int peek() {
        // Write your solution here
        return 0;
    }

    public boolean empty() {
        // Write your solution here
        return true;
    }
}`,
    c: `// Implement Queue using Stacks in C`,
  },

  'Maximum Depth of Binary Tree': {
    javascript: `/**
 * @param {number[]} rootArray
 * @return {number}
 */
function maxDepth(rootArray) {
  // Write your solution here
  return 0;
}`,
    python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        # Write your solution here
        return 0`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int maxDepth(TreeNode* root) {
        // Write your solution here
        return 0;
    }
};`,
    java: `public class Solution {
    public static int maxDepth(int[] rootArray) {
        // Write your solution here
        return 0;
    }
}`,
    c: `int maxDepth(int* rootArray, int size) {
    // Write your solution here
    return 0;
}`,
  },

  'Longest Substring Without Repeating Characters': {
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution here
  return 0;
}`,
    python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your solution here
        return 0`,
    cpp: `#include <iostream>
#include <string>

using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here
        return 0;
    }
};`,
    java: `public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }
}`,
    c: `int lengthOfLongestSubstring(char* s) {
    // Write your solution here
    return 0;
}`,
  },

  '3Sum': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Write your solution here
  return [];
}`,
    python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Write your solution here
        return []`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your solution here
        return {};
    }
};`,
    java: `import java.util.*;

public class Solution {
    public static List<List<Integer>> threeSum(int[] nums) {
        // Write your solution here
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
  // Write your solution here
  return -1;
}`,
    python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # Write your solution here
        return -1`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your solution here
        return -1;
    }
};`,
    java: `public class Solution {
    public static int coinChange(int[] coins, int amount) {
        // Write your solution here
        return -1;
    }
}`,
    c: `int coinChange(int* coins, int coinsSize, int amount) {
    // Write your solution here
    return -1;
}`,
  },

  'Number of Islands': {
    javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Write your solution here
  return 0;
}`,
    python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Write your solution here
        return 0`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your solution here
        return 0;
    }
};`,
    java: `public class Solution {
    public static int numIslands(char[][] grid) {
        // Write your solution here
        return 0;
    }
}`,
    c: `int numIslands(char** grid, int gridSize, int* gridColSize) {
    // Write your solution here
    return 0;
}`,
  },

  'Merge Intervals': {
    javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your solution here
  return [];
}`,
    python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Write your solution here
        return []`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your solution here
        return {};
    }
};`,
    java: `public class Solution {
    public static int[][] merge(int[][] intervals) {
        // Write your solution here
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
  // Write your solution here
  return -1;
}`,
    python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your solution here
        return -1`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your solution here
        return -1;
    }
};`,
    java: `public class Solution {
    public static int search(int[] nums, int target) {
        // Write your solution here
        return -1;
    }
}`,
    c: `int search(int* nums, int numsSize, int target) {
    // Write your solution here
    return -1;
}`,
  },

  'Trapping Rain Water': {
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your solution here
  return 0;
}`,
    python: `class Solution:
    def trap(self, height: list[int]) -> int:
        # Write your solution here
        return 0`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};`,
    java: `public class Solution {
    public static int trap(int[] height) {
        // Write your solution here
        return 0;
    }
}`,
    c: `int trap(int* height, int heightSize) {
    // Write your solution here
    return 0;
}`,
  },

  'Deep Clone Object': {
    javascript: `/**
 * @param {Object} obj
 * @return {Object}
 */
function deepClone(obj) {
  // Write your solution here
  return {};
}`,
    python: `class Solution:
    def deepClone(self, obj):
        # Write your solution here
        return {}`,
    cpp: `// Deep Clone Object in C++`,
    java: `// Deep Clone Object in Java`,
    c: `// Deep Clone Object in C`,
  },

  'Word Ladder': {
    javascript: `/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
  // Write your solution here
  return 0;
}`,
    python: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        # Write your solution here
        return 0`,
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // Write your solution here
        return 0;
    }
};`,
    java: `import java.util.*;

public class Solution {
    public static int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // Write your solution here
        return 0;
    }
}`,
    c: `// Word Ladder in C`,
  },

  'LRU Cache': {
    javascript: `class LRUCache {
  constructor(capacity) {
    // Initialize your data structure here
  }

  get(key) {
    // Write your solution here
    return -1;
  }

  put(key, value) {
    // Write your solution here
  }
}`,
    python: `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize your data structure here
        pass

    def get(self, key: int) -> int:
        # Write your solution here
        return -1

    def put(self, key: int, value: int) -> None:
        # Write your solution here
        pass`,
    cpp: `#include <iostream>

using namespace std;

class LRUCache {
public:
    LRUCache(int capacity) {
        // Initialize your data structure here
    }

    int get(int key) {
        // Write your solution here
        return -1;
    }

    void put(int key, int value) {
        // Write your solution here
    }
};`,
    java: `class LRUCache {
    public LRUCache(int capacity) {
        // Initialize your data structure here
    }

    public int get(int key) {
        // Write your solution here
        return -1;
    }

    public void put(int key, int value) {
        // Write your solution here
    }
}`,
    c: `// LRUCache in C`,
  },

  'Find Maximum in Array': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMax(nums) {
  // Write your solution here
  return 0;
}`,
    python: `class Solution:
    def findMax(self, nums: list[int]) -> int:
        # Write your solution here
        return 0`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int findMax(const vector<int>& nums) {
        // Write your solution here
        return 0;
    }
};`,
    java: `public class Solution {
    public static int findMax(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
    c: `int findMax(int* arr, int n) {
    // Write your solution here
    return 0;
}`,
  },

  'Palindrome Number': {
    javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
  // Write your solution here
  return false;
}`,
    python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your solution here
        return False`,
    cpp: `#include <iostream>

using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // Write your solution here
        return false;
    }
};`,
    java: `public class Solution {
    public static boolean isPalindrome(int x) {
        // Write your solution here
        return false;
    }
}`,
    c: `#include <stdbool.h>

bool isPalindrome(int x) {
    // Write your solution here
    return false;
}`,
  },

  'Reverse String': {
    javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
  // Write your solution here
  return "";
}`,
    python: `class Solution:
    def reverseString(self, s: str) -> str:
        # Write your solution here
        return ""`,
    cpp: `#include <iostream>
#include <string>

using namespace std;

class Solution {
public:
    string reverseString(string s) {
        // Write your solution here
        return "";
    }
};`,
    java: `public class Solution {
    public static String reverseString(String s) {
        // Write your solution here
        return "";
    }
}`,
    c: `char* reverseString(char* s) {
    // Write your solution here
    return s;
}`,
  },

  'Product of Array Except Self': {
    javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // Write your solution here
  return [];
}`,
    python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        # Write your solution here
        return []`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        // Write your solution here
        return {};
    }
};`,
    java: `import java.util.*;

public class Solution {
    public static int[] productExceptSelf(int[] nums) {
        // Write your solution here
        return new int[]{};
    }
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

int* productExceptSelf(int* nums, int numsSize, int* returnSize) {
    // Write your solution here
    *returnSize = numsSize;
    return nums;
}`,
  },
};
