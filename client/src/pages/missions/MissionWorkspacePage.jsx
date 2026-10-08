import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  ArrowLeft,
  Briefcase,
  Play,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Code2,
  ShieldAlert,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

export const MissionWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { success, error, info } = useToast();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Left panel tabs
  const [activeLeftTab, setActiveLeftTab] = useState('scenario'); // 'scenario' | 'specs' | 'review'
  const [mobileTab, setMobileTab] = useState('specs'); // 'specs' | 'code' (for mobile/tablet screens)

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outputTab, setOutputTab] = useState('testcases'); // 'testcases' | 'output'
  const [runResults, setRunResults] = useState(null);
  const [architectureReview, setArchitectureReview] = useState(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Language templates & runtime labels
  // Multi-Language Starter Templates & Verified Solutions
  const MISSION_TEMPLATES = {
    'food-delivery-order-batching': {
      cpp: {
        starter: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>

using namespace std;

struct Order {
    string id;
    string restaurantId;
    long long orderTime;
};

class Solution {
public:
    /**
     * Groups customer orders originating from the same kitchen within a prep window.
     *
     * @param orders List of customer orders
     * @param maxBatchSize Maximum orders allowed per courier batch
     * @param maxTimeGapMs Maximum time difference (ms) between orders in a batch
     * @return Batches of order IDs
     */
    vector<vector<string>> batchOrders(const vector<Order>& orders, int maxBatchSize, long long maxTimeGapMs) {
        // TODO: Group orders by restaurantId and time window
        return {};
    }
};`,
        solution: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>

using namespace std;

struct Order {
    string id;
    string restaurantId;
    long long orderTime;
};

class Solution {
public:
    vector<vector<string>> batchOrders(const vector<Order>& orders, int maxBatchSize, long long maxTimeGapMs) {
        map<string, vector<Order>> restaurantMap;
        for (const auto& ord : orders) {
            restaurantMap[ord.restaurantId].push_back(ord);
        }

        vector<vector<string>> allBatches;

        for (auto& pair : restaurantMap) {
            auto& restOrders = pair.second;
            sort(restOrders.begin(), restOrders.end(), [](const Order& a, const Order& b) {
                return a.orderTime < b.orderTime;
            });

            vector<string> currentBatch;
            long long batchStartTime = 0;

            for (const auto& ord : restOrders) {
                if (currentBatch.empty()) {
                    currentBatch.push_back(ord.id);
                    batchStartTime = ord.orderTime;
                } else {
                    if (currentBatch.size() < (size_t)maxBatchSize && (ord.orderTime - batchStartTime) <= maxTimeGapMs) {
                        currentBatch.push_back(ord.id);
                    } else {
                        allBatches.push_back(currentBatch);
                        currentBatch.clear();
                        currentBatch.push_back(ord.id);
                        batchStartTime = ord.orderTime;
                    }
                }
            }

            if (!currentBatch.empty()) {
                allBatches.push_back(currentBatch);
            }
        }

        return allBatches;
    }
};`
      },
      python: {
        starter: `def batchOrders(orders, maxBatchSize, maxTimeGapMs):
    """
    Groups orders by restaurantId within sliding prep time window.
    """
    # TODO: Implement order batching logic
    return []`,
        solution: `from collections import defaultdict

def batchOrders(orders, maxBatchSize, maxTimeGapMs):
    rest_map = defaultdict(list)
    for o in orders:
        rest_map[o['restaurantId']].append(o)

    all_batches = []
    for r_id, r_orders in rest_map.items():
        r_orders.sort(key=lambda x: x['orderTime'])
        curr = []
        start_t = 0
        for o in r_orders:
            if not curr:
                curr.append(o['id'])
                start_t = o['orderTime']
            elif len(curr) < maxBatchSize and (o['orderTime'] - start_t) <= maxTimeGapMs:
                curr.append(o['id'])
            else:
                all_batches.append(curr)
                curr = [o['id']]
                start_t = o['orderTime']
        if curr:
            all_batches.append(curr)
    return all_batches`
      }
    },
    'fintech-payment-deduplication': {
      cpp: {
        starter: `#include <iostream>
#include <vector>
#include <string>
#include <map>

using namespace std;

struct Transaction {
    string id;
    string userId;
    string merchantId;
    long long amountInCents;
    long long timestamp;
};

class Solution {
public:
    vector<string> detectDuplicateTransactions(const vector<Transaction>& transactions, long long timeWindowMs) {
        // TODO: Detect sliding window duplicate transaction IDs
        return {};
    }
};`,
        solution: `#include <iostream>
#include <vector>
#include <string>
#include <map>

using namespace std;

struct Transaction {
    string id;
    string userId;
    string merchantId;
    long long amountInCents;
    long long timestamp;
};

class Solution {
public:
    vector<string> detectDuplicateTransactions(const vector<Transaction>& transactions, long long timeWindowMs) {
        vector<string> duplicates;
        map<string, long long> history;

        for (const auto& tx : transactions) {
            string key = tx.userId + "_" + tx.merchantId + "_" + to_string(tx.amountInCents);
            auto it = history.find(key);
            if (it != history.end() && (tx.timestamp - it->second) <= timeWindowMs) {
                duplicates.push_back(tx.id);
            } else {
                history[key] = tx.timestamp;
            }
        }

        return duplicates;
    }
};`
      },
      python: {
        starter: `def detectDuplicateTransactions(transactions, timeWindowMs):
    duplicates = []
    # TODO: Detect duplicate transactions in sliding window
    return duplicates`,
        solution: `def detectDuplicateTransactions(transactions, timeWindowMs):
    duplicates = []
    history = {}
    for tx in transactions:
        key = f"{tx['userId']}_{tx['merchantId']}_{tx['amountInCents']}"
        if key in history and (tx['timestamp'] - history[key]) <= timeWindowMs:
            duplicates.append(tx['id'])
        else:
            history[key] = tx['timestamp']
    return duplicates`
      }
    },
    'ecommerce-product-search-index': {
      cpp: {
        starter: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

struct Product {
    string id;
    string title;
    double price;
    double rating;
};

class Solution {
public:
    vector<string> searchCatalog(const vector<Product>& products, const string& query, double maxPrice, int limit) {
        // TODO: Build token index and filter by maxPrice and rating
        return {};
    }
};`,
        solution: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <set>
#include <algorithm>
#include <cctype>

using namespace std;

struct Product {
    string id;
    string title;
    double price;
    double rating;
};

class Solution {
public:
    vector<string> searchCatalog(const vector<Product>& products, const string& query, double maxPrice, int limit) {
        auto cleanWord = [](string str) {
            string res = "";
            for (char c : str) {
                if (isalnum((unsigned char)c)) res += tolower((unsigned char)c);
                else res += ' ';
            }
            stringstream ss(res);
            vector<string> tokens;
            string word;
            while (ss >> word) tokens.push_back(word);
            return tokens;
        };

        vector<string> qTokens = cleanWord(query);
        if (qTokens.empty()) return {};

        vector<Product> matched;
        for (const auto& item : products) {
            if (item.price > maxPrice) continue;
            vector<string> tTokens = cleanWord(item.title);
            set<string> tSet(tTokens.begin(), tTokens.end());
            bool allFound = true;
            for (const auto& qt : qTokens) {
                if (tSet.find(qt) == tSet.end()) {
                    allFound = false;
                    break;
                }
            }
            if (allFound) matched.push_back(item);
        }

        sort(matched.begin(), matched.end(), [](const Product& a, const Product& b) {
            if (a.rating != b.rating) return a.rating > b.rating;
            return a.price < b.price;
        });

        vector<string> result;
        for (int i = 0; i < (int)matched.size() && i < limit; ++i) {
            result.push_back(matched[i].id);
        }
        return result;
    }
};`
      },
      python: {
        starter: `def searchCatalog(products, query, maxPrice, limit):
    # TODO: Build token index and filter by maxPrice and rating
    return []`,
        solution: `import re

def searchCatalog(products, query, maxPrice, limit):
    def clean_tokens(s):
        return set(re.findall(r'[a-zA-Z0-9]+', s.lower()))

    q_tokens = clean_tokens(query)
    if not q_tokens:
        return []

    matched = []
    for item in products:
        if item.get('price', 0) > maxPrice:
            continue
        item_tokens = clean_tokens(item.get('title', ''))
        if q_tokens.issubset(item_tokens):
            matched.append(item)

    matched.sort(key=lambda x: (-x.get('rating', 0), x.get('price', 0)))
    return [p['id'] for p in matched[:limit]]`
      }
    },
    'social-media-feed-merger': {
      cpp: {
        starter: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>

using namespace std;

struct Post {
    string id;
    string authorId;
    long long timestamp;
    double baseScore;
};

class Solution {
public:
    vector<string> mergeUserFeeds(const vector<vector<Post>>& friendStreams, const unordered_map<string, double>& affinityScores, int limit) {
        // TODO: Merge friendStreams and rank posts by finalScore descending
        return {};
    }
};`,
        solution: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

struct Post {
    string id;
    string authorId;
    long long timestamp;
    double baseScore;
};

struct ScoredPost {
    string id;
    long long timestamp;
    double finalScore;
};

class Solution {
public:
    vector<string> mergeUserFeeds(const vector<vector<Post>>& friendStreams, const unordered_map<string, double>& affinityScores, int limit) {
        vector<ScoredPost> allPosts;
        for (const auto& stream : friendStreams) {
            for (const auto& post : stream) {
                double multiplier = 1.0;
                auto it = affinityScores.find(post.authorId);
                if (it != affinityScores.end()) {
                    multiplier = it->second;
                }
                allPosts.push_back({post.id, post.timestamp, post.baseScore * multiplier});
            }
        }

        sort(allPosts.begin(), allPosts.end(), [](const ScoredPost& a, const ScoredPost& b) {
            if (a.finalScore != b.finalScore) return a.finalScore > b.finalScore;
            return a.timestamp > b.timestamp;
        });

        vector<string> result;
        for (int i = 0; i < (int)allPosts.size() && i < limit; ++i) {
            result.push_back(allPosts[i].id);
        }
        return result;
    }
};`
      },
      python: {
        starter: `def mergeUserFeeds(friendStreams, affinityScores, limit):
    # TODO: Merge friendStreams and rank by finalScore descending
    return []`,
        solution: `def mergeUserFeeds(friendStreams, affinityScores, limit):
    all_posts = []
    for stream in friendStreams:
        for post in stream:
            multiplier = affinityScores.get(post['authorId'], 1.0)
            all_posts.append({
                'id': post['id'],
                'timestamp': post['timestamp'],
                'finalScore': post['baseScore'] * multiplier
            })

    all_posts.sort(key=lambda p: (-p['finalScore'], -p['timestamp']))
    return [p['id'] for p in all_posts[:limit]]`
      }
    },
    'logistics-truck-loading-balancer': {
      cpp: {
        starter: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

struct Package {
    string id;
    double weightKg;
};

struct BalanceResult {
    bool success;
    double diffKg;
    vector<string> front;
    vector<string> rear;
};

class Solution {
public:
    BalanceResult balanceAxleLoads(const vector<Package>& packages, double maxAxleLimit) {
        // TODO: Partition packages minimizing axle discrepancy
        return {false, -1, {}, {}};
    }
};`,
        solution: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cmath>

using namespace std;

struct Package {
    string id;
    double weightKg;
};

struct BalanceResult {
    bool success;
    double diffKg;
    vector<string> front;
    vector<string> rear;
};

class Solution {
public:
    BalanceResult balanceAxleLoads(const vector<Package>& packages, double maxAxleLimit) {
        double total = 0;
        for (const auto& p : packages) {
            if (p.weightKg > maxAxleLimit) return {false, -1, {}, {}};
            total += p.weightKg;
        }
        if (total > maxAxleLimit * 2) return {false, -1, {}, {}};

        vector<Package> sortedPkgs = packages;
        sort(sortedPkgs.begin(), sortedPkgs.end(), [](const Package& a, const Package& b) {
            return a.weightKg > b.weightKg;
        });

        double frontWeight = 0, rearWeight = 0;
        vector<string> front, rear;

        for (const auto& p : sortedPkgs) {
            if (frontWeight <= rearWeight && frontWeight + p.weightKg <= maxAxleLimit) {
                front.push_back(p.id);
                frontWeight += p.weightKg;
            } else if (rearWeight + p.weightKg <= maxAxleLimit) {
                rear.push_back(p.id);
                rearWeight += p.weightKg;
            } else if (frontWeight + p.weightKg <= maxAxleLimit) {
                front.push_back(p.id);
                frontWeight += p.weightKg;
            } else {
                return {false, -1, {}, {}};
            }
        }

        return {true, fabs(frontWeight - rearWeight), front, rear};
    }
};`
      },
      python: {
        starter: `def balanceAxleLoads(packages, maxAxleLimit):
    # TODO: Partition packages minimizing axle delta
    return {'success': False, 'diffKg': -1, 'front': [], 'rear': []}`,
        solution: `def balanceAxleLoads(packages, maxAxleLimit):
    total = sum(p['weightKg'] for p in packages)
    if total > maxAxleLimit * 2:
        return {'success': False, 'diffKg': -1, 'front': [], 'rear': []}
    for p in packages:
        if p['weightKg'] > maxAxleLimit:
            return {'success': False, 'diffKg': -1, 'front': [], 'rear': []}

    sorted_pkgs = sorted(packages, key=lambda p: p['weightKg'], reverse=True)
    front, rear = [], []
    front_w, rear_w = 0, 0

    for p in sorted_pkgs:
        w = p['weightKg']
        if front_w <= rear_w and front_w + w <= maxAxleLimit:
            front.append(p['id'])
            front_w += w
        elif rear_w + w <= maxAxleLimit:
            rear.append(p['id'])
            rear_w += w
        elif front_w + w <= maxAxleLimit:
            front.append(p['id'])
            front_w += w
        else:
            return {'success': False, 'diffKg': -1, 'front': [], 'rear': []}

    return {
        'success': True,
        'diffKg': abs(front_w - rear_w),
        'front': front,
        'rear': rear
    }`
      }
    },
    'edtech-concept-mastery-engine': {
      cpp: {
        starter: `#include <iostream>
#include <vector>
#include <string>
#include <map>

using namespace std;

struct ConceptAttempt {
    string conceptId;
    bool isCorrect;
    int timeSpentSec;
    long long timestamp;
};

struct ConceptSummary {
    int masteryPercentage;
    int totalAttempts;
    string status;
};

class Solution {
public:
    map<string, ConceptSummary> calculateConceptMastery(const vector<ConceptAttempt>& attempts) {
        // TODO: Compute adaptive spaced repetition mastery
        return {};
    }
};`,
        solution: `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>

using namespace std;

struct ConceptAttempt {
    string conceptId;
    bool isCorrect;
    int timeSpentSec;
    long long timestamp;
};

struct ConceptSummary {
    int masteryPercentage;
    int totalAttempts;
    string status;
};

class Solution {
public:
    map<string, ConceptSummary> calculateConceptMastery(const vector<ConceptAttempt>& attempts) {
        vector<ConceptAttempt> sortedAtt = attempts;
        sort(sortedAtt.begin(), sortedAtt.end(), [](const ConceptAttempt& a, const ConceptAttempt& b) {
            return a.timestamp < b.timestamp;
        });

        map<string, ConceptSummary> summary;
        for (const auto& att : sortedAtt) {
            if (summary.find(att.conceptId) == summary.end()) {
                summary[att.conceptId] = {50, 0, "In Progress"};
            }
            auto& s = summary[att.conceptId];
            s.totalAttempts += 1;

            int delta = att.isCorrect ? 10 : -15;
            if (att.isCorrect && att.timeSpentSec < 30) {
                delta += 5;
            }

            s.masteryPercentage = max(0, min(100, s.masteryPercentage + delta));
            if (s.masteryPercentage >= 80) s.status = "Mastered";
            else if (s.masteryPercentage >= 50) s.status = "In Progress";
            else s.status = "Needs Review";
        }

        return summary;
    }
};`
      },
      python: {
        starter: `def calculateConceptMastery(attempts):
    # TODO: Compute adaptive spaced repetition mastery
    return {}`,
        solution: `def calculateConceptMastery(attempts):
    concepts = {}
    sorted_att = sorted(attempts, key=lambda x: x.get('timestamp', 0))
    for att in sorted_att:
        c_id = att['conceptId']
        if c_id not in concepts:
            concepts[c_id] = {
                'masteryPercentage': 50,
                'totalAttempts': 0,
                'status': 'In Progress'
            }
        c = concepts[c_id]
        c['totalAttempts'] += 1
        delta = 10 if att.get('isCorrect') else -15
        if att.get('isCorrect') and att.get('timeSpentSec', 999) < 30:
            delta += 5
        c['masteryPercentage'] = max(0, min(100, c['masteryPercentage'] + delta))
        if c['masteryPercentage'] >= 80:
            c['status'] = 'Mastered'
        elif c['masteryPercentage'] >= 50:
            c['status'] = 'In Progress'
        else:
            c['status'] = 'Needs Review'
    return concepts`
      }
    }
  };

  // Language templates & runtime labels
  const getLanguageStarter = (lang, currentMission) => {
    const slug = currentMission?.slug || '';
    if (MISSION_TEMPLATES[slug]?.[lang]?.starter) {
      return MISSION_TEMPLATES[slug][lang].starter;
    }
    if (currentMission?.starterCode && currentMission.starterCode[lang]) {
      return currentMission.starterCode[lang];
    }
    const defaultTemplates = {
      javascript: currentMission?.starterCode?.javascript || `// Solution in JavaScript (Node.js)\nfunction solution(input) {\n  return input;\n}`,
      python: `def solution(input):\n    return input`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    // Solution code\n};`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    return 0;\n}`,
    };
    return defaultTemplates[lang] || '// Write your mission solution here\n';
  };

  const getLanguageSolution = (lang, currentMission) => {
    const slug = currentMission?.slug || '';
    if (MISSION_TEMPLATES[slug]?.[lang]?.solution) {
      return MISSION_TEMPLATES[slug][lang].solution;
    }
    if (currentMission?.solutionCode && currentMission.solutionCode[lang]) {
      return currentMission.solutionCode[lang];
    }
    if (lang === 'javascript' && currentMission?.solutionCode?.javascript) {
      return currentMission.solutionCode.javascript;
    }
    return null;
  };

  const getRuntimeLabel = (lang) => {
    switch (lang) {
      case 'python':
        return '(Python 3.11 Runtime)';
      case 'cpp':
        return '(GCC C++ 17 Runtime)';
      case 'java':
        return '(OpenJDK 17 Runtime)';
      case 'c':
        return '(GCC C Runtime)';
      case 'javascript':
      default:
        return '(Node.js 18 Runtime)';
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getLanguageStarter(newLang, mission));
    info(`Switched environment to ${newLang === 'cpp' ? 'C++ 17' : newLang.toUpperCase()}`);
  };

  const handleResetCode = () => {
    setCode(getLanguageStarter(language, mission));
    info(`Reset editor to default ${language === 'cpp' ? 'C++ 17' : language.toUpperCase()} template`);
  };

  const handleLoadSolution = () => {
    const sol = getLanguageSolution(language, mission);
    if (sol) {
      setCode(sol);
      success(`Loaded verified ${language === 'cpp' ? 'C++ 17' : language.toUpperCase()} reference solution.`);
    } else {
      info(`Reference solution for ${language.toUpperCase()} will be provided in next release.`);
    }
  };

  useEffect(() => {
    const fetchMission = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/missions/${id}`);
        if (res.success && res.mission) {
          setMission(res.mission);
          setCode(getLanguageStarter(language, res.mission));
        } else {
          error('Mission not found');
        }
      } catch (err) {
        error(err.message || 'Error loading mission');
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Run benchmark against public test cases
  const handleRunBenchmark = async () => {
    if (!mission?._id) return;
    setMobileTab('code');
    setIsRunning(true);
    setOutputTab('output');

    try {
      const res = await api.post(`/missions/${mission._id}/run`, {
        code,
        language,
      });

      setRunResults(res);
      if (res.verdict === 'Accepted') {
        success('Public test benchmarks cleared! Ready to submit to architecture panel.');
      } else {
        info(`Benchmark verdict: ${res.verdict}`);
      }
    } catch (err) {
      error(err.message || 'Error running benchmark');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit to full test suite & architecture review
  const handleSubmitMission = async () => {
    if (!isAuthenticated) {
      error('Please sign in to submit your solution for review');
      navigate('/login');
      return;
    }

    setMobileTab('code');
    setIsSubmitting(true);
    setOutputTab('output');

    try {
      const res = await api.post(`/missions/${mission._id}/submit`, {
        code,
        language,
      });

      setRunResults(res);
      if (res.review) {
        setArchitectureReview(res.review);
        setActiveLeftTab('review');
      }

      if (res.allPassed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        success('Mission Cleared! Production Readiness review generated.');
      } else {
        error(`Failed ${res.totalCount - res.passedCount} test cases. Review telemetry.`);
      }
    } catch (err) {
      error(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <Sparkles size={36} className="animate-spin" color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
        <h2>Initializing Company Mission Environment...</h2>
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Mission Not Found</h2>
        <Link to="/missions" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Missions
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 65px)',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '0.65rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          zIndex: 20,
        }}
      >
        {/* Left: Navigation and Mission Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to="/missions"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '0.3rem',
              borderRadius: '6px',
            }}
            title="Back to Mission Catalog"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--accent-primary)',
                }}
              >
                {mission.companyName}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{mission.title}</span>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                {mission.domain}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Mobile Screen Segmented Switcher */}
          <div className="flex lg:hidden items-center bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-primary)]">
            <button
              onClick={() => setMobileTab('specs')}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mobileTab === 'specs' ? 'var(--accent-primary)' : 'transparent',
                color: mobileTab === 'specs' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              📋 Specs
            </button>
            <button
              onClick={() => setMobileTab('code')}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mobileTab === 'code' ? 'var(--accent-primary)' : 'transparent',
                color: mobileTab === 'code' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              💻 Code
            </button>
          </div>

          {/* Mission Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            <Clock size={14} color="var(--accent-primary)" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          {/* Run Benchmark */}
          <button
            onClick={handleRunBenchmark}
            disabled={isRunning || isSubmitting}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Benchmarking...' : 'Run Benchmark'}</span>
          </button>

          {/* Submit / Deploy to Panel */}
          <button
            onClick={handleSubmitMission}
            disabled={isSubmitting || isRunning}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Sparkles size={14} />
            <span>{isSubmitting ? 'Evaluating...' : 'Deploy & Review'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left (Scenario & Context), Right (Monaco Editor & Console) */}
      <div className="mission-workspace-grid">
        {/* ==============================================
            LEFT PANE: BUSINESS CONTEXT & SPECS
           ============================================== */}
        <div
          className={`${mobileTab === 'specs' ? 'flex' : 'hidden'} lg:flex`}
          style={{
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            borderRight: '1px solid var(--border-primary)',
            overflow: 'hidden',
          }}
        >
          {/* Left Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              padding: '0 1rem',
            }}
          >
            <button
              onClick={() => setActiveLeftTab('scenario')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'scenario' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'scenario' ? '2px solid var(--accent-primary)' : 'none',
              }}
            >
              🏢 Company Scenario
            </button>

            <button
              onClick={() => setActiveLeftTab('specs')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'specs' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'specs' ? '2px solid var(--accent-primary)' : 'none',
              }}
            >
              📋 Technical Specs & Bounds
            </button>

            <button
              onClick={() => setActiveLeftTab('review')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeLeftTab === 'review' ? '#a855f7' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'review' ? '2px solid #a855f7' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={14} />
              <span>AI Architecture Review</span>
              {architectureReview && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />}
            </button>
          </div>

          {/* Left Content Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* TAB 1: COMPANY SCENARIO */}
            {activeLeftTab === 'scenario' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Background Scenario */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <Building2 size={18} color="var(--accent-primary)" />
                    <span>Company Background: {mission.companyName}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                    {mission.companyScenario}
                  </p>
                </div>

                {/* Real-World Business Problem (The WHY) */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>
                    <DollarSign size={18} />
                    <span>The Financial & Business Impact</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                    {mission.businessProblem}
                  </p>
                </div>

                {/* Expected Behavior */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <Layers size={18} color="var(--accent-primary)" />
                    <span>Expected Contract & Behavior</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                    {mission.expectedBehavior}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: TECHNICAL SPECS & BOUNDS */}
            {activeLeftTab === 'specs' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Technical Requirements */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
                    Engineering Requirements
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {mission.technicalRequirements?.map((r, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Constraints */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f59e0b' }}>
                    System Constraints & Bounds
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {mission.constraints?.map((c, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Evaluation Criteria */}
                <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Architecture Evaluation Weights
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {mission.evaluationCriteria?.map((crit, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span>{crit.name}</span>
                        <span className="badge badge-info">{crit.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI ARCHITECTURE REVIEW */}
            {activeLeftTab === 'review' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {architectureReview ? (
                  <>
                    {/* Header Score Card */}
                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '0.85rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-secondary)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                        Production Readiness Score
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', margin: '0.25rem 0' }}>
                        {architectureReview.readinessScore}/100
                      </div>
                      <span
                        className={`badge ${
                          architectureReview.readinessScore >= 80 ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {architectureReview.verdictRating}
                      </span>
                    </div>

                    {/* Architectural Summary */}
                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Architectural Trade-offs
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {architectureReview.architecturalSummary}
                      </p>
                    </div>

                    {/* Scalability Under 100x Burst */}
                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#06b6d4' }}>
                        Scalability Under 100x Burst
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {architectureReview.scalabilityAnalysis}
                      </p>
                    </div>

                    {/* Fault Tolerance */}
                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#10b981' }}>
                        Resilience & Fault Tolerance
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {architectureReview.resilienceAndFaultTolerance}
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f59e0b' }}>
                        Principal Architect Recommendations
                      </h4>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {architectureReview.keyRecommendations?.map((rec, i) => (
                          <li key={i} style={{ marginBottom: '0.35rem' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Sparkles size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>No Review Generated Yet</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                      Deploy and submit your solution to receive a comprehensive Principal Architect production evaluation.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==============================================
            RIGHT PANE: LIVE MONACO CODE & SANDBOX
           ============================================== */}
        <div
          className={`${mobileTab === 'code' ? 'flex' : 'hidden'} lg:flex`}
          style={{
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            overflow: 'hidden',
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mission Code Sandbox</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{getRuntimeLabel(language)}</span>

              {/* Language Selector Dropdown */}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginLeft: '0.5rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java 17</option>
                <option value="c">C (GCC)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={handleLoadSolution}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  borderRadius: '5px',
                  padding: '0.2rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                }}
                title="Load verified passing solution for this language"
              >
                <Sparkles size={13} />
                <span>Verified Solution</span>
              </button>
              <button
                onClick={handleResetCode}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '5px',
                  padding: '0.2rem 0.55rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                }}
                title="Reset to starter code"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, minHeight: '320px', position: 'relative' }}>
            <Editor
              height="100%"
              language={language === 'c' ? 'c' : language}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Bottom Execution & Benchmark Drawer */}
          <div
            style={{
              height: '230px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              <button
                onClick={() => setOutputTab('testcases')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: outputTab === 'testcases' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: outputTab === 'testcases' ? '2px solid var(--accent-primary)' : 'none',
                }}
              >
                Sample Benchmarks ({mission.testCases?.length || 0})
              </button>

              <button
                onClick={() => setOutputTab('output')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: outputTab === 'output' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: outputTab === 'output' ? '2px solid var(--accent-primary)' : 'none',
                }}
              >
                Sandbox Output {runResults && `(${runResults.verdict})`}
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {outputTab === 'testcases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {mission.testCases?.map((tc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.4rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        fontSize: '0.78rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      <div style={{ color: 'var(--accent-primary)', marginBottom: '0.2rem', fontWeight: 700 }}>
                        Scenario Benchmark #{idx + 1}: {tc.explanation}
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Input:</div>
                      <div style={{ color: '#38bdf8', whiteSpace: 'pre-wrap', marginBottom: '0.35rem' }}>{tc.input}</div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Expected:</div>
                      <div style={{ color: '#10b981', whiteSpace: 'pre-wrap' }}>{tc.expectedOutput}</div>
                    </div>
                  ))}
                </div>
              )}

              {outputTab === 'output' && (
                <div>
                  {runResults ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <span
                          className={`badge ${
                            runResults.verdict === 'Accepted' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {runResults.verdict}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Passed {runResults.passedCount ?? runResults.results?.filter((r) => r.passed).length} / {runResults.totalCount ?? runResults.results?.length} cases
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ⚡ {runResults.totalExecutionTime || 0}ms
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          💾 {runResults.memoryUsage || 0} MB
                        </span>
                      </div>

                      {runResults.compileError && (
                        <div
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {runResults.compileError}
                        </div>
                      )}

                      {runResults.results?.map((res, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            marginBottom: '0.35rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{res.isHidden ? '🔒 Hidden Stress Test' : `Benchmark #${i + 1}`}</span>
                          <span style={{ color: res.passed ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {res.passed ? 'PASSED' : 'FAILED'} {res.executionTime ? `(${res.executionTime}ms)` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                      Click "Run Benchmark" to execute against company workloads.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MissionWorkspacePage;
