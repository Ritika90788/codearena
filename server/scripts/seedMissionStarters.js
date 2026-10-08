import mongoose from 'mongoose';
import Mission from '../models/Mission.js';

await mongoose.connect('mongodb://127.0.0.1:27017/codearena');

const missionStarters = {
  'food-delivery-order-batching': {
    javascript: `/**
 * @param {Array<{id: string, restaurantId: string, orderTime: number}>} orders
 * @param {number} maxBatchSize
 * @param {number} maxTimeGapMs
 * @return {Array<Array<string>>} Batches of order IDs
 */
function batchOrders(orders, maxBatchSize, maxTimeGapMs) {
  // TODO: Cluster orders by restaurant and sliding prep window
  return [];
}`,
    python: `# @param orders: List[dict]
# @param maxBatchSize: int
# @param maxTimeGapMs: int
# @return List[List[str]]
def batchOrders(orders, maxBatchSize, maxTimeGapMs):
    # TODO: Cluster orders by restaurant and sliding prep window
    return []`,
    cpp: `// C++ 17 Solution
#include <iostream>
#include <vector>
#include <string>
using namespace std;

// TODO: Implement batching logic
int main() {
    return 0;
}`,
    java: `// Java 17 Solution
import java.util.*;

public class Solution {
    // TODO: Implement batching logic
    public static void main(String[] args) {
        
    }
}`,
    c: `// C Solution
#include <stdio.h>

int main() {
    // TODO: Implement batching logic
    return 0;
}`,
  },

  'fintech-payment-deduplication': {
    javascript: `/**
 * Detects duplicate payment transactions within a sliding time window.
 *
 * @param {Array<{id: string, userId: string, merchantId: string, amountInCents: number, timestamp: number}>} transactions
 * @param {number} timeWindowMs
 * @return {Array<string>} Array of flagged duplicate transaction IDs
 */
function detectDuplicateTransactions(transactions, timeWindowMs) {
  // TODO: Implement sliding window idempotency check
  return [];
}`,
    python: `# @param transactions: List[dict]
# @param timeWindowMs: int
# @return List[str]
def detectDuplicateTransactions(transactions, timeWindowMs):
    # TODO: Implement sliding window idempotency check
    return []`,
    cpp: `// C++ 17 Solution
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    return 0;
}`,
    java: `// Java 17 Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        
    }
}`,
    c: `// C Solution
#include <stdio.h>

int main() {
    return 0;
}`,
  },

  'ecommerce-product-search-index': {
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
}`,
    python: `# @param products: List[dict]
# @param query: str
# @param maxPrice: int
# @param limit: int
# @return List[str]
def searchCatalog(products, query, maxPrice, limit):
    # TODO: Build inverted index and execute multi-token filtered search
    return []`,
    cpp: `// C++ 17 Solution
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    return 0;
}`,
    java: `// Java 17 Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        
    }
}`,
    c: `// C Solution
#include <stdio.h>

int main() {
    return 0;
}`,
  },

  'social-media-feed-merger': {
    javascript: `/**
 * @param {Array<Array<{id: string, authorId: string, timestamp: number, baseScore: number}>>} friendStreams
 * @param {Object<string, number>} affinityScores
 * @param {number} limit
 * @return {Array<string>} Top ranked post IDs
 */
function mergeUserFeeds(friendStreams, affinityScores, limit) {
  // TODO: Merge and rank posts
  return [];
}`,
    python: `# @param friendStreams: List[List[dict]]
# @param affinityScores: dict
# @param limit: int
# @return List[str]
def mergeUserFeeds(friendStreams, affinityScores, limit):
    # TODO: Merge and rank posts
    return []`,
    cpp: `// C++ 17 Solution
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    return 0;
}`,
    java: `// Java 17 Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        
    }
}`,
    c: `// C Solution
#include <stdio.h>

int main() {
    return 0;
}`,
  },

  'logistics-truck-loading-balancer': {
    javascript: `/**
 * @param {Array<{id: string, weightKg: number}>} packages
 * @param {number} maxAxleLimit
 * @return {{success: boolean, diffKg: number, front: Array<string>, rear: Array<string>}}
 */
function balanceAxleLoads(packages, maxAxleLimit) {
  // TODO: Partition packages minimizing axle delta
  return { success: false, diffKg: -1, front: [], rear: [] };
}`,
    python: `# @param packages: List[dict]
# @param maxAxleLimit: int
# @return dict
def balanceAxleLoads(packages, maxAxleLimit):
    # TODO: Partition packages minimizing axle delta
    return {"success": False, "diffKg": -1, "front": [], "rear": []}`,
    cpp: `// C++ 17 Solution
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    return 0;
}`,
    java: `// Java 17 Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        
    }
}`,
    c: `// C Solution
#include <stdio.h>

int main() {
    return 0;
}`,
  },

  'edtech-concept-mastery-engine': {
    javascript: `/**
 * @param {Array<{conceptId: string, isCorrect: boolean, timeSpentSec: number, timestamp: number}>} attempts
 * @return {Object<string, {masteryPercentage: number, totalAttempts: number, status: string}>}
 */
function calculateConceptMastery(attempts) {
  // TODO: Compute adaptive spaced repetition mastery
  return {};
}`,
    python: `# @param attempts: List[dict]
# @return dict
def calculateConceptMastery(attempts):
    # TODO: Compute adaptive spaced repetition mastery
    return {}`,
    cpp: `// C++ 17 Solution
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    return 0;
}`,
    java: `// Java 17 Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        
    }
}`,
    c: `// C Solution
#include <stdio.h>

int main() {
    return 0;
}`,
  },
};

for (const [slug, starter] of Object.entries(missionStarters)) {
  const m = await Mission.findOne({ slug });
  if (m) {
    m.starterCode = starter;
    await m.save();
    console.log(`Updated mission starters for: ${slug}`);
  }
}

console.log('Finished updating all missions!');
process.exit(0);
