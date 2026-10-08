import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Isolated Sandbox Child Worker
 * Supports: JavaScript (Node.js VM), Python 3, Java, C++, C
 */

process.on('message', async (payload) => {
  const { code, language = 'javascript', testCases = [], timeLimitMs = 2000 } = payload;
  const lang = (language || 'javascript').toLowerCase();
  const results = [];
  let userConsoleLogs = [];

  const normalize = (val) => {
    if (val === undefined || val === null) return '';
    return String(val).trim();
  };

  const matchesExpected = (actual, expected) => {
    if (actual === undefined || actual === null) return false;
    const normActual = String(actual).trim();
    const normExpected = String(expected).trim();

    // 1. Direct or whitespace-compact match
    const compactActual = normActual.replace(/\s+/g, '');
    const compactExpected = normExpected.replace(/\s+/g, '');
    if (compactActual === compactExpected) return true;

    // 2. Case-insensitive match (e.g. true vs True)
    if (compactActual.toLowerCase() === compactExpected.toLowerCase()) return true;

    // 3. Boolean representation: 1 vs true, 0 vs false (standard C/C++ bool prints 1/0)
    if ((compactActual === '1' && compactExpected === 'true') ||
        (compactActual === '0' && compactExpected === 'false') ||
        (compactActual === 'true' && compactExpected === '1') ||
        (compactActual === 'false' && compactExpected === '0')) {
      return true;
    }

    // 4. Bracket / sequence match: [5,4,3,2,1] vs 5 4 3 2 1 or 5,4,3,2,1
    const stripBrackets = (s) =>
      s
        .replace(/^[\[\(\{]/, '')
        .replace(/[\]\)\}]$/, '')
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (stripBrackets(normActual) === stripBrackets(normExpected)) {
      return true;
    }

    // 5. JSON equivalence
    try {
      const parsedAct = JSON.parse(normActual);
      const parsedExp = JSON.parse(normExpected);
      if (JSON.stringify(parsedAct) === JSON.stringify(parsedExp)) return true;
    } catch {}

    return false;
  };

  const getPythonBinary = () => {
    const localAppData = process.env.LOCALAPPDATA || '';
    if (localAppData) {
      const realUserPython = path.join(localAppData, 'Python', 'bin', 'python.exe');
      if (fs.existsSync(realUserPython)) return realUserPython;
    }
    return 'python';
  };

  const injectHarnessIfNeeded = (userCode, targetLang) => {
    let finalCode = userCode;

    // C++ auto-harness
    if (targetLang === 'cpp' || targetLang === 'c++') {
      // Auto-wrap if candidate pasted LeetCode class body starting with 'public:' without 'class Solution {'
      if (!/\bclass\s+\w+/.test(userCode) && /^\s*public\s*:/m.test(userCode)) {
        userCode = userCode.replace(/^\s*public\s*:/m, 'class Solution {\npublic:');
        if (!/\}\s*;?\s*$/.test(userCode.trim())) {
          userCode = userCode + '\n};';
        }
      }

      // Prepend common struct definitions if referenced but not declared
      let structPrefix = '';
      if (/\bOrder\b/.test(userCode) && !/\bstruct\s+Order\b/.test(userCode)) {
        structPrefix += 'struct Order { std::string id; std::string restaurantId; long long orderTime; };\n';
      }
      if (/\bTransaction\b/.test(userCode) && !/\bstruct\s+Transaction\b/.test(userCode)) {
        structPrefix += 'struct Transaction { std::string id; std::string userId; std::string merchantId; long long amountInCents; long long timestamp; };\n';
      }
      if (/\bProduct\b/.test(userCode) && !/\bstruct\s+Product\b/.test(userCode)) {
        structPrefix += 'struct Product { std::string id; std::string title; double price; double rating; };\n';
      }
      if (/\bPost\b/.test(userCode) && !/\bstruct\s+Post\b/.test(userCode)) {
        structPrefix += 'struct Post { std::string id; std::string authorId; long long timestamp; double baseScore; };\n';
      }
      if (/\bPackage\b/.test(userCode) && !/\bstruct\s+Package\b/.test(userCode)) {
        structPrefix += 'struct Package { std::string id; double weightKg; };\n';
      }
      if (/\bBalanceResult\b/.test(userCode) && !/\bstruct\s+BalanceResult\b/.test(userCode)) {
        structPrefix += 'struct BalanceResult { bool success; double diffKg; std::vector<std::string> front; std::vector<std::string> rear; };\n';
      }
      if (/\bConceptAttempt\b/.test(userCode) && !/\bstruct\s+ConceptAttempt\b/.test(userCode)) {
        structPrefix += 'struct ConceptAttempt { std::string conceptId; bool isCorrect; int timeSpentSec; long long timestamp; };\n';
      }
      if (/\bConceptSummary\b/.test(userCode) && !/\bstruct\s+ConceptSummary\b/.test(userCode)) {
        structPrefix += 'struct ConceptSummary { int masteryPercentage; int totalAttempts; std::string status; };\n';
      }
      if (/\bListNode\b/.test(userCode) && !/\bstruct\s+ListNode\b/.test(userCode)) {
        structPrefix += 'struct ListNode { int val; ListNode *next; ListNode() : val(0), next(nullptr) {} ListNode(int x) : val(x), next(nullptr) {} ListNode(int x, ListNode *next) : val(x), next(next) {} };\n';
      }
      if (/\bTreeNode\b/.test(userCode) && !/\bstruct\s+TreeNode\b/.test(userCode)) {
        structPrefix += 'struct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode() : val(0), left(nullptr), right(nullptr) {} TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {} };\n';
      }
      if (structPrefix) {
        structPrefix = `#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <stack>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <cmath>
#include <sstream>
#include <cstdint>
#include <cctype>
#include <utility>
#include <climits>
using namespace std;
` + structPrefix;
        userCode = structPrefix + userCode;
      }

      const hasMain = /\bmain\s*\(/.test(userCode);
      if (hasMain) {
        // If candidate writes their own main() with cin, auto-imbue _JsonWhitespaceFacet
        // so that inputs like [1,2,3,4,5] or [2,7,11,15]\n9 work seamlessly with cin >> int / cin >> val.
        const isBracketStringProb = /\bisValid\b/.test(userCode) || /parenthes/i.test(userCode);
        if (!isBracketStringProb) {
          const facetHeader = `
#include <iostream>
#include <locale>
#include <vector>

struct _JsonWhitespaceFacet : std::ctype<char> {
    static const mask* make_table() {
        static std::vector<mask> v(classic_table(), classic_table() + table_size);
        v['['] |= space;
        v[']'] |= space;
        v[','] |= space;
        v['"'] |= space;
        return &v[0];
    }
    _JsonWhitespaceFacet(size_t refs = 0) : std::ctype<char>(make_table(), false, refs) {}
};

static struct _AutoCinInit {
    _AutoCinInit() {
        std::cin.imbue(std::locale(std::cin.getloc(), new _JsonWhitespaceFacet));
    }
} _auto_cin_init;
`;
          finalCode = facetHeader + userCode;
        } else {
          finalCode = userCode;
        }
      } else {
        let driver = '';
        if (/\bbatchOrders\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::vector<std::vector<std::string>> res = solver.batchOrders(orders, maxBatchSize, maxTimeGap);`
            : `std::vector<std::vector<std::string>> res = batchOrders(orders, maxBatchSize, maxTimeGap);`;
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>

int main() {
    std::string line;
    if (!std::getline(std::cin, line)) return 0;
    
    std::vector<Order> orders;
    size_t pos = 0;
    while ((pos = line.find('{', pos)) != std::string::npos) {
        size_t endObj = line.find('}', pos);
        if (endObj == std::string::npos) break;
        std::string obj = line.substr(pos, endObj - pos + 1);
        
        Order ord;
        size_t idKey = obj.find(R"("id":)");
        if (idKey != std::string::npos) {
            size_t q1 = obj.find('"', idKey + 5);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) ord.id = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t restKey = obj.find(R"("restaurantId":)");
        if (restKey != std::string::npos) {
            size_t q1 = obj.find('"', restKey + 15);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) ord.restaurantId = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t timeKey = obj.find(R"("orderTime":)");
        if (timeKey != std::string::npos) {
            size_t startVal = timeKey + 12;
            while (startVal < obj.size() && (obj[startVal] == ' ' || obj[startVal] == ':')) startVal++;
            size_t endVal = startVal;
            while (endVal < obj.size() && (isdigit(obj[endVal]) || obj[endVal] == '-')) endVal++;
            if (endVal > startVal) ord.orderTime = std::stoll(obj.substr(startVal, endVal - startVal));
        }
        orders.push_back(ord);
        pos = endObj + 1;
    }
    
    int maxBatchSize = 3;
    long long maxTimeGap = 5000;
    std::string line2, line3;
    if (std::getline(std::cin, line2)) {
        try { maxBatchSize = std::stoi(line2); } catch(...) {}
    }
    if (std::getline(std::cin, line3)) {
        try { maxTimeGap = std::stoll(line3); } catch(...) {}
    }
    
    ${callCode}
    
    std::cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        std::cout << "[";
        for (size_t j = 0; j < res[i].size(); ++j) {
            std::cout << "\\"" << res[i][j] << "\\"";
            if (j + 1 < res[i].size()) std::cout << ",";
        }
        std::cout << "]";
        if (i + 1 < res.size()) std::cout << ",";
    }
    std::cout << "]" << std::endl;
    return 0;
}
`;
        } else if (/\bdetectDuplicateTransactions\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::vector<std::string> res = solver.detectDuplicateTransactions(transactions, timeWindowMs);`
            : `std::vector<std::string> res = detectDuplicateTransactions(transactions, timeWindowMs);`;
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>

int main() {
    std::string line;
    if (!std::getline(std::cin, line)) return 0;
    
    std::vector<Transaction> transactions;
    size_t pos = 0;
    while ((pos = line.find('{', pos)) != std::string::npos) {
        size_t endObj = line.find('}', pos);
        if (endObj == std::string::npos) break;
        std::string obj = line.substr(pos, endObj - pos + 1);
        
        Transaction tx;
        size_t idKey = obj.find(R"("id":)");
        if (idKey != std::string::npos) {
            size_t q1 = obj.find('"', idKey + 5);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) tx.id = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t userKey = obj.find(R"("userId":)");
        if (userKey != std::string::npos) {
            size_t q1 = obj.find('"', userKey + 9);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) tx.userId = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t merchKey = obj.find(R"("merchantId":)");
        if (merchKey != std::string::npos) {
            size_t q1 = obj.find('"', merchKey + 13);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) tx.merchantId = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t amtKey = obj.find(R"("amountInCents":)");
        if (amtKey != std::string::npos) {
            size_t sv = amtKey + 16;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '-')) ev++;
            if (ev > sv) tx.amountInCents = std::stoll(obj.substr(sv, ev - sv));
        }
        size_t timeKey = obj.find(R"("timestamp":)");
        if (timeKey != std::string::npos) {
            size_t sv = timeKey + 12;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '-')) ev++;
            if (ev > sv) tx.timestamp = std::stoll(obj.substr(sv, ev - sv));
        }
        transactions.push_back(tx);
        pos = endObj + 1;
    }
    
    long long timeWindowMs = 2000;
    std::string line2;
    if (std::getline(std::cin, line2)) {
        try { timeWindowMs = std::stoll(line2); } catch(...) {}
    }
    
    ${callCode}
    
    std::cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        std::cout << "\\"" << res[i] << "\\"";
        if (i + 1 < res.size()) std::cout << ",";
    }
    std::cout << "]" << std::endl;
    return 0;
}
`;
        } else if (/\bsearchCatalog\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::vector<std::string> res = solver.searchCatalog(products, query, maxPrice, limit);`
            : `std::vector<std::string> res = searchCatalog(products, query, maxPrice, limit);`;
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>

int main() {
    std::string line;
    if (!std::getline(std::cin, line)) return 0;
    
    std::vector<Product> products;
    size_t pos = 0;
    while ((pos = line.find('{', pos)) != std::string::npos) {
        size_t endObj = line.find('}', pos);
        if (endObj == std::string::npos) break;
        std::string obj = line.substr(pos, endObj - pos + 1);
        
        Product p;
        size_t idKey = obj.find(R"("id":)");
        if (idKey != std::string::npos) {
            size_t q1 = obj.find('"', idKey + 5);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) p.id = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t titleKey = obj.find(R"("title":)");
        if (titleKey != std::string::npos) {
            size_t q1 = obj.find('"', titleKey + 8);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) p.title = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t priceKey = obj.find(R"("price":)");
        if (priceKey != std::string::npos) {
            size_t sv = priceKey + 8;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '.')) ev++;
            if (ev > sv) p.price = std::stod(obj.substr(sv, ev - sv));
        }
        size_t ratKey = obj.find(R"("rating":)");
        if (ratKey != std::string::npos) {
            size_t sv = ratKey + 9;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '.')) ev++;
            if (ev > sv) p.rating = std::stod(obj.substr(sv, ev - sv));
        }
        products.push_back(p);
        pos = endObj + 1;
    }
    
    std::string query;
    if (std::getline(std::cin, query)) {
        if (!query.empty() && query.front() == '"') query = query.substr(1);
        if (!query.empty() && query.back() == '"') query.pop_back();
    }
    double maxPrice = 1e9;
    int limit = 10;
    std::string l3, l4;
    if (std::getline(std::cin, l3)) {
        try { maxPrice = std::stod(l3); } catch(...) {}
    }
    if (std::getline(std::cin, l4)) {
        try { limit = std::stoi(l4); } catch(...) {}
    }
    
    ${callCode}
    
    std::cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        std::cout << "\\"" << res[i] << "\\"";
        if (i + 1 < res.size()) std::cout << ",";
    }
    std::cout << "]" << std::endl;
    return 0;
}
`;
        } else if (/\bmergeUserFeeds\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const isMap = /\bmap<string,\s*double>/.test(userCode) || /\bstd::map<std::string,\s*double>/.test(userCode);
          const callCode = hasClass
            ? (isMap ? `Solution solver; std::vector<std::string> res = solver.mergeUserFeeds(streams, affMap, limit);` : `Solution solver; std::vector<std::string> res = solver.mergeUserFeeds(streams, affUnordered, limit);`)
            : (isMap ? `std::vector<std::string> res = mergeUserFeeds(streams, affMap, limit);` : `std::vector<std::string> res = mergeUserFeeds(streams, affUnordered, limit);`);
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <unordered_map>
#include <algorithm>
#include <cctype>

int main() {
    std::string l1, l2, l3;
    if (!std::getline(std::cin, l1)) return 0;
    std::getline(std::cin, l2);
    std::getline(std::cin, l3);

    std::vector<std::vector<Post>> streams;
    size_t i = 0;
    while (i < l1.size()) {
        if (l1[i] == '[') {
            size_t endInner = l1.find(']', i);
            if (endInner != std::string::npos && endInner > i) {
                std::string streamStr = l1.substr(i, endInner - i + 1);
                std::vector<Post> curStream;
                size_t pos = 0;
                while ((pos = streamStr.find('{', pos)) != std::string::npos) {
                    size_t endObj = streamStr.find('}', pos);
                    if (endObj == std::string::npos) break;
                    std::string obj = streamStr.substr(pos, endObj - pos + 1);
                    Post p;
                    size_t idK = obj.find(R"("id":)");
                    if (idK != std::string::npos) {
                        size_t q1 = obj.find('"', idK + 5);
                        size_t q2 = obj.find('"', q1 + 1);
                        if (q1 != std::string::npos && q2 != std::string::npos) p.id = obj.substr(q1 + 1, q2 - q1 - 1);
                    }
                    size_t authK = obj.find(R"("authorId":)");
                    if (authK != std::string::npos) {
                        size_t q1 = obj.find('"', authK + 11);
                        size_t q2 = obj.find('"', q1 + 1);
                        if (q1 != std::string::npos && q2 != std::string::npos) p.authorId = obj.substr(q1 + 1, q2 - q1 - 1);
                    }
                    size_t tsK = obj.find(R"("timestamp":)");
                    if (tsK != std::string::npos) {
                        size_t sv = tsK + 12;
                        while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
                        size_t ev = sv;
                        while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '-')) ev++;
                        if (ev > sv) p.timestamp = std::stoll(obj.substr(sv, ev - sv));
                    }
                    size_t bsK = obj.find(R"("baseScore":)");
                    if (bsK != std::string::npos) {
                        size_t sv = bsK + 12;
                        while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
                        size_t ev = sv;
                        while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '.')) ev++;
                        if (ev > sv) p.baseScore = std::stod(obj.substr(sv, ev - sv));
                    }
                    curStream.push_back(p);
                    pos = endObj + 1;
                }
                if (!curStream.empty()) streams.push_back(curStream);
                i = endInner + 1;
                continue;
            }
        }
        i++;
    }

    std::map<std::string, double> affMap;
    std::unordered_map<std::string, double> affUnordered;
    size_t kPos = 0;
    while ((kPos = l2.find('"', kPos)) != std::string::npos) {
        size_t kEnd = l2.find('"', kPos + 1);
        if (kEnd == std::string::npos) break;
        std::string key = l2.substr(kPos + 1, kEnd - kPos - 1);
        size_t colon = l2.find(':', kEnd + 1);
        if (colon != std::string::npos) {
            size_t valStart = colon + 1;
            while (valStart < l2.size() && l2[valStart] == ' ') valStart++;
            size_t valEnd = valStart;
            while (valEnd < l2.size() && (isdigit(l2[valEnd]) || l2[valEnd] == '.' || l2[valEnd] == '-')) valEnd++;
            if (valEnd > valStart) {
                double val = std::stod(l2.substr(valStart, valEnd - valStart));
                affMap[key] = val;
                affUnordered[key] = val;
            }
            kPos = valEnd;
        } else {
            kPos = kEnd + 1;
        }
    }

    int limit = 10;
    if (!l3.empty()) {
        try { limit = std::stoi(l3); } catch(...) {}
    }

    ${callCode}

    std::cout << "[";
    for (size_t k = 0; k < res.size(); ++k) {
        std::cout << "\\"" << res[k] << "\\"";
        if (k + 1 < res.size()) std::cout << ",";
    }
    std::cout << "]" << std::endl;
    return 0;
}
`;
        } else if (/\bbalanceAxleLoads\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        BalanceResult res = solver.balanceAxleLoads(packages, maxAxleLimit);`
            : `BalanceResult res = balanceAxleLoads(packages, maxAxleLimit);`;
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>

int main() {
    std::string l1, l2;
    if (!std::getline(std::cin, l1)) return 0;
    std::getline(std::cin, l2);

    std::vector<Package> packages;
    size_t pos = 0;
    while ((pos = l1.find('{', pos)) != std::string::npos) {
        size_t endObj = l1.find('}', pos);
        if (endObj == std::string::npos) break;
        std::string obj = l1.substr(pos, endObj - pos + 1);
        Package p;
        size_t idK = obj.find(R"("id":)");
        if (idK != std::string::npos) {
            size_t q1 = obj.find('"', idK + 5);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) p.id = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t wK = obj.find(R"("weightKg":)");
        if (wK != std::string::npos) {
            size_t sv = wK + 11;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && (isdigit(obj[ev]) || obj[ev] == '.')) ev++;
            if (ev > sv) p.weightKg = std::stod(obj.substr(sv, ev - sv));
        }
        packages.push_back(p);
        pos = endObj + 1;
    }

    double maxAxleLimit = 1000.0;
    if (!l2.empty()) {
        try { maxAxleLimit = std::stod(l2); } catch(...) {}
    }

    ${callCode}

    std::cout << "{\\"success\\":" << (res.success ? "true" : "false")
              << ",\\"diffKg\\":" << res.diffKg
              << ",\\"front\\":[";
    for (size_t k = 0; k < res.front.size(); ++k) {
        std::cout << "\\"" << res.front[k] << "\\"" << (k + 1 < res.front.size() ? "," : "");
    }
    std::cout << "],\\"rear\\":[";
    for (size_t k = 0; k < res.rear.size(); ++k) {
        std::cout << "\\"" << res.rear[k] << "\\"" << (k + 1 < res.rear.size() ? "," : "");
    }
    std::cout << "]}" << std::endl;
    return 0;
}
`;
        } else if (/\bcalculateConceptMastery\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const isMap = /\bmap<string,\s*ConceptSummary>/.test(userCode) || /\bstd::map<std::string,\s*ConceptSummary>/.test(userCode);
          const callCode = hasClass
            ? (isMap ? `Solution solver; std::map<std::string, ConceptSummary> res = solver.calculateConceptMastery(attempts);` : `Solution solver; std::unordered_map<std::string, ConceptSummary> res = solver.calculateConceptMastery(attempts);`)
            : (isMap ? `std::map<std::string, ConceptSummary> res = calculateConceptMastery(attempts);` : `std::unordered_map<std::string, ConceptSummary> res = calculateConceptMastery(attempts);`);
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <unordered_map>
#include <algorithm>
#include <cctype>

int main() {
    std::string l1;
    if (!std::getline(std::cin, l1)) return 0;

    std::vector<ConceptAttempt> attempts;
    size_t pos = 0;
    while ((pos = l1.find('{', pos)) != std::string::npos) {
        size_t endObj = l1.find('}', pos);
        if (endObj == std::string::npos) break;
        std::string obj = l1.substr(pos, endObj - pos + 1);
        ConceptAttempt att;
        att.isCorrect = false;
        att.timeSpentSec = 0;
        att.timestamp = 0;
        size_t cK = obj.find(R"("conceptId":)");
        if (cK != std::string::npos) {
            size_t q1 = obj.find('"', cK + 12);
            size_t q2 = obj.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) att.conceptId = obj.substr(q1 + 1, q2 - q1 - 1);
        }
        size_t corK = obj.find(R"("isCorrect":)");
        if (corK != std::string::npos) {
            std::string sub = obj.substr(corK, 20);
            if (sub.find("true") != std::string::npos) att.isCorrect = true;
        }
        size_t tsSecK = obj.find(R"("timeSpentSec":)");
        if (tsSecK != std::string::npos) {
            size_t sv = tsSecK + 15;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && isdigit(obj[ev])) ev++;
            if (ev > sv) att.timeSpentSec = std::stoi(obj.substr(sv, ev - sv));
        }
        size_t tsK = obj.find(R"("timestamp":)");
        if (tsK != std::string::npos) {
            size_t sv = tsK + 12;
            while (sv < obj.size() && (obj[sv] == ' ' || obj[sv] == ':')) sv++;
            size_t ev = sv;
            while (ev < obj.size() && isdigit(obj[ev])) ev++;
            if (ev > sv) att.timestamp = std::stoll(obj.substr(sv, ev - sv));
        }
        attempts.push_back(att);
        pos = endObj + 1;
    }

    ${callCode}

    std::cout << "{";
    size_t cnt = 0;
    for (const auto& kv : res) {
        if (cnt > 0) std::cout << ",";
        std::cout << "\\"" << kv.first << "\\":{\\"masteryPercentage\\":" << kv.second.masteryPercentage
                  << ",\\"totalAttempts\\":" << kv.second.totalAttempts
                  << ",\\"status\\":\\"" << kv.second.status << "\\"}";
        cnt++;
    }
    std::cout << "}" << std::endl;
    return 0;
}
`;
        } else if (/\bmerge\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::vector<std::vector<int>> res = solver.merge(intervals);`
            : `std::vector<std::vector<int>> res = merge(intervals);`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        std::vector<std::vector<int>> intervals;
        size_t i = 0;
        while (i < line.size()) {
            if (line[i] == '[') {
                size_t j = line.find(']', i);
                if (j != std::string::npos && j > i + 1) {
                    std::string inner = line.substr(i + 1, j - i - 1);
                    if (inner.find('[') == std::string::npos) {
                        for (char &c : inner) if (c == ',') c = ' ';
                        std::stringstream ss(inner);
                        int a, b;
                        if (ss >> a >> b) {
                            intervals.push_back({a, b});
                        }
                    }
                }
            }
            i++;
        }
        ${callCode}
        std::cout << "[";
        for (size_t k = 0; k < res.size(); ++k) {
            std::cout << "[" << res[k][0] << "," << res[k][1] << "]";
            if (k + 1 < res.size()) std::cout << ",";
        }
        std::cout << "]" << std::endl;
    }
    return 0;
}
`;
        } else if (/\bsearch\s*\(/.test(userCode) || /\bbinarySearch\s*\(/.test(userCode)) {
          const fnName = /\bbinarySearch\s*\(/.test(userCode) ? 'binarySearch' : 'search';
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n            std::cout << solver.${fnName}(nums, target) << std::endl;`
            : `std::cout << ${fnName}(nums, target) << std::endl;`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        int target = 0;
        if (std::cin >> target) {
            ${callCode}
        } else if (!nums.empty()) {
            target = nums.back();
            nums.pop_back();
            ${callCode}
        }
    }
    return 0;
}
`;
        } else if (/\bfindMax\s*\(/.test(userCode)) {
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        std::cout << findMax(nums) << std::endl;
    }
    return 0;
}
`;
        } else if (/\bproductExceptSelf\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::vector<int> res = solver.productExceptSelf(nums);`
            : `std::vector<int> res = productExceptSelf(nums);`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        ${callCode}
        std::cout << "[";
        for (size_t i = 0; i < res.size(); ++i) {
            std::cout << res[i] << (i + 1 < res.size() ? "," : "");
        }
        std::cout << "]" << std::endl;
    }
    return 0;
}
`;
        } else if (/\btwoSum\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n            std::vector<int> res = solver.twoSum(nums, target);`
            : `std::vector<int> res = twoSum(nums, target);`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        int target = 0;
        if (std::cin >> target) {
            ${callCode}
            std::cout << "[" << (res.size() > 0 ? std::to_string(res[0]) : "") << (res.size() > 1 ? "," + std::to_string(res[1]) : "") << "]" << std::endl;
        }
    }
    return 0;
}
`;
        } else if (/\bthreeSum\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::vector<std::vector<int>> res = solver.threeSum(nums);`
            : `std::vector<std::vector<int>> res = threeSum(nums);`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        ${callCode}
        std::cout << "[";
        for (size_t i = 0; i < res.size(); ++i) {
            std::cout << "[" << res[i][0] << "," << res[i][1] << "," << res[i][2] << "]";
            if (i + 1 < res.size()) std::cout << ",";
        }
        std::cout << "]" << std::endl;
    }
    return 0;
}
`;
        } else if (/\bcoinChange\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n            int res = solver.coinChange(coins, amount);`
            : `int res = coinChange(coins, amount);`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> coins;
        int val;
        while (ss >> val) coins.push_back(val);
        int amount = 0;
        if (std::cin >> amount) {
            ${callCode}
            std::cout << res << std::endl;
        }
    }
    return 0;
}
`;
        } else if (/\blengthOfLongestSubstring\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        int res = solver.lengthOfLongestSubstring(s);`
            : `int res = lengthOfLongestSubstring(s);`;
          driver = `
#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::getline(std::cin, s)) {
        if (!s.empty() && s.front() == '"') s = s.substr(1);
        if (!s.empty() && s.back() == '"') s.pop_back();
        ${callCode}
        std::cout << res << std::endl;
    }
    return 0;
}
`;
        } else if (/\btrap\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        int res = solver.trap(height);`
            : `int res = trap(height);`;
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> height;
        int val;
        while (ss >> val) height.push_back(val);
        ${callCode}
        std::cout << res << std::endl;
    }
    return 0;
}
`;
        } else if (/\bisPalindrome\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::cout << (solver.isPalindrome(s) ? "true" : "false") << std::endl;`
            : `std::cout << (isPalindrome(s) ? "true" : "false") << std::endl;`;
          driver = `
#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::getline(std::cin, s)) {
        if (!s.empty() && s.front() == '"') s = s.substr(1);
        if (!s.empty() && s.back() == '"') s.pop_back();
        ${callCode}
    }
    return 0;
}
`;
        } else if (/\breverseString\s*\(/.test(userCode)) {
          driver = `
#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::cin >> s) {
        std::cout << reverseString(s) << std::endl;
    }
    return 0;
}
`;
        } else if (/\breverseList\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const isListNode = /ListNode\s*\*/.test(userCode);
          let callLogic = '';
          if (isListNode) {
            callLogic = hasClass
              ? `
        ListNode dummy(0);
        ListNode* curr = &dummy;
        for (int v : nums) { curr->next = new ListNode(v); curr = curr->next; }
        Solution solver;
        ListNode* resNode = solver.reverseList(dummy.next);
        std::vector<int> res;
        while (resNode) { res.push_back(resNode->val); resNode = resNode->next; }
`
              : `
        ListNode dummy(0);
        ListNode* curr = &dummy;
        for (int v : nums) { curr->next = new ListNode(v); curr = curr->next; }
        ListNode* resNode = reverseList(dummy.next);
        std::vector<int> res;
        while (resNode) { res.push_back(resNode->val); resNode = resNode->next; }
`;
          } else {
            callLogic = hasClass
              ? `Solution solver;\n        std::vector<int> res = solver.reverseList(nums);`
              : `std::vector<int> res = reverseList(nums);`;
          }

          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        ${callLogic}
        std::cout << "[";
        for (size_t i = 0; i < res.size(); ++i) {
            std::cout << res[i] << (i + 1 < res.size() ? "," : "");
        }
        std::cout << "]" << std::endl;
    }
    return 0;
}
`;
        } else if (/\bmaxDepth\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const isTreeNode = /TreeNode\s*\*/.test(userCode);
          const callCode = isTreeNode
            ? (hasClass ? `Solution solver;\n        int res = solver.maxDepth(root);` : `int res = maxDepth(root);`)
            : (hasClass ? `Solution solver;\n        int res = solver.maxDepth(nums);` : `int res = maxDepth(nums);`);
          driver = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <queue>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        for (char &c : line) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line);
        std::vector<std::string> tokens;
        std::string tok;
        while (ss >> tok) tokens.push_back(tok);
        
        std::vector<int> nums;
        for (const auto& t : tokens) {
            if (t != "null") {
                try { nums.push_back(std::stoi(t)); } catch(...) {}
            }
        }
        
        TreeNode* root = nullptr;
        if (!tokens.empty() && tokens[0] != "null") {
            try {
                root = new TreeNode(std::stoi(tokens[0]));
                std::queue<TreeNode*> q;
                q.push(root);
                size_t idx = 1;
                while (!q.empty() && idx < tokens.size()) {
                    TreeNode* curr = q.front();
                    q.pop();
                    if (idx < tokens.size()) {
                        if (tokens[idx] != "null") {
                            curr->left = new TreeNode(std::stoi(tokens[idx]));
                            q.push(curr->left);
                        }
                        idx++;
                    }
                    if (idx < tokens.size()) {
                        if (tokens[idx] != "null") {
                            curr->right = new TreeNode(std::stoi(tokens[idx]));
                            q.push(curr->right);
                        }
                        idx++;
                    }
                }
            } catch(...) {}
        }
        ${callCode}
        std::cout << res << std::endl;
    }
    return 0;
}
`;
        } else if (/\bnumIslands\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        int res = solver.numIslands(grid);`
            : `int res = numIslands(grid);`;
          driver = `
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        std::vector<std::vector<char>> grid;
        std::vector<char> row;
        bool inInner = false;
        for (size_t i = 0; i < line.size(); ++i) {
            if (line[i] == '[') {
                if (i > 0 && line[i-1] != '[') inInner = true;
            } else if (line[i] == ']') {
                if (inInner) {
                    if (!row.empty()) {
                        grid.push_back(row);
                        row.clear();
                    }
                    inInner = false;
                }
            } else if (line[i] == '0' || line[i] == '1') {
                row.push_back(line[i]);
            }
        }
        if (!row.empty()) grid.push_back(row);
        ${callCode}
        std::cout << res << std::endl;
    }
    return 0;
}
`;
        } else if (/\bladderLength\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        int res = solver.ladderLength(beginWord, endWord, wordList);`
            : `int res = ladderLength(beginWord, endWord, wordList);`;
          driver = `
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string beginWord, endWord, listLine;
    if (std::getline(std::cin, beginWord) && std::getline(std::cin, endWord) && std::getline(std::cin, listLine)) {
        for (char &c : beginWord) if (c == '"' || c == ' ') c = 0;
        beginWord = std::string(beginWord.c_str());
        for (char &c : endWord) if (c == '"' || c == ' ') c = 0;
        endWord = std::string(endWord.c_str());
        std::vector<std::string> wordList;
        std::string cur = "";
        bool inQ = false;
        for (char c : listLine) {
            if (c == '"') {
                if (inQ) { wordList.push_back(cur); cur = ""; inQ = false; }
                else { inQ = true; }
            } else if (inQ) {
                cur += c;
            }
        }
        ${callCode}
        std::cout << res << std::endl;
    }
    return 0;
}
`;
        } else if (/\bclass\s+MyQueue\b/.test(userCode) || /\bstruct\s+MyQueue\b/.test(userCode)) {
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

int main() {
    std::string line1, line2;
    if (std::getline(std::cin, line1) && std::getline(std::cin, line2)) {
        std::vector<std::string> ops;
        std::string cur = "";
        bool inQ = false;
        for (char c : line1) {
            if (c == '"') {
                if (inQ) { ops.push_back(cur); cur = ""; inQ = false; }
                else { inQ = true; }
            } else if (inQ) {
                cur += c;
            }
        }
        
        std::vector<int> vals;
        for (char &c : line2) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line2);
        int v;
        while (ss >> v) vals.push_back(v);
        
        MyQueue q;
        size_t valIdx = 0;
        std::cout << "[";
        for (size_t i = 0; i < ops.size(); ++i) {
            if (ops[i] == "push") {
                if (valIdx < vals.size()) q.push(vals[valIdx++]);
                std::cout << "null";
            } else if (ops[i] == "pop") {
                std::cout << q.pop();
            } else if (ops[i] == "peek") {
                std::cout << q.peek();
            } else if (ops[i] == "empty") {
                std::cout << (q.empty() ? "true" : "false");
            }
            if (i + 1 < ops.size()) std::cout << ",";
        }
        std::cout << "]" << std::endl;
    }
    return 0;
}
`;
        } else if (/\bclass\s+LRUCache\b/.test(userCode) || /\bstruct\s+LRUCache\b/.test(userCode)) {
          driver = `
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

int main() {
    std::string line1, line2;
    if (std::getline(std::cin, line1) && std::getline(std::cin, line2)) {
        std::vector<std::string> ops;
        std::string cur = "";
        bool inQ = false;
        for (char c : line1) {
            if (c == '"') {
                if (inQ) { ops.push_back(cur); cur = ""; inQ = false; }
                else { inQ = true; }
            } else if (inQ) {
                cur += c;
            }
        }
        
        std::vector<int> nums;
        for (char &c : line2) if (c == '[' || c == ']' || c == ',') c = ' ';
        std::stringstream ss(line2);
        int v;
        while (ss >> v) nums.push_back(v);
        
        LRUCache* cache = nullptr;
        size_t nIdx = 0;
        std::cout << "[";
        for (size_t i = 0; i < ops.size(); ++i) {
            if (ops[i] == "LRUCache") {
                int cap = (nIdx < nums.size()) ? nums[nIdx++] : 2;
                cache = new LRUCache(cap);
                std::cout << "null";
            } else if (ops[i] == "put") {
                int k = (nIdx < nums.size()) ? nums[nIdx++] : 0;
                int val = (nIdx < nums.size()) ? nums[nIdx++] : 0;
                if (cache) cache->put(k, val);
                std::cout << "null";
            } else if (ops[i] == "get") {
                int k = (nIdx < nums.size()) ? nums[nIdx++] : 0;
                std::cout << (cache ? cache->get(k) : -1);
            }
            if (i + 1 < ops.size()) std::cout << ",";
        }
        std::cout << "]" << std::endl;
        delete cache;
    }
    return 0;
}
`;
        } else if (/\bisValid\s*\(/.test(userCode)) {
          const hasClass = /\bclass\s+Solution\b/.test(userCode);
          const callCode = hasClass
            ? `Solution solver;\n        std::cout << (solver.isValid(s) ? "true" : "false") << std::endl;`
            : `std::cout << (isValid(s) ? "true" : "false") << std::endl;`;
          driver = `
#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::getline(std::cin, s)) {
        if (!s.empty() && s.front() == '"') s = s.substr(1);
        if (!s.empty() && s.back() == '"') s.pop_back();
        ${callCode}
    }
    return 0;
}
`;
        } else {
          driver = `
#include <iostream>
#include <string>

int main() {
    std::string line;
    if (std::getline(std::cin, line)) {
        std::cout << line << std::endl;
    }
    return 0;
}
`;
        }
        finalCode = userCode + '\n' + driver;
      }
    }

    // Python auto-harness
    if (targetLang === 'python' || targetLang === 'py') {
      let pyHelper = '';
      if (/\bListNode\b/.test(userCode) && !/\bclass\s+ListNode\b/.test(userCode)) {
        pyHelper += 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n';
      }
      if (/\bTreeNode\b/.test(userCode) && !/\bclass\s+TreeNode\b/.test(userCode)) {
        pyHelper += 'class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n';
      }
      if (/\bOptional\b/.test(userCode) && !/\bfrom\s+typing\s+import/.test(userCode)) {
        pyHelper += 'from typing import Optional, List, Dict, Set, Tuple\n';
      }
      if (pyHelper) {
        userCode = pyHelper + userCode;
      }

      const hasRunner = /__name__\s*==\s*['"]__main__['"]/.test(userCode) || /sys\.stdin/.test(userCode);
      if (!hasRunner) {
        let pyDriver = '';
        if (/\bclass\s+LRUCache\b/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip().split('\\n')
    if len(raw) >= 2:
        ops = json.loads(raw[0])
        args = json.loads(raw[1])
        cache = None
        res = []
        for op, arg in zip(ops, args):
            if op == 'LRUCache':
                cache = LRUCache(*arg)
                res.append(None)
            elif op == 'put':
                if cache:
                    cache.put(*arg)
                res.append(None)
            elif op == 'get':
                val = cache.get(*arg) if cache else -1
                res.append(val)
        print(json.dumps(res))
`;
        } else if (/\bclass\s+MyQueue\b/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip().split('\\n')
    if len(raw) >= 2:
        ops = json.loads(raw[0])
        args = json.loads(raw[1])
        q = None
        res = []
        for op, arg in zip(ops, args):
            if op == 'MyQueue':
                q = MyQueue()
                res.append(None)
            elif op == 'push':
                if q:
                    q.push(*arg)
                res.append(None)
            elif op == 'pop':
                res.append(q.pop() if q else 0)
            elif op == 'peek':
                res.append(q.peek() if q else 0)
            elif op == 'empty':
                res.append(q.empty() if q else True)
        print(json.dumps(res))
`;
        } else if (/\bdef\s+search\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip().split('\\n')
    func = getattr(Solution(), 'search', None) if 'Solution' in globals() else globals().get('search')
    if len(raw) >= 2:
        nums = json.loads(raw[0]) if '[' in raw[0] else [int(x) for x in raw[0].split()]
        target = int(raw[1].strip())
        print(func(nums, target))
    elif len(raw) == 1:
        parts = raw[0].split()
        nums = json.loads(parts[0]) if '[' in parts[0] else []
        target = int(parts[1]) if len(parts) > 1 else 0
        print(func(nums, target))
`;
        } else if (/\bdef\s+findMax\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    func = getattr(Solution(), 'findMax', None) if 'Solution' in globals() else globals().get('findMax')
    nums = json.loads(raw) if '[' in raw else [int(x) for x in raw.split()]
    print(func(nums))
`;
        } else if (/\bdef\s+productExceptSelf\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    func = getattr(Solution(), 'productExceptSelf', None) if 'Solution' in globals() else globals().get('productExceptSelf')
    nums = json.loads(raw) if '[' in raw else [int(x) for x in raw.split()]
    res = func(nums)
    print(json.dumps(res).replace(' ', ''))
`;
        } else if (/\bdef\s+twoSum\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip().split('\\n')
    if 'Solution' in globals():
        sol = Solution()
        func = getattr(sol, 'twoSum', None)
    else:
        func = twoSum
    if len(raw) >= 2:
        nums = json.loads(raw[0])
        target = int(raw[1].strip())
        print(json.dumps(func(nums, target)))
    elif len(raw) == 1:
        parts = raw[0].split()
        nums = json.loads(parts[0])
        target = int(parts[1])
        print(json.dumps(func(nums, target)))
`;
        } else if (/\bdef\s+solution\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    sol_obj = Solution() if 'Solution' in globals() else None
    func = getattr(sol_obj, 'solution', None) if sol_obj else globals().get('solution')
    if not func:
        sys.exit(1)
    lines = [l.strip() for l in raw.split('\\n') if l.strip()]
    args = []
    for l in lines:
        try:
            args.append(json.loads(l))
        except:
            try:
                args.append(int(l))
            except:
                args.append(l)
    try:
        res = func(*args)
        if isinstance(res, (dict, list)):
            print(json.dumps(res))
        elif res is not None:
            print(res)
    except TypeError:
        res = func(raw)
        if isinstance(res, (dict, list)):
            print(json.dumps(res))
        elif res is not None:
            print(res)
`;
        } else if (/\bdef\s+isPalindrome\s*\(/.test(userCode)) {
          pyDriver = `
import sys

if __name__ == '__main__':
    val = sys.stdin.read().strip()
    if val.startswith('"') and val.endswith('"') and len(val) >= 2:
        val = val[1:-1]
    func = getattr(Solution(), 'isPalindrome', None) if 'Solution' in globals() else isPalindrome
    res = func(val)
    print("true" if res is True or str(res).lower() == 'true' else "false")
`;
        } else if (/\bdef\s+reverseString\s*\(/.test(userCode)) {
          pyDriver = `
import sys

if __name__ == '__main__':
    val = sys.stdin.read().strip()
    func = getattr(Solution(), 'reverseString', None) if 'Solution' in globals() else reverseString
    print(func(val))
`;
        } else if (/\bdef\s+reverseList\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    nums = json.loads(raw) if '[' in raw else []
    func = getattr(Solution(), 'reverseList', None) if 'Solution' in globals() else reverseList

    is_node = False
    try:
        dummy = ListNode(0)
        curr = dummy
        for v in nums:
            curr.next = ListNode(v)
            curr = curr.next
        test_res = func(dummy.next)
        if isinstance(test_res, ListNode) or (test_res is None and not nums):
            res_node = test_res
            res = []
            while res_node:
                res.append(res_node.val)
                res_node = res_node.next
            print(json.dumps(res))
            is_node = True
    except:
        is_node = False

    if not is_node:
        print(json.dumps(func(nums)))
`;
        } else if (/\bdef\s+maxDepth\s*\(/.test(userCode)) {
          pyDriver = `
import sys, json

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    tokens = json.loads(raw) if '[' in raw else []
    func = getattr(Solution(), 'maxDepth', None) if 'Solution' in globals() else maxDepth

    is_tree = False
    try:
        if not tokens or tokens[0] is None:
            root = None
        else:
            root = TreeNode(tokens[0])
            q = [root]
            idx = 1
            while q and idx < len(tokens):
                curr = q.pop(0)
                if idx < len(tokens):
                    if tokens[idx] is not None:
                        curr.left = TreeNode(tokens[idx])
                        q.append(curr.left)
                    idx += 1
                if idx < len(tokens):
                    if tokens[idx] is not None:
                        curr.right = TreeNode(tokens[idx])
                        q.append(curr.right)
                    idx += 1
        res = func(root)
        print(res)
        is_tree = True
    except:
        is_tree = False

    if not is_tree:
        print(func(tokens))
`;
        } else if (/\bdef\s+isValid\s*\(/.test(userCode)) {
          pyDriver = `
import sys

if __name__ == '__main__':
    val = sys.stdin.read().strip()
    if val.startswith('"') and val.endswith('"') and len(val) >= 2:
        val = val[1:-1]
    func = getattr(Solution(), 'isValid', None) if 'Solution' in globals() else isValid
    res = func(val)
    print("true" if res is True or str(res).lower() == 'true' else "false")
`;
        } else {
          pyDriver = `
import sys, json, types

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    args = []
    if raw:
        lines = [l.strip() for l in raw.split('\\n') if l.strip()]
        for line in lines:
            try:
                args.append(json.loads(line))
            except:
                try:
                    args.append(float(line) if '.' in line else int(line))
                except:
                    args.append(line)
    
    if 'Solution' in globals():
        sol = Solution()
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        if methods:
            func = getattr(sol, methods[0])
            res = func(*args)
            if isinstance(res, (dict, list)):
                print(json.dumps(res))
            elif isinstance(res, bool):
                print("true" if res else "false")
            else:
                print(res)
            sys.exit(0)

    funcs = [obj for name, obj in list(globals().items()) if isinstance(obj, types.FunctionType) and getattr(obj, '__module__', None) == '__main__']
    if funcs:
        res = funcs[-1](*args)
        if isinstance(res, (dict, list)):
            print(json.dumps(res))
        elif isinstance(res, bool):
            print("true" if res else "false")
        else:
            print(res)
`;
        }
        finalCode = userCode + '\n' + pyDriver;
      }
    }

    return finalCode;
  };

  // -------------------------------------------------------------
  // 1. Python, C, C++, Java External Execution
  // -------------------------------------------------------------
  if (lang === 'python' || lang === 'py' || lang === 'c' || lang === 'cpp' || lang === 'c++' || lang === 'java') {
    const uniqueId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = path.join(os.tmpdir(), uniqueId);

    try {
      fs.mkdirSync(tempDir, { recursive: true });
      let exePath = '';
      let isCompiled = false;

      // Prepare files and compile if needed
      if (lang === 'python' || lang === 'py') {
        const pyFile = path.join(tempDir, 'solution.py');
        fs.writeFileSync(pyFile, injectHarnessIfNeeded(code, 'python'));
        exePath = pyFile;
      } else if (lang === 'c') {
        const cFile = path.join(tempDir, 'solution.c');
        const cExe = path.join(tempDir, 'solution.exe');
        fs.writeFileSync(cFile, injectHarnessIfNeeded(code, 'c'));
        const comp = spawnSync('gcc', ['-O2', cFile, '-o', cExe], { encoding: 'utf-8', timeout: 6000 });
        if (comp.status !== 0) {
          process.send({
            success: false,
            verdict: 'Compilation Error',
            compileError: comp.stderr || 'GCC Compilation Error',
            results: [],
            consoleLogs: [],
          });
          try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
          return;
        }
        exePath = cExe;
        isCompiled = true;
      } else if (lang === 'cpp' || lang === 'c++') {
        const cppFile = path.join(tempDir, 'solution.cpp');
        const cppExe = path.join(tempDir, 'solution.exe');
        fs.writeFileSync(cppFile, injectHarnessIfNeeded(code, 'cpp'));
        const comp = spawnSync('g++', ['-std=c++14', '-O2', cppFile, '-o', cppExe], { encoding: 'utf-8', timeout: 7000 });
        if (comp.status !== 0) {
          process.send({
            success: false,
            verdict: 'Compilation Error',
            compileError: comp.stderr || 'G++ Compilation Error',
            results: [],
            consoleLogs: [],
          });
          try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
          return;
        }
        exePath = cppExe;
        isCompiled = true;
      } else if (lang === 'java') {
        // Find public class or default to Solution
        const javaFile = path.join(tempDir, 'Solution.java');
        fs.writeFileSync(javaFile, code);
        const comp = spawnSync('javac', [javaFile], { encoding: 'utf-8', timeout: 8000 });
        if (comp.status !== 0) {
          process.send({
            success: false,
            verdict: 'Compilation Error',
            compileError: comp.stderr || 'Java Compilation Error',
            results: [],
            consoleLogs: [],
          });
          try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
          return;
        }
        isCompiled = true;
      }

      let totalExecutionTime = 0;

      // Run against all test cases
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let inputData = tc.input || '';
        if (lang === 'c') {
          if (inputData.trim().startsWith('[') && !inputData.includes('"(')) {
            inputData = inputData.replace(/[\[\],]/g, ' ');
          }
        }

        const start = performance.now();
        let runRes;

        if (lang === 'python' || lang === 'py') {
          const pyBin = getPythonBinary();
          runRes = spawnSync(pyBin, [exePath], {
            input: inputData,
            encoding: 'utf-8',
            timeout: timeLimitMs,
          });
        } else if (lang === 'c' || lang === 'cpp' || lang === 'c++') {
          runRes = spawnSync(exePath, [], {
            input: inputData,
            encoding: 'utf-8',
            timeout: timeLimitMs,
          });
        } else if (lang === 'java') {
          runRes = spawnSync('java', ['-cp', tempDir, 'Solution'], {
            input: inputData,
            encoding: 'utf-8',
            timeout: timeLimitMs,
          });
        }

        const elapsed = Math.round((performance.now() - start) * 100) / 100;
        totalExecutionTime += elapsed;

        if (runRes.error && runRes.error.code === 'ETIMEDOUT') {
          results.push({
            testCaseId: tc._id || null,
            testIndex: i + 1,
            passed: false,
            status: 'Time Limit Exceeded',
            executionTime: timeLimitMs,
            memoryUsage: 32,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            error: 'Time Limit Exceeded',
            isHidden: !!tc.isHidden,
          });
          break;
        }

        const actualOut = normalize(runRes.stdout);
        if (runRes.stderr) {
          userConsoleLogs.push(runRes.stderr.trim());
        }

        const isPassed = matchesExpected(actualOut, tc.expectedOutput);
        const status = runRes.status !== 0 ? 'Runtime Error' : (isPassed ? 'Accepted' : 'Wrong Answer');

        results.push({
          testCaseId: tc._id || null,
          testIndex: i + 1,
          passed: isPassed && runRes.status === 0,
          status,
          executionTime: elapsed,
          memoryUsage: 28,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: actualOut,
          error: runRes.status !== 0 ? (runRes.stderr || 'Runtime Error') : '',
          isHidden: !!tc.isHidden,
        });
      }

      // Cleanup temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      let overallVerdict = 'Accepted';
      const failedCase = results.find((r) => !r.passed);
      if (failedCase) {
        overallVerdict = failedCase.status;
      }

      process.send({
        success: true,
        verdict: overallVerdict,
        results,
        totalExecutionTime: Math.round(totalExecutionTime * 100) / 100,
        memoryUsage: 32,
        consoleLogs: userConsoleLogs,
      });
      return;
    } catch (runnerErr) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}
      process.send({
        success: false,
        verdict: 'Runtime Error',
        compileError: runnerErr.message,
        results: [],
        consoleLogs: userConsoleLogs,
      });
      return;
    }
  }

  // -------------------------------------------------------------
  // 2. JavaScript Node VM In-Memory Execution
  // -------------------------------------------------------------
  try {
    const sandboxConsole = {
      log: (...args) => {
        userConsoleLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      warn: (...args) => {
        userConsoleLogs.push('[WARN] ' + args.join(' '));
      },
      error: (...args) => {
        userConsoleLogs.push('[ERROR] ' + args.join(' '));
      },
    };

    const sandbox = {
      console: sandboxConsole,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      Math,
      Set,
      Map,
      WeakMap,
      WeakSet,
      JSON,
      RegExp,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Infinity,
      NaN,
      undefined,
    };

    vm.createContext(sandbox);

    let script;
    try {
      script = new vm.Script(code, {
        filename: 'candidate_solution.js',
        timeout: timeLimitMs,
      });
      script.runInContext(sandbox, { timeout: timeLimitMs });
    } catch (compileErr) {
      process.send({
        success: false,
        compileError: compileErr.message,
        verdict: 'Compilation Error',
        results: [],
        consoleLogs: userConsoleLogs,
      });
      return;
    }

    const functionNames = [
      'batchOrders', 'detectDuplicateTransactions', 'searchCatalog', 'mergeUserFeeds',
      'balanceAxleLoads', 'calculateConceptMastery',
      'twoSum', 'productExceptSelf', 'isPalindrome', 'reverseList', 'isValid', 'MyQueue', 'maxDepth',
      'lengthOfLongestSubstring', 'threeSum', 'coinChange', 'numIslands',
      'merge', 'search', 'trap', 'deepClone', 'ladderLength', 'LRUCache',
      'reverseString', 'findMax',
      'solution', 'solve', 'main'
    ];

    let entryFunc = null;
    for (const name of functionNames) {
      if (typeof sandbox[name] === 'function') {
        entryFunc = sandbox[name];
        break;
      }
    }

    const builtInGlobals = new Set([
      'console', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date',
      'Math', 'Set', 'Map', 'WeakMap', 'WeakSet', 'JSON', 'RegExp',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Infinity', 'NaN', 'undefined'
    ]);

    if (!entryFunc) {
      for (const key of Object.keys(sandbox)) {
        if (!builtInGlobals.has(key) && typeof sandbox[key] === 'function' && !sandboxConsole[key]) {
          entryFunc = sandbox[key];
          break;
        }
      }
    }

    if (!entryFunc) {
      process.send({
        success: false,
        compileError: 'No callable function found. Please define function solution(input) or matching problem name.',
        verdict: 'Compilation Error',
        results: [],
        consoleLogs: userConsoleLogs,
      });
      return;
    }

    const parseTestInput = (rawInput) => {
      const lines = rawInput.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      return lines.map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          const num = Number(line);
          return isNaN(num) ? line : num;
        }
      });
    };

    let totalExecutionTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const parsedArgs = parseTestInput(tc.input);

      const startTime = performance.now();
      let actualOutput;
      let passed = false;
      let status = 'Accepted';
      let errorMsg = '';

      try {
        actualOutput = entryFunc.apply(null, parsedArgs);
        const elapsed = performance.now() - startTime;
        totalExecutionTime += elapsed;

        const normalizedActual = typeof actualOutput === 'object' ? JSON.stringify(actualOutput) : String(actualOutput).trim();
        const compactActual = normalizedActual.replace(/\s+/g, '');
        const compactExpected = tc.expectedOutput.replace(/\s+/g, '').trim();

        if (compactActual === compactExpected) {
          passed = true;
          status = 'Accepted';
        } else {
          passed = false;
          status = 'Wrong Answer';
        }

        results.push({
          testCaseId: tc._id || null,
          testIndex: i + 1,
          passed,
          status,
          executionTime: Math.round(elapsed * 100) / 100,
          memoryUsage: Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: normalizedActual,
          error: '',
          isHidden: !!tc.isHidden,
        });
      } catch (err) {
        const elapsed = performance.now() - startTime;
        totalExecutionTime += elapsed;
        const isTimeout = err.message && (err.message.includes('timed out') || elapsed >= timeLimitMs);
        status = isTimeout ? 'Time Limit Exceeded' : 'Runtime Error';
        errorMsg = err.message || 'Execution error';

        results.push({
          testCaseId: tc._id || null,
          testIndex: i + 1,
          passed: false,
          status,
          executionTime: Math.round(elapsed * 100) / 100,
          memoryUsage: Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: errorMsg,
          isHidden: !!tc.isHidden,
        });

        if (isTimeout) break;
      }
    }

    let overallVerdict = 'Accepted';
    const failedCase = results.find((r) => !r.passed);
    if (failedCase) {
      overallVerdict = failedCase.status;
    }

    process.send({
      success: true,
      verdict: overallVerdict,
      results,
      totalExecutionTime: Math.round(totalExecutionTime * 100) / 100,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10,
      consoleLogs: userConsoleLogs,
    });
  } catch (globalErr) {
    process.send({
      success: false,
      verdict: 'Runtime Error',
      compileError: globalErr.message,
      results: [],
      consoleLogs: userConsoleLogs,
    });
  }
});
