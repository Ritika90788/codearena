import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

dns.setServers(['8.8.8.8', '1.1.1.1']);

import Problem from '../server/models/Problem.js';
import TestCase from '../server/models/TestCase.js';

async function fixProductOfArray() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected!');

  const title = 'Product of Array Except Self';
  const starterCode = {
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
    java: `public class Solution {
    public static int[] productExceptSelf(int[] nums) {
        // Write your solution here
        return new int[]{};
    }
}`,
    c: `int* productExceptSelf(int* nums, int numsSize, int* returnSize) {
    // Write your solution here
    *returnSize = numsSize;
    return nums;
}`,
  };

  const examples = [
    { input: '[1,2,3,4]', output: '[24,12,8,6]', explanation: 'Product of elements except nums[i].' },
    { input: '[-1,1,0,-3,3]', output: '[0,0,9,0,0]', explanation: 'Zero in array zeroes other positions.' },
  ];

  const problem = await Problem.findOneAndUpdate(
    { title },
    {
      $set: {
        starterCode,
        examples,
        inputFormat: "Array of integers 'nums'",
        outputFormat: 'Array of products',
        constraints: [
          '2 <= nums.length <= 10^5',
          '-30 <= nums[i] <= 30',
          'The product of any prefix or suffix of nums fits in a 32-bit integer.',
        ],
      },
    },
    { new: true }
  );

  if (!problem) {
    console.error('Problem not found in DB!');
    process.exit(1);
  }

  console.log(`Updated problem "${problem.title}" (ID: ${problem._id})`);

  // Replace test cases for this problem
  await TestCase.deleteMany({ problemId: problem._id });
  const newTestCases = await TestCase.insertMany([
    {
      problemId: problem._id,
      input: '[1,2,3,4]',
      expectedOutput: '[24,12,8,6]',
      isHidden: false,
      explanation: 'Basic example: 2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6',
      order: 1,
    },
    {
      problemId: problem._id,
      input: '[-1,1,0,-3,3]',
      expectedOutput: '[0,0,9,0,0]',
      isHidden: false,
      explanation: 'Zero handling example',
      order: 2,
    },
    {
      problemId: problem._id,
      input: '[2,3,4,5]',
      expectedOutput: '[60,40,30,24]',
      isHidden: true,
      explanation: 'Hidden test with larger products',
      order: 3,
    },
  ]);

  console.log(`Attached ${newTestCases.length} authentic test cases to "${problem.title}"!`);

  await mongoose.disconnect();
  console.log('Done!');
}

fixProductOfArray().catch(console.error);
