import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { PROBLEM_TEMPLATES } from '../../config/problemTemplates';
import {
  Play,
  Send,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Terminal,
  Bot,
  Lightbulb,
  FileCheck2,
  Sliders,
  Sun,
  Moon,
  List,
  Mic,
  MicOff,
  Award,
  ShieldCheck,
  Trophy,
  BookOpen,
  Code2,
} from 'lucide-react';

export const CodingArenaPage = () => {
  const { problemId, assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, candidateEntry } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error, info } = useToast();

  // State
  const [problem, setProblem] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [assessmentProblems, setAssessmentProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  // Responsive mobile view switcher ('problem' | 'code')
  const [mobileArenaTab, setMobileArenaTab] = useState('problem');

  // Direct candidate intake for shared assessment links
  const [showArenaIntakeModal, setShowArenaIntakeModal] = useState(false);
  const [arenaCandidateName, setArenaCandidateName] = useState('');
  const [arenaCandidateEmail, setArenaCandidateEmail] = useState('');
  const [arenaIntakeLoading, setArenaIntakeLoading] = useState(false);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [fontSize, setFontSize] = useState(14);
  const [loading, setLoading] = useState(true);
  const [questionDrafts, setQuestionDrafts] = useState({});
  const [solvedQuestionIds, setSolvedQuestionIds] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isAssessmentFinished, setIsAssessmentFinished] = useState(false);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('testcases'); // 'testcases' | 'output' | 'console'
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [testCases, setTestCases] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);

  // Execution outcomes
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // AI Assistant drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiTab, setAiTab] = useState('hints'); // 'hints' | 'review' | 'explain'
  const [hintLevel, setHintLevel] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState({
    hint1: '',
    hint2: '',
    hint3: '',
    review: null,
    explanation: '',
  });

  // Verbal Defense / Explain Your Code State
  const [explanationText, setExplanationText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [vivaEvaluation, setVivaEvaluation] = useState(null);
  const [vivaLoading, setVivaLoading] = useState(false);
  const recognitionRef = useRef(null);

  // Setup Web Speech API for Viva
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript + ' ';
          }
          setExplanationText((prev) => (prev ? prev + ' ' + text.trim() : text.trim()));
        };

        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      } catch (e) {
        console.warn('SpeechRecognition init error:', e);
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      info('Voice dictation is not supported in this browser. You can type your defense!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Assessment Timer
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const cppProblemTemplates = {
    'Two Sum': `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
    'Valid Palindrome': `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        // Write your solution here
        return false;
    }
};`,
    'Reverse Linked List': `#include <iostream>
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
    'Valid Parentheses': `#include <iostream>
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
    'Implement Queue using Stacks': `#include <iostream>
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
    'Maximum Depth of Binary Tree': `#include <iostream>
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
    'Longest Substring Without Repeating Characters': `#include <iostream>
#include <string>
#include <unordered_set>

using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here
        return 0;
    }
};`,
    '3Sum': `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your solution here
        return {};
    }
};`,
    'Coin Change': `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your solution here
        return -1;
    }
};`,
    'Number of Islands': `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your solution here
        return 0;
    }
};`,
    'Merge Intervals': `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your solution here
        return {};
    }
};`,
    'Binary Search': `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your solution here
        return -1;
    }
};`,
    'Trapping Rain Water': `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};`,
    'Word Ladder': `#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
#include <queue>

using namespace std;

class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // Write your solution here
        return 0;
    }
};`,
    'LRU Cache': `#include <iostream>
#include <unordered_map>
#include <list>

using namespace std;

class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};`,
    'Product of Array Except Self': `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        // Write your solution here
        return {};
    }
};`,
  };

  const pythonProblemTemplates = {
    'Two Sum': `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        return []`,
    'Valid Palindrome': `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your solution here
        return False`,
    'Reverse Linked List': `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your solution here
        return None`,
    'Valid Parentheses': `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        return False`,
    'Binary Search': `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your solution here
        return -1`,
    'Coin Change': `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # Write your solution here
        return -1`,
    '3Sum': `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Write your solution here
        return []`,
    'Longest Substring Without Repeating Characters': `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your solution here
        return 0`,
    'Trapping Rain Water': `class Solution:
    def trap(self, height: list[int]) -> int:
        # Write your solution here
        return 0`,
    'Merge Intervals': `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Write your solution here
        return []`,
    'Maximum Depth of Binary Tree': `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        # Write your solution here
        return 0`,
    'Number of Islands': `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Write your solution here
        return 0`,
    'Word Ladder': `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        # Write your solution here
        return 0`,
    'Deep Clone Object': `class Solution:
    def deepClone(self, obj):
        # Write your solution here
        return {}`,
    'Implement Queue using Stacks': `class MyQueue:
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
    'LRU Cache': `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize your LRU cache here
        pass

    def get(self, key: int) -> int:
        # Write your solution here
        return -1

    def put(self, key: int, value: int) -> None:
        # Write your solution here
        pass`,
    'Product of Array Except Self': `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        # Write your solution here
        return []`,
  };

  const getLanguageStarter = (lang, currentProb) => {
    const title = currentProb?.title || '';

    // 1. Check master clean PROBLEM_TEMPLATES dictionary first (guaranteed clean & problem-specific)
    if (PROBLEM_TEMPLATES[title] && PROBLEM_TEMPLATES[title][lang]) {
      return PROBLEM_TEMPLATES[title][lang];
    }

    // 2. Check problem starterCode from database
    if (currentProb && currentProb.starterCode) {
      if (typeof currentProb.starterCode === 'object' && currentProb.starterCode[lang]) {
        return currentProb.starterCode[lang];
      }
      if (lang === 'javascript' && typeof currentProb.starterCode === 'string') {
        return currentProb.starterCode;
      }
      if (lang === 'javascript' && currentProb.starterCode?.javascript) {
        return currentProb.starterCode.javascript;
      }
    }

    // 3. Fallback templates for C++ & Python
    if (lang === 'cpp' && cppProblemTemplates[title]) {
      return cppProblemTemplates[title];
    }
    if (lang === 'python' && pythonProblemTemplates[title]) {
      return pythonProblemTemplates[title];
    }

    const defaultTemplates = {
      javascript: `// Solution in JavaScript (Node.js)\nfunction solution(input) {\n  // Write your solution here\n  return input;\n}`,
      python: `# Solution in Python 3\nclass Solution:\n    def solve(self, input):\n        # Write your solution here\n        return input`,
      java: `// Solution in Java (OpenJDK)\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`,
      cpp: `// Solution in C++ (GCC)\n#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n};`,
      c: `// Solution in C (GCC)\n#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
    };
    return defaultTemplates[lang] || '// Write your solution here';
  };

  // Load problem & assessment details
  useEffect(() => {
    const initArena = async () => {
      setLoading(true);
      try {
        if (assessmentId) {
          // Assessment Mode
          const aRes = await api.get(`/assessments/${assessmentId}`);
          if (aRes.success && aRes.assessment) {
            setAssessment(aRes.assessment);
            let pList = (aRes.assessment.problems || [])
              .map((p) => (typeof p.problemId === 'object' ? p.problemId : p.problemId))
              .filter(Boolean);

            // If empty, fallback to fetching any published problem
            if (pList.length === 0) {
              const fallbackRes = await api.get('/problems?limit=1');
              if (fallbackRes.success && fallbackRes.problems?.length > 0) {
                pList = [fallbackRes.problems[0]];
              }
            }

            setAssessmentProblems(pList);

            // Determine active problem
            let activeP = pList[0];
            if (problemId) {
              const found = pList.find((p) => (p._id === problemId || p.slug === problemId || p === problemId));
              if (found) activeP = found;
            }

            // If activeP is just an ID string or missing fields, fetch full problem
            if (typeof activeP === 'string' || (activeP && !activeP.title)) {
              const pIdToFetch = typeof activeP === 'string' ? activeP : activeP._id;
              const pDetail = await api.get(`/problems/${pIdToFetch}`);
              if (pDetail.success && pDetail.problem) {
                activeP = pDetail.problem;
              }
            }

            setProblem(activeP);

            const starter = getLanguageStarter(language, activeP);
            setCode(starter);

            // Load test cases
            if (activeP && activeP._id) {
              const tcRes = await api.get(`/problems/${activeP._id}/testcases`);
              if (tcRes.success) setTestCases(tcRes.testCases || []);
            }

            // Populate solved question IDs if returned
            if (aRes.solvedProblemIds && aRes.solvedProblemIds.length > 0) {
              setSolvedQuestionIds(new Set(aRes.solvedProblemIds));
              if (pList.length > 0 && aRes.solvedProblemIds.length >= pList.length) {
                setIsAssessmentFinished(true);
              }
            }
            if (aRes.candidateSession?.status === 'completed') {
              setIsAssessmentFinished(true);
            }

            // Start or continue timer
            if (aRes.candidateSession?.expiresAt) {
              const rem = Math.max(
                0,
                Math.floor((new Date(aRes.candidateSession.expiresAt).getTime() - Date.now()) / 1000)
              );
              setRemainingSeconds(rem);
            } else {
              setRemainingSeconds(aRes.assessment.duration * 60);
            }
          }
        } else if (problemId) {
          // Direct Problem Mode
          const pRes = await api.get(`/problems/${problemId}`);
          if (pRes.success && pRes.problem) {
            setProblem(pRes.problem);
            setCode(getLanguageStarter(language, pRes.problem));
            setTestCases(pRes.testCases || []);
          }
        }
      } catch (err) {
        error(err.message || 'Failed to initialize Coding Arena');
      } finally {
        setLoading(false);
      }
    };

    initArena();
  }, [problemId, assessmentId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          info('Assessment time has elapsed. Submitting current solution...');
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  // Fullscreen Handler
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  const handleSelectQuestion = async (nextProb, nextIdx) => {
    if (!nextProb) return;
    // Save current problem's code draft
    if (problem && problem._id) {
      setQuestionDrafts((prev) => ({ ...prev, [problem._id]: code }));
    }
    setProblem(nextProb);
    setCurrentProblemIndex(nextIdx);

    // If draft exists for next question, restore it; otherwise give template
    const existingCode = questionDrafts[nextProb._id];
    if (existingCode) {
      setCode(existingCode);
    } else {
      setCode(getLanguageStarter(language, nextProb));
    }

    // Reset run / submit states for the new question
    setRunResult(null);
    setSubmissionResult(null);

    // Fetch test cases for next problem
    if (nextProb._id) {
      try {
        const tcRes = await api.get(`/problems/${nextProb._id}/testcases`);
        if (tcRes.success && tcRes.testCases) {
          setTestCases(tcRes.testCases);
        }
      } catch (err) {
        console.error('Error fetching test cases for question:', err);
      }
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getLanguageStarter(newLang, problem));
  };

  const handleResetCode = () => {
    setCode(getLanguageStarter(language, problem));
    info('Editor reset to default starter template.');
  };

  // Run Code Ephemerally
  const handleRunCode = async () => {
    if (!code.trim()) {
      error('Code editor is empty');
      return;
    }

    try {
      setIsRunning(true);
      setMobileArenaTab('code');
      setActiveBottomTab('output');
      setRunResult(null);

      const payload = {
        problemId: problem._id,
        code,
        language,
        customInput: isCustomInput ? customInput : undefined,
      };

      const res = await api.post('/submissions/run', payload);
      setRunResult(res);

      if (res.verdict === 'Accepted') {
        success('All test cases passed! Ready to submit.');
      } else {
        info(`Verdict: ${res.verdict}`);
      }
    } catch (err) {
      error(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Final Solution
  const handleSubmit = async () => {
    if (!code.trim()) {
      error('Code editor is empty');
      return;
    }

    if (!isAuthenticated) {
      setShowArenaIntakeModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setMobileArenaTab('code');
      setActiveBottomTab('output');

      const payload = {
        problemId: problem._id,
        assessmentId: assessmentId || null,
        code,
        language,
      };

      const res = await api.post('/submissions', payload);
      if (res.success && res.submission) {
        setSubmissionResult(res.submission);

        if (res.submission.verdict === 'Accepted') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          success('🎉 Accepted! All public and hidden test cases passed!');

          if (problem && problem._id) {
            const currentProbId = problem._id.toString();
            setSolvedQuestionIds((prev) => {
              const nextSet = new Set(prev);
              nextSet.add(currentProbId);

              // Check if all assessment problems are now completed
              if (assessmentId && assessmentProblems.length > 0) {
                const allDone = assessmentProblems.every((p) => nextSet.has(p._id.toString()));
                if (allDone) {
                  setIsAssessmentFinished(true);
                  setTimeout(() => {
                    setShowCompletionModal(true);
                    api.post(`/assessments/${assessmentId}/submit`).catch(console.error);
                  }, 1000);
                }
              }
              return nextSet;
            });
          }
        } else {
          info(`Submission Verdict: ${res.submission.verdict} (${res.submission.testsPassed}/${res.submission.totalTests} tests)`);
        }
      }
    } catch (err) {
      error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArenaIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!arenaCandidateName.trim() || !arenaCandidateEmail.trim()) {
      error('Please enter both your name and email');
      return;
    }
    try {
      setArenaIntakeLoading(true);
      await candidateEntry(arenaCandidateName.trim(), arenaCandidateEmail.trim());
      setShowArenaIntakeModal(false);
      success('Candidate verified! Submitting solution...');
      if (assessmentId) {
        try {
          await api.post(`/assessments/${assessmentId}/start`, {});
        } catch (e) {}
      }
      setTimeout(() => handleSubmit(), 200);
    } catch (err) {
      error(err.message || 'Verification failed');
    } finally {
      setArenaIntakeLoading(false);
    }
  };

  const handleFinishAssessment = async () => {
    try {
      if (assessmentId) {
        await api.post(`/assessments/${assessmentId}/submit`);
      }
      setIsAssessmentFinished(true);
      setShowCompletionModal(true);
    } catch (err) {
      console.error(err);
      setShowCompletionModal(true);
    }
  };

  // AI Assistant Feature Calls
  const handleFetchAiHint = async (level) => {
    setHintLevel(level);
    setAiLoading(true);
    try {
      const res = await api.post('/ai/hint', {
        problemId: problem._id,
        code,
        level,
      });
      if (res.success) {
        setAiContent((prev) => ({
          ...prev,
          [`hint${level}`]: res.hint,
        }));
      }
    } catch (err) {
      error(err.message || 'Failed to retrieve AI hint');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFetchAiReview = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/review', {
        problemId: problem._id,
        code,
        language,
      });
      if (res.success) {
        setAiContent((prev) => ({
          ...prev,
          review: res.review,
        }));
      }
    } catch (err) {
      error(err.message || 'Failed to retrieve AI code review');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFetchAiExplain = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/explain', {
        problemId: problem._id,
      });
      if (res.success) {
        setAiContent((prev) => ({
          ...prev,
          explanation: res.explanation,
        }));
      }
    } catch (err) {
      error(err.message || 'Failed to retrieve AI explanation');
    } finally {
      setAiLoading(false);
    }
  };

  // Evaluate candidate's verbal/written defense
  const handleEvaluateExplanation = async () => {
    if (!explanationText.trim()) {
      error('Please provide or dictate an explanation of your code before evaluation.');
      return;
    }
    setVivaLoading(true);
    try {
      const res = await api.post('/ai/evaluate-explanation', {
        problemId: problem._id,
        code,
        explanationText,
      });
      if (res.success) {
        setVivaEvaluation(res.evaluation);
        success('AI Interviewer evaluated your verbal code defense!');
      } else {
        error(res.message || 'Evaluation failed');
      }
    } catch (err) {
      error(err.message || 'Failed to evaluate code defense');
    } finally {
      setVivaLoading(false);
    }
  };

  // Format Timer string
  const formatTimer = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Preparing Coding Arena & Monaco Environment...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Problem not found</h2>
        <Link to="/problems" className="btn btn-secondary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
          Return to Problems
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Top Navigation & Status Bar */}
      <header
        style={{
          height: '52px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to={assessmentId ? `/assessments/${assessmentId}` : '/problems'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '0.375rem',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            <ChevronLeft size={16} />
            <span>{assessmentId ? 'Assessment' : 'Problems'}</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{problem.title}</span>
            <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>

          {/* Assessment Multi-question navigator */}
          {assessment && assessmentProblems.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '1rem' }}>
              {assessmentProblems.map((p, idx) => {
                const isSolved = solvedQuestionIds.has(p._id?.toString());
                const isActive = problem._id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => handleSelectQuestion(p, idx)}
                    style={{
                      height: '28px',
                      padding: '0 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      border: isSolved
                        ? '1px solid #10b981'
                        : `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                      backgroundColor: isSolved
                        ? (isActive ? '#059669' : 'rgba(16, 185, 129, 0.15)')
                        : (isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)'),
                      color: isSolved
                        ? (isActive ? '#ffffff' : '#10b981')
                        : (isActive ? '#ffffff' : 'var(--text-secondary)'),
                      cursor: 'pointer',
                      boxShadow: isSolved ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title={isSolved ? `${p.title} (Solved)` : p.title}
                  >
                    <span>Q{idx + 1}</span>
                    {isSolved && <CheckCircle2 size={12} color={isActive ? '#ffffff' : '#10b981'} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Mobile View Switcher (Problem vs Code Editor) */}
          <div
            className="arena-mobile-switcher"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-primary)',
            }}
          >
            <button
              onClick={() => setMobileArenaTab('problem')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: mobileArenaTab === 'problem' ? 'var(--accent-primary)' : 'transparent',
                color: mobileArenaTab === 'problem' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <BookOpen size={12} />
              <span>Problem</span>
            </button>
            <button
              onClick={() => setMobileArenaTab('code')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: mobileArenaTab === 'code' ? 'var(--accent-primary)' : 'transparent',
                color: mobileArenaTab === 'code' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Code2 size={12} />
              <span>Editor</span>
            </button>
          </div>

          {/* Finish Assessment button */}
          {assessmentId && (
            <button
              onClick={handleFinishAssessment}
              className={`btn btn-sm ${isAssessmentFinished ? 'btn-success' : 'btn-secondary'}`}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: isAssessmentFinished ? '#10b981' : undefined,
                color: isAssessmentFinished ? '#ffffff' : undefined,
                border: isAssessmentFinished ? '1px solid #10b981' : undefined,
              }}
              title="Finish and submit entire assessment"
            >
              {isAssessmentFinished ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Finish Assessment</span>
                </>
              )}
            </button>
          )}

          {/* Timer Countdown (if in assessment) */}
          {remainingSeconds !== null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: remainingSeconds < 300 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
                color: remainingSeconds < 300 ? '#ef4444' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: `1px solid ${remainingSeconds < 300 ? '#ef4444' : 'var(--border-primary)'}`,
              }}
            >
              <Clock size={15} />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}

          {/* Verbal Defense Button */}
          <button
            onClick={() => {
              setAiTab('defend');
              setAiDrawerOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: aiTab === 'defend' && aiDrawerOpen ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
              border: `1px solid ${aiTab === 'defend' && aiDrawerOpen ? '#10b981' : 'var(--border-primary)'}`,
              color: aiTab === 'defend' && aiDrawerOpen ? '#10b981' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Defend your code approach verbally or in writing"
          >
            <Mic size={15} color="#10b981" />
            <span>Defend Code</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: aiDrawerOpen ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-tertiary)',
              border: `1px solid ${aiDrawerOpen ? '#a855f7' : 'var(--border-primary)'}`,
              color: aiDrawerOpen ? '#c084fc' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Bot size={15} color={aiDrawerOpen ? '#c084fc' : 'currentColor'} />
            <span>AI Assistant</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.35rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullScreen}
            style={{
              padding: '0.35rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Problem Statement, Right Monaco IDE + Bottom Test Cases */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel: Problem Statement */}
        <div
          className={`arena-left-panel ${mobileArenaTab === 'problem' ? 'is-active' : 'is-hidden'}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-primary)',
            overflowY: 'auto',
            padding: '1.25rem',
            gap: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {problem.title}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Topic: {problem.topic}</span>
              <span>•</span>
              <span>Time Limit: {problem.timeLimit}ms</span>
              <span>•</span>
              <span>Memory: {problem.memoryLimit}MB</span>
            </div>
          </div>

          {/* Statement */}
          <div
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
            }}
          >
            {problem.description}
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {problem.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="card-glass"
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <div><span style={{ color: 'var(--text-muted)' }}>Input:</span> {ex.input}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Output:</span> {ex.output}</div>
                    {ex.explanation && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>
                        <strong>Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Constraints
              </h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {problem.constraints.map((c, i) => (
                  <li key={i} style={{ fontFamily: 'var(--font-mono)' }}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Center / Right Section: Code Editor & Test Cases */}
        <div
          className={`arena-right-panel ${mobileArenaTab === 'code' ? 'is-active' : 'is-hidden'}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Editor Header Tool Bar */}
          <div
            style={{
              height: '42px',
              flexShrink: 0,
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="c">C (GCC)</option>
              </select>

              <button
                onClick={handleResetCode}
                title="Reset to starter code"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              UTF-8 • Tab Size: 2 • Monaco 0.44
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={language}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize,
                fontFamily: 'Fira Code, Menlo, Monaco, monospace',
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Bottom Execution Console & Test Cases Panel */}
          <div
            style={{
              height: '240px',
              flexShrink: 0,
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Console Header Tabs & Action Buttons */}
            <div
              style={{
                height: '42px',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveBottomTab('testcases')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: activeBottomTab === 'testcases' ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    color: activeBottomTab === 'testcases' ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Test Cases ({testCases.length})
                </button>

                <button
                  onClick={() => setActiveBottomTab('output')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: activeBottomTab === 'output' ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    color: activeBottomTab === 'output' ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>Result Output</span>
                  {(runResult || submissionResult) && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: (runResult?.verdict === 'Accepted' || submissionResult?.verdict === 'Accepted') ? '#10b981' : '#ef4444',
                      }}
                    />
                  )}
                </button>
              </div>

              {/* Run Code & Submit Solution Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Play size={14} color="#3b82f6" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>

            {/* Console Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {activeBottomTab === 'testcases' && (
                <div>
                  {/* Test case sub-tabs */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
                    {testCases.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTestCaseIndex(idx);
                          setIsCustomInput(false);
                        }}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: activeTestCaseIndex === idx && !isCustomInput ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                          color: activeTestCaseIndex === idx && !isCustomInput ? '#ffffff' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Case {idx + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setIsCustomInput(true)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: isCustomInput ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: isCustomInput ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      + Custom Input
                    </button>
                  </div>

                  {isCustomInput ? (
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                        Custom Standard Input
                      </label>
                      <textarea
                        rows={2}
                        className="input-arena"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                        placeholder="[1, 2, 3]&#10;5"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                      />
                    </div>
                  ) : testCases[activeTestCaseIndex] ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      <div className="card-glass" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>INPUT</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{testCases[activeTestCaseIndex].input}</div>
                      </div>
                      <div className="card-glass" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>EXPECTED OUTPUT</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{testCases[activeTestCaseIndex].expectedOutput}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No test cases loaded.</div>
                  )}
                </div>
              )}

              {activeBottomTab === 'output' && (
                <div>
                  {isRunning || isSubmitting ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                      <span>Running solution in isolated sandbox...</span>
                    </div>
                  ) : submissionResult ? (
                    <div>
                      {/* Verdict Banner */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            color: submissionResult.verdict === 'Accepted' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {submissionResult.verdict}
                        </span>
                        <span className="badge badge-info">
                          Passed: {submissionResult.testsPassed} / {submissionResult.totalTests} Tests
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Time: {submissionResult.executionTime}ms • Mem: {submissionResult.memoryUsage}MB
                        </span>
                      </div>

                      {/* Verbal Defense Banner on Acceptance */}
                      {submissionResult.verdict === 'Accepted' && (
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            marginBottom: '0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Award size={20} color="#10b981" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>
                                Solution Accepted! Defend Your Code
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Real tech interviews test explanation, edge cases & complexity proof.
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setAiTab('defend');
                              setAiDrawerOpen(true);
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
                          >
                            <Mic size={14} /> Start Verbal Defense
                          </button>
                        </div>
                      )}

                      {/* Notice when code returns incorrect result */}
                      {submissionResult.verdict === 'Wrong Answer' && (
                        <div
                          style={{
                            padding: '0.65rem 0.9rem',
                            marginBottom: '0.85rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45,
                          }}
                        >
                          <strong style={{ color: '#ef4444' }}>Wrong Answer: </strong>
                          Your code ran, but returned an incorrect value. Compare your code output with the expected answer below and update your solution inside the function.
                        </div>
                      )}

                      {/* Compilation or Runtime Error Display */}
                      {(submissionResult.error || submissionResult.compileError) && (
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            marginBottom: '0.85rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5,
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <AlertTriangle size={15} />
                            {submissionResult.verdict === 'Compilation Error' ? 'Compilation Error Details:' : 'Execution Error:'}
                          </div>
                          <div>{submissionResult.error || submissionResult.compileError}</div>
                        </div>
                      )}

                      {/* Test Outcomes List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {submissionResult.testResults?.map((tr, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '6px',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-primary)',
                              fontSize: '0.8rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {tr.passed ? (
                                  <CheckCircle2 size={16} color="#10b981" />
                                ) : (
                                  <XCircle size={16} color="#ef4444" />
                                )}
                                <span style={{ fontWeight: 600 }}>Test Case #{tr.testIndex}</span>
                                {tr.isHidden && (
                                  <span className="badge badge-hard" style={{ fontSize: '0.65rem' }}>
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <div>
                                {tr.passed ? (
                                  <span style={{ color: '#10b981', fontWeight: 600 }}>Passed ({tr.executionTime}ms)</span>
                                ) : (
                                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{tr.status}</span>
                                )}
                              </div>
                            </div>

                            {!tr.passed && !tr.isHidden && (
                              <div style={{ marginTop: '0.45rem', paddingTop: '0.45rem', borderTop: '1px dashed var(--border-primary)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Input: </span><code>{tr.input}</code></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Your Code Output: </span><code style={{ color: '#ef4444', fontWeight: 700 }}>{tr.actualOutput !== undefined && tr.actualOutput !== '' ? tr.actualOutput : 'none'}</code></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Expected Answer: </span><code style={{ color: '#10b981', fontWeight: 700 }}>{tr.expectedOutput}</code></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : runResult ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: runResult.verdict === 'Accepted' ? '#10b981' : '#ef4444' }}>
                          {runResult.verdict}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Time: {runResult.totalExecutionTime}ms
                        </span>
                      </div>

                      {runResult.compileError ? (
                        <div style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {runResult.compileError}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {runResult.results?.map((r, i) => (
                            <div
                              key={i}
                              style={{
                                padding: '0.65rem 0.85rem',
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                                fontSize: '0.8rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span>Case #{r.testIndex}: {r.passed ? '✅ Passed' : '❌ Wrong Answer'}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{r.executionTime}ms</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Input: </span><code>{r.input}</code></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Your Output: </span><code style={{ color: r.passed ? '#10b981' : '#ef4444', fontWeight: 700 }}>{r.actualOutput || 'none'}</code></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Expected: </span><code style={{ color: '#10b981', fontWeight: 700 }}>{r.expectedOutput}</code></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Click "Run Code" to test against public test cases or "Submit Solution" for full grading.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Slide-over: AI Assistant Drawer */}
        {aiDrawerOpen && (
          <div
            className="animate-fade-in card-glass"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '380px',
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-primary)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Bot size={18} color="#a855f7" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Gemini AI Assistant</span>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* AI Mode Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)' }}>
              {[
                { id: 'hints', label: 'Hints', icon: Lightbulb },
                { id: 'review', label: 'Review', icon: FileCheck2 },
                { id: 'explain', label: 'Analogy', icon: Sparkles },
                { id: 'defend', label: 'Verbal Defense', icon: Mic },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAiTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.2rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: aiTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${aiTab === tab.id ? (tab.id === 'defend' ? '#10b981' : '#a855f7') : 'transparent'}`,
                      color: aiTab === tab.id ? (tab.id === 'defend' ? '#10b981' : 'var(--text-primary)') : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <TabIcon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* AI Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {aiTab === 'hints' && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Progressive hints that guide your algorithmic strategy without immediately spoiling the solution.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <button
                      onClick={() => handleFetchAiHint(1)}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <span>Hint 1: Conceptual Direction</span>
                    </button>
                    {hintLevel >= 1 && aiContent.hint1 && (
                      <div className="card-glass" style={{ padding: '0.85rem', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {aiContent.hint1}
                      </div>
                    )}

                    <button
                      onClick={() => handleFetchAiHint(2)}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <span>Hint 2: Algorithmic Approach</span>
                    </button>
                    {hintLevel >= 2 && aiContent.hint2 && (
                      <div className="card-glass" style={{ padding: '0.85rem', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {aiContent.hint2}
                      </div>
                    )}

                    <button
                      onClick={() => handleFetchAiHint(3)}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <span>Hint 3: Detailed Breakdown</span>
                    </button>
                    {hintLevel >= 3 && aiContent.hint3 && (
                      <div className="card-glass" style={{ padding: '0.85rem', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {aiContent.hint3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {aiTab === 'review' && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Analyze current editor code for asymptotic complexity, readability, and edge conditions.
                  </p>
                  <button onClick={handleFetchAiReview} className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '1.25rem' }}>
                    <span>Analyze Code Quality</span>
                  </button>

                  {aiContent.review && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div className="card-glass" style={{ padding: '0.75rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>TIME COMPLEXITY</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{aiContent.review.timeComplexity}</div>
                      </div>
                      <div className="card-glass" style={{ padding: '0.75rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SPACE COMPLEXITY</div>
                        <div style={{ fontWeight: 700, color: '#06b6d4' }}>{aiContent.review.spaceComplexity}</div>
                      </div>
                      <div className="card-glass" style={{ padding: '0.75rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>READABILITY SCORE</div>
                        <div style={{ fontWeight: 700, color: '#10b981' }}>{aiContent.review.readability}</div>
                      </div>
                      <div className="card-glass" style={{ padding: '0.75rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>SUGGESTIONS</div>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                          {aiContent.review.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {aiTab === 'explain' && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Translate this problem's mathematical jargon into an intuitive real-world analogy.
                  </p>
                  <button onClick={handleFetchAiExplain} className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '1.25rem' }}>
                    <span>Explain in Plain English</span>
                  </button>

                  {aiContent.explanation && (
                    <div className="card-glass" style={{ padding: '1rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                      {aiContent.explanation}
                    </div>
                  )}
                </div>
              )}

              {aiTab === 'defend' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#10b981' }}>Interview Defense / Viva:</strong> Dictate or type how your solution works, proving time/space complexity and addressing edge cases to the AI interviewer.
                  </div>

                  {/* Dictation / Input Toolbar */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={toggleSpeechRecognition}
                      type="button"
                      className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={14} />
                          <span className="animate-pulse">Listening... (Click to stop)</span>
                        </>
                      ) : (
                        <>
                          <Mic size={14} color="#10b981" />
                          <span>Voice Dictation</span>
                        </>
                      )}
                    </button>
                    {explanationText && (
                      <button
                        onClick={() => setExplanationText('')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                        title="Clear input"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Textarea */}
                  <div>
                    <textarea
                      value={explanationText}
                      onChange={(e) => setExplanationText(e.target.value)}
                      placeholder="Explain your approach: e.g. 'I used a single-pass hash map to achieve O(N) runtime and O(N) space. For each element, we check if complement = target - nums[i] is recorded...'"
                      rows={5}
                      style={{
                        width: '100%',
                        borderRadius: '6px',
                        padding: '0.65rem',
                        fontSize: '0.8rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>{explanationText.trim().split(/\s+/).filter(Boolean).length} words</span>
                      <span>Audio or text accepted</span>
                    </div>
                  </div>

                  {/* Evaluate Button */}
                  <button
                    onClick={handleEvaluateExplanation}
                    disabled={vivaLoading || !explanationText.trim()}
                    className="btn btn-primary btn-sm"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: vivaLoading || !explanationText.trim() ? 0.6 : 1,
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>{vivaLoading ? 'Interviewer Evaluating...' : 'Submit Defense to AI'}</span>
                  </button>

                  {/* Evaluation Report Results */}
                  {vivaEvaluation && (
                    <div className="card-glass" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {/* Overall Clarity Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DEFENSE SCORE</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: vivaEvaluation.overallClarityScore >= 80 ? '#10b981' : '#f59e0b' }}>
                            {vivaEvaluation.overallClarityScore}%
                          </div>
                        </div>
                        <span className={`badge ${vivaEvaluation.overallClarityScore >= 80 ? 'badge-easy' : 'badge-medium'}`}>
                          {vivaEvaluation.verdict || 'Evaluated'}
                        </span>
                      </div>

                      {/* 3 Metrics breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>COMMUNICATION</div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>{vivaEvaluation.communicationScore}%</div>
                        </div>
                        <div style={{ padding: '0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ACCURACY</div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{vivaEvaluation.algorithmicAccuracyScore}%</div>
                        </div>
                        <div style={{ padding: '0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>COMPLEXITY</div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#06b6d4' }}>{vivaEvaluation.complexityProofScore}%</div>
                        </div>
                      </div>

                      {/* Feedback Summary */}
                      {vivaEvaluation.feedbackSummary && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, fontStyle: 'italic', borderLeft: '2px solid #10b981', paddingLeft: '0.5rem' }}>
                          "{vivaEvaluation.feedbackSummary}"
                        </div>
                      )}

                      {/* Strengths */}
                      {vivaEvaluation.strengths?.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', marginBottom: '0.2rem' }}>KEY STRENGTHS</div>
                          <ul style={{ listStyle: 'disc', paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {vivaEvaluation.strengths.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas to Improve */}
                      {vivaEvaluation.areasToImprove?.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.2rem' }}>AREAS TO SHARPEN</div>
                          <ul style={{ listStyle: 'disc', paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {vivaEvaluation.areasToImprove.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment Completed Modal */}
        {showCompletionModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <div
              className="card-glass animate-scale-up"
              style={{
                maxWidth: '520px',
                width: '100%',
                padding: '2.5rem 2rem',
                borderRadius: '1.25rem',
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.25)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  margin: '0 auto 1.25rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                <Trophy size={36} />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                }}
              >
                <CheckCircle2 size={14} />
                All Questions Solved!
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                You Have Completed This Assessment!
              </h2>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                Outstanding work! All public and hidden test cases across your assessment problems have been successfully solved.
              </p>

              {/* Stats summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  marginBottom: '2rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>100%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {assessmentProblems.length}/{assessmentProblems.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Problems</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>Passed</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Review Code
                </button>
                <Link
                  to={assessmentId ? `/results/${assessmentId}` : '/assessments'}
                  className="btn btn-primary"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  View Performance Report
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Check-In Intake Modal for Direct Link Visits */}
        {showArenaIntakeModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1.5rem',
            }}
          >
            <div
              className="card-glass animate-fade-in"
              style={{
                maxWidth: '460px',
                width: '100%',
                padding: '2.25rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Award size={24} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Candidate Check-In
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Please enter your name and email to submit your code and register your assessment scorecard.
                </p>
              </div>

              <form onSubmit={handleArenaIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Rahul Sharma"
                    className="input-arena"
                    value={arenaCandidateName}
                    onChange={(e) => setArenaCandidateName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    className="input-arena"
                    value={arenaCandidateEmail}
                    onChange={(e) => setArenaCandidateEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={arenaIntakeLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
                  >
                    <span>{arenaIntakeLoading ? 'Verifying...' : 'Confirm & Submit Solution'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowArenaIntakeModal(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
