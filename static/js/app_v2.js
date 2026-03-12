/* =========================================================
   JobShield AI v3.0 — Complete Frontend Logic (26 Features)
   ========================================================= */

var EXAMPLES = {
  fake1: `Job Title: Work From Home Data Entry Executive
We are urgently hiring candidates for a simple data entry role.
Work just 2–3 hours daily and earn up to ₹40,000 per month.
To begin the process, candidates must pay a ₹1,500 registration fee
which will be refunded after your first salary.
No interview required — instant joining.
Contact HR on WhatsApp to secure your slot today.`,

  fake2: `Job Title: Online Customer Support Associate
International company hiring remote support executives.
Earn ₹1,200 per day with flexible working hours.
Candidates must purchase a training kit for ₹2,999 before onboarding.
Bank details are required for salary transfer setup.
Limited openings available — apply immediately.`,

  real1: `Job Title: Software Developer
Company: Wipro Limited
Wipro is hiring a Software Developer with 2–4 years of experience in Java and SQL.
Responsibilities:
- Develop and maintain web applications
- Collaborate with product and QA teams
Benefits: Health insurance, PF, annual bonus
Apply through the official careers portal:
https://careers.wipro.com`,

  real2: `Job Title: Business Analyst
Company: Infosys Ltd
Infosys is looking for a Business Analyst.
Location: Bangalore
Experience: 3+ years
Benefits include health insurance, paid leave, and incentives.
Apply online at:
https://www.infosys.com/careers`
};

var lastResultData = null;
var lastAnalysis = null;

/* ================= INITIALIZATION ================= */
document.addEventListener("DOMContentLoaded", function () {
  const ta = document.getElementById("jobInput");
  if (ta) ta.addEventListener("input", updateMeta);
  
  const pdfInput = document.getElementById("pdfFile");
  if (pdfInput) pdfInput.addEventListener("change", handlePDFUpload);
  
  showIdle();
});

/* ================= META TRACKING (Feature #24) ================= */
function updateMeta() {
  const ta = document.getElementById("jobInput");
  const val = ta.value;
  const chars = val.length;
  const words = val.trim() ? val.trim().split(/\s+/).length : 0;
  
  document.getElementById("charCount").textContent = chars + " / 5000";
  document.getElementById("wordCount").textContent = words + " words";
}

/* ================= LOAD EXAMPLES (Feature #22) ================= */
function loadExample(key) {
  const ta = document.getElementById("jobInput");
  ta.value = EXAMPLES[key];
  updateMeta();
}

/* ================= CLEAR INPUT ================= */
function clearInput() {
  document.getElementById("jobInput").value = "";
  document.getElementById("jobURL").value = "";
  updateMeta();
  showIdle();
}

/* ================= ANALYZE JOB (Feature #1, #2, #3, #4, #21) ================= */
function analyzeJob() {
  const input = document.getElementById("jobInput").value.trim();
  const url = document.getElementById("jobURL").value.trim();

  if (!input || input.length < 30) {
    alert("Please paste a job description (minimum 30 characters)");
    return;
  }

  setLoading(true);
  showLoading();
  animateSteps();

  fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      job_description: input,
      url: url || null
    })
  })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      displayResults(data);
    })
    .catch(err => {
      setLoading(false);
      showError("Server error. Please try again.");
    });
}

/* ================= DISPLAY RESULTS (All Features) ================= */
function displayResults(response) {
  const analysis = response.analysis || response;
  const company = response.company || {};
  const highlightedSentences = response.highlighted_sentences || [];
  const scanHistory = response.scan_history || [];
  
  lastAnalysis = analysis;
  lastResultData = { ...analysis, ...company };

  const fraudScore = analysis.fraud_score || 0;
  const realScore = analysis.real_score || (100 - fraudScore);
  const confidence = analysis.confidence || 0;

  // Feature #1-2: Update verdict
  document.getElementById("verdictHeadline").textContent = analysis.prediction || "Unknown";
  document.getElementById("verdictSub").textContent = 
    fraudScore > 50 ? "Multiple fraud indicators detected" : "No major fraud signals detected";

  document.getElementById("bigScore").textContent = realScore + "%";

  // Feature #10: Risk Meter Gauge
  drawGauge(fraudScore);

  // Feature #11: Confidence Bar
  const confFill = document.getElementById("confFill");
  document.getElementById("confBigNum").textContent = confidence + "%";
  confFill.style.width = confidence + "%";
  document.getElementById("confVerdictText").textContent = `Confidence: ${confidence}% in this assessment`;

  // Feature #12: Confidence Breakdown
  document.getElementById("ruleScore").textContent = analysis.rule_score || 0;
  document.getElementById("mlScore").textContent = analysis.ml_score || 0;
  document.getElementById("hybridScore").textContent = analysis.hybrid_score || fraudScore;
  document.getElementById("confScore").textContent = confidence;

  // Feature #17: Quality Score
  const qualityScore = analysis.quality_score || 50;
  document.getElementById("qualityScore").textContent = qualityScore + "%";

  // Feature #18: Expanded Explanation
  document.getElementById("explText").textContent = analysis.explanation || "";

  // Feature #16: Safety Tips
  if (analysis.safety_tips && analysis.safety_tips.length > 0) {
    const safetyPanel = document.getElementById("safetyTipsPanel");
    safetyPanel.style.display = "block";
    const safetyDiv = document.getElementById("safetyTips");
    safetyDiv.innerHTML = analysis.safety_tips.map(tip => `<p style="margin:5px 0">${tip}</p>`).join("");
  }

  // Feature #7-9: Company Info
  const companyNameEl = document.getElementById("companyName");
  const companyLinksEl = document.getElementById("companyLinks");
  const expTextEl = document.getElementById("expText");
  const trustBadgeEl = document.getElementById("companyTrustBadge");

  if (companyNameEl) companyNameEl.textContent = company.company || "Unknown";
  if (expTextEl) expTextEl.textContent = company.company_info || "Company info not available";

  if (trustBadgeEl) {
    const badge = company.trust_badge || "unknown";
    if (badge === "verified") {
      trustBadgeEl.innerHTML = "🟢 Verified Company";
      trustBadgeEl.style.color = "#059669";
    } else if (badge === "domain") {
      trustBadgeEl.innerHTML = "🟡 Domain Detected";
      trustBadgeEl.style.color = "#d97706";
    } else {
      trustBadgeEl.innerHTML = "🔴 Unverified";
      trustBadgeEl.style.color = "#dc2626";
    }
  }

  if (companyLinksEl) {
    if (company.company && company.company !== "Unknown") {
      const q = encodeURIComponent(company.company);
      companyLinksEl.innerHTML = `
        <a href="https://www.linkedin.com/search/results/all/?keywords=${q}" target="_blank" style="color:#0066cc;margin-right:10px">LinkedIn</a>
        <a href="https://www.google.com/search?q=${q}" target="_blank" style="color:#0066cc;margin-right:10px">Google</a>
        <a href="https://www.glassdoor.com/Reviews/company-reviews.htm?sc.keyword=${q}" target="_blank" style="color:#0066cc">Glassdoor</a>
      `;
    }
  }

  // Feature #13: Red Flags
  const redList = document.getElementById("redFlagsList");
  redList.innerHTML = "";
  const redFlags = analysis.red_flags || [];
  document.getElementById("redCount").textContent = redFlags.length;

  if (redFlags.length === 0) {
    const li = document.createElement("li");
    li.textContent = "✓ No red flags detected";
    li.style.color = "#059669";
    redList.appendChild(li);
  } else {
    redFlags.slice(0, 8).forEach(flag => {
      const li = document.createElement("li");
      li.textContent = "⚠ " + flag;
      redList.appendChild(li);
    });
  }

  // Feature #14: Positive Signals
  const greenList = document.getElementById("greenList");
  greenList.innerHTML = "";
  const signals = analysis.positive_signals || [];
  document.getElementById("greenCount").textContent = signals.length;

  if (signals.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No positive signals detected";
    li.style.color = "#6b7280";
    greenList.appendChild(li);
  } else {
    signals.slice(0, 8).forEach(sig => {
      const li = document.createElement("li");
      li.textContent = "✓ " + sig;
      greenList.appendChild(li);
    });
  }

  // Feature #15: Risk Breakdown Chart
  const riskBreakdown = analysis.risk_breakdown || {};
  const breakdownDiv = document.getElementById("riskBreakdownChart");
  breakdownDiv.innerHTML = "";
  Object.entries(riskBreakdown).slice(0, 4).forEach(([key, value]) => {
    const name = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    breakdownDiv.innerHTML += `
      <div style="padding:8px;background:white;border-radius:8px;border:1px solid #cbd5e1">
        <strong>${name}:</strong> ${value}pts
      </div>
    `;
  });

  // Feature #4: Sentence Highlighting
  displayHighlightedSentences(highlightedSentences);

  // Feature #25: Scan History
  updateScanHistory(scanHistory);

  // Feature #23: Show highlighted text preview
  showResults();
}

/* ================= SENTENCE HIGHLIGHTING (Feature #4, #23) ================= */
function displayHighlightedSentences(sentences) {
  const container = document.getElementById("highlightedText");
  
  if (!container || !sentences || sentences.length === 0) return;
  
  let html = '';
  sentences.forEach(sent => {
    let bgColor = "transparent";
    let textColor = "#334155";
    
    if (sent.type === "danger") {
      bgColor = "#fee2e2";
      textColor = "#7f1d1d";
    } else if (sent.type === "success") {
      bgColor = "#dcfce7";
      textColor = "#166534";
    }
    
    html += `<span style="background:${bgColor};color:${textColor};padding:3px 6px;border-radius:4px;margin:2px 0;display:inline-block">${sent.text}</span> `;
  });
  
  html += '<div style="font-size:0.7rem;color:#94a3b8;margin-top:8px">🔴 Red = High risk | 🟢 Green = Positive signal</div>';
  container.innerHTML = html;
}

/* ================= SCAN HISTORY (Feature #25) ================= */
function updateScanHistory(history) {
  const historyDiv = document.getElementById("scanHistory");
  
  if (!history || history.length === 0) {
    historyDiv.innerHTML = '<p style="color:#94a3b8;font-size:0.8rem">No scans yet</p>';
    return;
  }
  
  let html = '<div style="font-size:0.75rem">';
  history.slice().reverse().forEach((scan, idx) => {
    const riskColor = scan.risk_level.includes("HIGH") ? "#dc2626" : 
                      scan.risk_level.includes("MEDIUM") ? "#d97706" : "#059669";
    html += `
      <div style="padding:8px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between">
        <span>${scan.company}</span>
        <span style="color:${riskColor};font-weight:600">${scan.fraud_score}%</span>
      </div>
    `;
  });
  html += '</div>';
  historyDiv.innerHTML = html;
}

/* ================= GAUGE METER (Feature #10) ================= */
function drawGauge(score) {
  const canvas = document.getElementById("gaugeCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const centerX = 75;
  const centerY = 75;
  const radius = 60;
  
  ctx.clearRect(0, 0, 150, 75);
  
  // Draw gauge background
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
  ctx.stroke();
  
  // Draw gauge fill
  const angle = Math.PI + (score / 100) * Math.PI;
  ctx.strokeStyle = score > 70 ? "#dc2626" : score > 40 ? "#d97706" : "#059669";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, angle);
  ctx.stroke();
  
  // Draw center circle
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw score text
  ctx.fillStyle = "#0f1f3d";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(score, centerX, centerY + 15);
}

/* ================= PDF UPLOAD (Feature #3) ================= */
function handlePDFUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  setLoading(true);
  showLoading();
  animateSteps();

  fetch("/analyze-pdf", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      document.getElementById("jobInput").value = data.extracted_text || "";
      updateMeta();
      displayResults(data);
    })
    .catch(err => {
      setLoading(false);
      showError("PDF analysis failed. Please try again.");
    });
}

/* ================= URL ANALYSIS (Feature #5, #6) ================= */
function analyzeURL() {
  const url = document.getElementById("jobURL").value.trim();
  
  if (!url) {
    alert("Please enter a URL");
    return;
  }

  setLoading(true);
  showLoading();
  animateSteps();

  fetch("/analyze-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      document.getElementById("jobInput").value = data.extracted_text || "";
      updateMeta();
      displayResults(data);
    })
    .catch(err => {
      setLoading(false);
      showError("URL analysis failed. Please check the link.");
    });
}

/* ================= DOWNLOAD REPORT (Feature #19, #20) ================= */
function downloadReport() {
  if (!lastResultData) {
    alert("Run analysis first");
    return;
  }

  fetch("/download-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lastResultData)
  })
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `JobShield_Report_${Date.now()}.pdf`;
      link.click();
    })
    .catch(err => alert("Report download failed"));
}

/* ================= CHAT ASSISTANT (Feature #26) ================= */
function askAssistant(question) {
  const responseDiv = document.getElementById("assistantResponse");
  
  if (!lastAnalysis) {
    responseDiv.textContent = "Please run analysis first.";
    responseDiv.style.display = "block";
    return;
  }
  
  let response = "";
  
  if (question === "why") {
    response = lastAnalysis.explanation || "Analysis shows mixed signals.";
  } else if (question === "verify") {
    response = "✓ Visit the company's official website\n✓ Call HR directly using verified phone numbers\n✓ Check LinkedIn company page\n✓ Search for reviews on Glassdoor\n✓ Never respond via WhatsApp or personal email";
  } else if (question === "safety") {
    response = lastAnalysis.safety_tips ? lastAnalysis.safety_tips.join("\n") : "No specific safety concerns detected.";
  }
  
  responseDiv.textContent = response;
  responseDiv.style.display = "block";
}

/* ================= UI STATE MANAGEMENT ================= */
function showIdle() {
  document.getElementById("idleState").classList.remove("d-none");
  document.getElementById("loadingState").classList.add("d-none");
  document.getElementById("resultsState").classList.add("d-none");
  document.getElementById("errorState").classList.add("d-none");
}

function showLoading() {
  document.getElementById("idleState").classList.add("d-none");
  document.getElementById("loadingState").classList.remove("d-none");
  document.getElementById("resultsState").classList.add("d-none");
  document.getElementById("errorState").classList.add("d-none");
}

function showResults() {
  document.getElementById("idleState").classList.add("d-none");
  document.getElementById("loadingState").classList.add("d-none");
  document.getElementById("resultsState").classList.remove("d-none");
  document.getElementById("errorState").classList.add("d-none");
}

function showError(msg) {
  document.getElementById("idleState").classList.add("d-none");
  document.getElementById("loadingState").classList.add("d-none");
  document.getElementById("resultsState").classList.add("d-none");
  document.getElementById("errorState").classList.remove("d-none");
  document.getElementById("errorMsg").textContent = msg;
}

function setLoading(on) {
  const btn = document.getElementById("analyzeBtn");
  if (btn) btn.disabled = on;
}

/* ================= STEP ANIMATION (Feature #21) ================= */
function animateSteps() {
  ["step1", "step2", "step3", "step4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  setTimeout(() => {
    const el = document.getElementById("step1");
    if (el) el.classList.add("active");
  }, 300);

  setTimeout(() => {
    const el = document.getElementById("step2");
    if (el) el.classList.add("active");
  }, 900);

  setTimeout(() => {
    const el = document.getElementById("step3");
    if (el) el.classList.add("active");
  }, 1500);
  
  setTimeout(() => {
    const el = document.getElementById("step4");
    if (el) el.classList.add("active");
  }, 2100);
}