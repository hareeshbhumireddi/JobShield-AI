# JobShield AI v2.0 — Complete Installation & Usage Guide

## 📦 What's Included

```
jobshield-ai/
├── app_v2.py                    # Flask backend (MAIN APP)
├── app_v2.js                    # Frontend logic (REPLACE app.js)
├── train_model_v2.py            # ML training script
├── setup.sh                      # Automated setup script
├── requirements.txt             # Python dependencies
├── README_v2.md                 # Full documentation
├── IMPROVEMENTS_v2.md           # Feature list & improvements
├── INSTALLATION.md              # This file
│
├── templates/
│   └── index.html               # Frontend (ENHANCED)
│
├── static/
│   ├── js/
│   │   └── app_v2.js            # (Replace app.js with this)
│   └── css/
│       └── style.css            # (Keep as is - already premium)
│
└── data/
    └── fake_job_postings.csv    # (Download from Kaggle)
```

---

## 🚀 Installation (3 Methods)

### METHOD 1: Automated Setup (RECOMMENDED)

**Best for:** Linux/Mac users

```bash
# 1. Make setup script executable
chmod +x setup.sh

# 2. Run setup
./setup.sh

# That's it! The app will start at http://localhost:5000
```

The script will:
- ✅ Check Python version
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Train ML model (if data available)
- ✅ Start the application

---

### METHOD 2: Manual Setup (Step-by-Step)

**Best for:** Windows users or those who prefer control

#### Step 1: Install Python
Download Python 3.9+ from [python.org](https://www.python.org/)

#### Step 2: Create Project Structure
```bash
mkdir jobshield-ai
cd jobshield-ai

# Create folders
mkdir templates static/js static/css data
```

#### Step 3: Copy Files
Copy these files to your project:
- `app_v2.py` → `app.py` (rename)
- `app_v2.js` → `static/js/app.js` (rename)
- `style.css` → `static/css/style.css` (keep name)
- `index.html` → `templates/index.html` (keep)
- `train_model_v2.py` → `train_model.py` (rename)
- `requirements.txt` → `requirements.txt` (keep)

#### Step 4: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Step 5: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 6: Download Training Data
1. Go to [Kaggle Dataset](https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction)
2. Download `fake_job_postings.csv`
3. Save to `data/fake_job_postings.csv`

#### Step 7: Train ML Model
```bash
python train_model.py
```

Expected output:
```
[STEP 1] Loading dataset...
✓ Dataset loaded: 18000 records

[STEP 5] Training models...
  Training Logistic Regression... ✓ Accuracy: 0.9312
  Training Random Forest... ✓ Accuracy: 0.9453
  Training Gradient Boosting... ✓ Accuracy: 0.9589

[STEP 7] Saving best model...
✓ Best Model: Gradient Boosting (F1=0.947)
✓ Model saved as 'model.pkl'
```

#### Step 8: Run Application
```bash
python app.py
```

Success message:
```
🚀 JobShield AI v2.0 running at http://localhost:5000
✅ Enhanced ML model with 50+ fraud patterns
✅ Sentence-level analysis
✅ 150+ company database
```

---

### METHOD 3: Docker (For Production)

#### Step 1: Create Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Set environment
ENV FLASK_APP=app_v2.py
ENV FLASK_ENV=production

# Run app
CMD ["python", "app_v2.py"]
```

#### Step 2: Build and Run
```bash
# Build image
docker build -t jobshield-ai:v2.0 .

# Run container
docker run -p 5000:5000 jobshield-ai:v2.0

# Access at http://localhost:5000
```

---

## 📝 Configuration

### Important: Update app_v2.py

Before running, update these lines in `app_v2.py`:

```python
# Line 28 (for production)
@app.route("/")
def index():
    return render_template("index.html")  # Flask will find templates/index.html

# Line ~850 (for production)
if __name__ == "__main__":
    print("🚀 JobShield AI v2.0 running at http://localhost:5000")
    app.run(debug=False, host="0.0.0.0", port=5000)  # For deployment
```

### Optional: Add API Key Protection

```python
# Add authentication
from functools import wraps

API_KEY = os.environ.get('API_KEY', 'your-secret-key')

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'POST':
            key = request.headers.get('X-API-Key')
            if key != API_KEY:
                return jsonify({"error": "Invalid API key"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route("/analyze", methods=["POST"])
@require_api_key
def analyze():
    # ... rest of code
```

---

## 🧪 Testing the Installation

### Test 1: HTML Page Loads
```bash
# Open browser
http://localhost:5000

# You should see:
# ✓ JobShield AI header
# ✓ Input panel on left
# ✓ Results panel on right
# ✓ Animated background
```

### Test 2: Analyze Example
```bash
# Click "Fake #1" under "Load example:"
# Click "Run Analysis"

# Expected result (in ~3 seconds):
# ✓ Verdict: Fake Job Posting
# ✓ Fraud Risk: ~80%
# ✓ Red Flags: Payment Request, Urgency Language
```

### Test 3: API Test (using curl)
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Join our team! No experience needed. Earn ₹50,000/day. Pay ₹2,000 registration fee via WhatsApp.",
    "url": ""
  }'

# Expected response:
{
  "analysis": {
    "fraud_score": 85,
    "real_score": 15,
    "prediction": "Fake Job Posting",
    "risk_level": "🔴 HIGH RISK",
    "red_flags": [
      "Payment Request",
      "Unrealistic Salary",
      "Suspicious Contact"
    ]
  },
  ...
}
```

### Test 4: PDF Upload
```bash
# Create a test PDF with text:
#   "Software Developer at Google. 5+ years experience required.
#    Apply at careers.google.com"

# Upload via web interface
# Expected: Real Job Posting (low fraud score)
```

### Test 5: URL Analysis
```bash
# Input: https://careers.google.com/job-posting-id
# Or any LinkedIn job URL

# Expected:
# ✓ Text extracted
# ✓ Company verified
# ✓ Trust score calculated
```

---

## ⚙️ Customization

### Add Your Own Company
Edit `app_v2.py`, find `COMPANY_DB`:
```python
COMPANY_DB = {
    # ... existing companies ...
    
    # Add your company
    "acme": ("ACME Corporation", "Technology", 2020, True),
}
```

### Adjust Fraud Thresholds
Edit `app_v2.py`, search for `if hybrid_fraud`:
```python
# Current thresholds:
if hybrid_fraud >= 75:     # HIGH RISK
elif hybrid_fraud >= 50:   # MEDIUM RISK
else:                      # LOW RISK

# Change to:
if hybrid_fraud >= 60:     # More lenient
elif hybrid_fraud >= 35:
else:
```

### Modify Model Weights
Edit `app_v2.py`, find `hybrid_fraud = int`:
```python
# Current: 55% rules + 45% ML
hybrid_fraud = int((rule_fraud * 0.55) + (ml_fraud_prob * 0.45))

# Change to: 60% rules + 40% ML
hybrid_fraud = int((rule_fraud * 0.60) + (ml_fraud_prob * 0.40))
```

---

## 📊 File Structure After Setup

```
jobshield-ai/
├── app_v2.py                    # Backend (2000+ lines)
├── requirements.txt             # Dependencies
├── model.pkl                    # ML model (15MB)
├── model_metadata.json          # Model info
│
├── templates/
│   └── index.html               # Frontend (1500+ lines)
│
├── static/
│   ├── js/
│   │   └── app_v2.js           # JS logic (500+ lines)
│   └── css/
│       └── style.css           # Styling (2000+ lines)
│
├── data/
│   └── fake_job_postings.csv   # Training data (40MB)
│
├── venv/                        # Virtual environment
│   ├── bin/
│   ├── lib/
│   └── pyvenv.cfg
│
└── README_v2.md                # Documentation
```

---

## 🔧 Troubleshooting

### Issue: Port 5000 Already in Use

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in app_v2.py
app.run(debug=True, port=5001)
```

### Issue: ModuleNotFoundError

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Model Not Loading

**Solution:**
```bash
# Check if model.pkl exists
ls -la model.pkl

# If missing, retrain:
python train_model_v2.py

# The app will still work without it (rules-only mode)
```

### Issue: Slow Performance

**Solution 1:** Reduce model complexity
```python
# In train_model_v2.py
TfidfVectorizer(max_features=3000)  # Reduce from 5000
```

**Solution 2:** Use faster model
```python
# Use Logistic Regression instead of Gradient Boosting
# (Faster but slightly less accurate)
```

**Solution 3:** Enable caching
```python
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@cache.cached(timeout=300)
@app.route("/analyze")
def analyze():
    ...
```

### Issue: PDF Extraction Not Working

**Solution:**
```bash
# Ensure PyPDF2 is installed
pip install PyPDF2==4.0.1

# Try with a text-based PDF (not scanned image)
```

---

## 📞 Getting Help

### Step 1: Check Logs
```bash
# App outputs logs to console
# Look for error messages when you run the analysis
```

### Step 2: Verify Installation
```bash
# Check Python version
python --version  # Should be 3.8+

# Check installed packages
pip list  # Should show Flask, scikit-learn, etc.

# Check model file
ls -lh model.pkl  # Should exist and be 10-20MB
```

### Step 3: Test with Examples
```bash
# Use built-in examples to verify system works
# Click "Fake #1" then "Run Analysis"
# Should complete in 3-5 seconds
```

---

## 🎯 Next Steps

### 1. Verify Installation (5 min)
- [ ] Open http://localhost:5000
- [ ] Click "Fake #1" example
- [ ] Click "Run Analysis"
- [ ] Verify results appear

### 2. Test Your Own Job (10 min)
- [ ] Paste a real job description
- [ ] Verify it shows "Real Job Posting"
- [ ] Download PDF report

### 3. Explore Features (15 min)
- [ ] Try PDF upload
- [ ] Try URL analysis
- [ ] Check sentence highlighting
- [ ] Review confidence breakdown

### 4. Customize (20 min)
- [ ] Add your company to database
- [ ] Adjust fraud thresholds
- [ ] Modify ML weights
- [ ] Test again

### 5. Deploy (30 min)
- [ ] Set up production server
- [ ] Configure HTTPS
- [ ] Set up monitoring
- [ ] Deploy Docker image

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README_v2.md` | Full documentation |
| `IMPROVEMENTS_v2.md` | What's new in v2.0 |
| `INSTALLATION.md` | This setup guide |
| App code comments | Inline explanations |

---

## ✅ Installation Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Training data downloaded (optional but recommended)
- [ ] ML model trained (`python train_model.py`)
- [ ] App started (`python app.py`)
- [ ] Browser opens to http://localhost:5000
- [ ] Example analysis works
- [ ] Custom job description tested
- [ ] PDF report downloaded

---

## 🎉 Success!

If all tests pass, your JobShield AI v2.0 installation is complete!

**Next:** Start analyzing job postings or deploy to production.

---

**Questions?** Review README_v2.md for detailed documentation.