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

// Clean up Find Maximum in Array
const findMaxProb = await Problem.findOne({ title: /Find Maximum in Array/i });
if (findMaxProb) {
  findMaxProb.starterCode = {
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMax(nums) {
  // Write your code here
  return 0;
}`,
    python: `# @param nums: List[int]
# @return int
def findMax(nums):
    # Write your code here
    return 0`,
    cpp: `#include <vector>
using namespace std;

int findMax(const vector<int>& nums) {
    // Write your code here
    return 0;
}`,
    java: `public class Solution {
    public static int findMax(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
    c: `int findMax(int* arr, int n) {
    // Write your code here
    return 0;
}`,
  };
  await findMaxProb.save();
  console.log('Cleaned Find Maximum in Array');
}

// Clean up Palindrome Number
const palProb = await Problem.findOne({ title: /Palindrome Number/i });
if (palProb) {
  palProb.starterCode = {
    javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
  // Write your code here
  return false;
}`,
    python: `# @param x: int
# @return bool
def isPalindrome(x):
    # Write your code here
    return False`,
    cpp: `bool isPalindrome(int x) {
    // Write your code here
    return false;
}`,
    java: `public class Solution {
    public static boolean isPalindrome(int x) {
        // Write your code here
        return false;
    }
}`,
    c: `#include <stdbool.h>

bool isPalindrome(int x) {
    // Write your code here
    return false;
}`,
  };
  await palProb.save();
  console.log('Cleaned Palindrome Number');
}

// Clean up Reverse String
const revProb = await Problem.findOne({ title: /Reverse String/i });
if (revProb) {
  revProb.starterCode = {
    javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
  // Write your code here
  return "";
}`,
    python: `# @param s: str
# @return str
def reverseString(s):
    # Write your code here
    return ""`,
    cpp: `#include <string>
using namespace std;

string reverseString(string s) {
    // Write your code here
    return "";
}`,
    java: `public class Solution {
    public static String reverseString(String s) {
        // Write your code here
        return "";
    }
}`,
    c: `char* reverseString(char* s) {
    // Write your code here
    return s;
}`,
  };
  await revProb.save();
  console.log('Cleaned Reverse String');
}

console.log('All problem starter codes cleaned successfully!');
process.exit(0);
