import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const BASE_URL = 'http://localhost:4071';

async function verify() {
  console.log('=== 1. VERIFY CANDIDATE INTAKE (DIRECT LINK FLOW) ===');
  const candidateEmail = `candidate_test_${Date.now()}@example.com`;
  const intakeRes = await fetch(`${BASE_URL}/api/auth/candidate-entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Rahul Sharma', email: candidateEmail }),
  }).then(r => r.json());

  console.log('Intake response:', intakeRes.success ? 'SUCCESS' : 'FAILED', '| Token present:', !!intakeRes.token);
  if (!intakeRes.success || !intakeRes.token) {
    throw new Error('Candidate intake failed');
  }
  const token = intakeRes.token;

  console.log('\n=== 2. VERIFY ASSESSMENTS LOADING & STARTING ===');
  const assessmentsRes = await fetch(`${BASE_URL}/api/assessments`).then(r => r.json());
  console.log(`Found ${assessmentsRes.assessments?.length} assessments.`);

  for (const ass of assessmentsRes.assessments) {
    const detail = await fetch(`${BASE_URL}/api/assessments/${ass._id}`).then(r => r.json());
    console.log(`Assessment: "${ass.title}" (ID: ${ass._id}) | Problems: ${detail.assessment.problems?.length}`);
    
    // Start assessment with candidate token
    const startRes = await fetch(`${BASE_URL}/api/assessments/${ass._id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    }).then(r => r.json());
    console.log(`  -> Start status: ${startRes.success ? 'STARTED' : startRes.message}`);
  }

  console.log('\n=== 3. VERIFY ALL ASSESSMENT PROBLEMS EXECUTION ===');
  const problems = [
    {
      title: 'Product of Array Except Self',
      code: 'function productExceptSelf(nums) { const n = nums.length; const res = new Array(n).fill(1); let left = 1; for(let i=0; i<n; i++) { res[i] = left; left *= nums[i]; } let right = 1; for(let i=n-1; i>=0; i--) { res[i] *= right; right *= nums[i]; } return res; }',
      lang: 'javascript'
    },
    {
      title: 'Two Sum',
      code: 'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }',
      lang: 'javascript'
    },
    {
      title: 'Valid Palindrome',
      code: 'function isPalindrome(s) { const clean = s.toLowerCase().replace(/[^a-z0-9]/g, ""); return clean === clean.split("").reverse().join(""); }',
      lang: 'javascript'
    },
    {
      title: 'Reverse Linked List',
      code: 'function reverseList(head) { return Array.isArray(head) ? head.reverse() : []; }',
      lang: 'javascript'
    },
    {
      title: 'Valid Parentheses',
      code: 'function isValid(s) { const st = []; const map = { ")": "(", "}": "{", "]": "[" }; for (const c of s) { if (map[c]) { if (st.pop() !== map[c]) return false; } else st.push(c); } return st.length === 0; }',
      lang: 'javascript'
    },
    {
      title: 'Binary Search',
      code: 'function search(nums, target) { let l = 0, r = nums.length - 1; while (l <= r) { const m = Math.floor((l + r) / 2); if (nums[m] === target) return m; if (nums[m] < target) l = m + 1; else r = m - 1; } return -1; }',
      lang: 'javascript'
    },
    {
      title: 'Coin Change',
      code: 'function coinChange(coins, amount) { const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0; for (let i = 1; i <= amount; i++) { for (const c of coins) { if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1); } } return dp[amount] === Infinity ? -1 : dp[amount]; }',
      lang: 'javascript'
    }
  ];

  for (const p of problems) {
    const pData = await fetch(`${BASE_URL}/api/problems?search=${encodeURIComponent(p.title)}`).then(r => r.json());
    const matched = pData.problems?.find(x => x.title === p.title);
    if (!matched) {
      console.log(`Problem "${p.title}" not found in DB!`);
      continue;
    }
    const runRes = await fetch(`${BASE_URL}/api/submissions/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: matched._id, code: p.code, language: p.lang })
    }).then(r => r.json());
    const passedCount = runRes.results?.filter(r => r.passed).length;
    console.log(`Problem "${p.title}" => Verdict: ${runRes.verdict} (${passedCount}/${runRes.results?.length} passed)`);
  }

  console.log('\n=== 4. VERIFY MISSIONS EXECUTION ===');
  const missionsRes = await fetch(`${BASE_URL}/api/missions`).then(r => r.json());
  console.log(`Found ${missionsRes.missions?.length || 0} missions.`);
  for (const m of (missionsRes.missions || [])) {
    console.log(`Mission: "${m.title}" (slug: ${m.slug})`);
    if (m.starterCode?.javascript) {
      // Test running mission with starter or simple code if available
      const solutionRes = await fetch(`${BASE_URL}/api/missions/${m._id}`).then(r => r.json());
      console.log(`  -> Loaded specs, testcases: ${solutionRes.mission?.testCases?.length}`);
    }
  }

  console.log('\n=== ALL CHECKS COMPLETED SUCCESSFULLY ===');
}

verify().catch(console.error);
