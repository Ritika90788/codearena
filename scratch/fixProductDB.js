import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const problemsColl = db.collection('problems');
  const testcasesColl = db.collection('testcases');

  const prob = await problemsColl.findOne({ title: 'Product of Array Except Self' });
  if (!prob) {
    console.log('Problem not found');
    await mongoose.disconnect();
    return;
  }
  console.log('Found problem:', prob._id.toString());

  // Delete any testcases matching Two Sum input/output
  const delRes = await testcasesColl.deleteMany({
    problemId: prob._id,
    $or: [
      { expectedOutput: '[0,1]' },
      { expectedOutput: '[1,2]' },
      { input: /\[3,3\]/ },
      { input: /\[2,7,11,15\]/ }
    ]
  });
  console.log('Deleted old Two Sum testcases:', delRes.deletedCount);

  // Check if we need to insert the 3 correct testcases if missing
  const currentTcs = await testcasesColl.find({ problemId: prob._id }).toArray();
  console.log('Current testcases count:', currentTcs.length);

  const desiredTcs = [
    {
      problemId: prob._id,
      input: '[1,2,3,4]',
      expectedOutput: '[24,12,8,6]',
      isHidden: false,
      explanation: 'Basic example: 2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6',
      order: 1
    },
    {
      problemId: prob._id,
      input: '[-1,1,0,-3,3]',
      expectedOutput: '[0,0,9,0,0]',
      isHidden: false,
      explanation: 'Array with zero zeroes out all other positions',
      order: 2
    },
    {
      problemId: prob._id,
      input: '[2,3,4,5]',
      expectedOutput: '[60,40,30,24]',
      isHidden: true,
      explanation: 'Hidden test case',
      order: 3
    }
  ];

  // If there are no desired testcases, insert them
  const hasDesired = currentTcs.some(t => t.input === '[1,2,3,4]');
  if (!hasDesired) {
    await testcasesColl.insertMany(desiredTcs);
    console.log('Inserted 3 authentic test cases.');
  }

  // Update starterCode
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
}`
  };

  await problemsColl.updateOne(
    { _id: prob._id },
    {
      $set: {
        starterCode,
        examples: [
          { input: '[1,2,3,4]', output: '[24,12,8,6]', explanation: 'Product of elements except nums[i].' },
          { input: '[-1,1,0,-3,3]', output: '[0,0,9,0,0]', explanation: 'Zero zeroes out other positions.' }
        ],
        inputFormat: 'Array of integers nums',
        outputFormat: 'Array of products'
      }
    }
  );
  console.log('Problem updated successfully.');

  const finalTcs = await testcasesColl.find({ problemId: prob._id }).toArray();
  console.log('--- Final Test Cases for Product of Array Except Self ---');
  for (const tc of finalTcs) {
    console.log('  ', tc.input, '=>', tc.expectedOutput, '(hidden:', tc.isHidden, ')');
  }

  await mongoose.disconnect();
}

fix().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
