"""
JobShield AI v2.0 — ML Model Training
Enhanced training pipeline with better feature engineering
"""

import pandas as pd
import numpy as np
import joblib
import warnings
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import matplotlib.pyplot as plt

warnings.filterwarnings('ignore')

print("=" * 70)
print("JobShield AI v2.0 — ML Model Training Pipeline")
print("=" * 70)

# ================================================================
# STEP 1: LOAD & EXPLORE DATA
# ================================================================
print("\n[STEP 1] Loading dataset...")

try:
    df = pd.read_csv("data/fake_job_postings.csv")
    print(f"✓ Dataset loaded: {df.shape[0]} records")
except FileNotFoundError:
    print("❌ Dataset not found. Please ensure 'data/fake_job_postings.csv' exists")
    print("   You can download from: https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction")
    exit(1)

# Display info
print(f"\nDataset Info:")
print(f"  Total records: {df.shape[0]}")
print(f"  Total columns: {df.shape[1]}")
print(f"  Missing values: {df.isnull().sum().sum()}")

# Check columns
required_cols = ['description', 'title', 'fraudulent']
missing = [col for col in required_cols if col not in df.columns]
if missing:
    print(f"⚠️  Missing columns: {missing}")
    print(f"Available columns: {df.columns.tolist()}")
    exit(1)

# ================================================================
# STEP 2: DATA CLEANING & PREPROCESSING
# ================================================================
print("\n[STEP 2] Data preprocessing...")

# Fill missing values
df = df.fillna("")

# Remove duplicates
df = df.drop_duplicates(subset=['description', 'title'], keep='first')
print(f"✓ Duplicates removed: {df.shape[0]} unique records")

# Combine text features
df['text'] = df['title'].fillna("") + " " + df['description'].fillna("")

# Class distribution
print(f"\nClass Distribution:")
print(df['fraudulent'].value_counts())
print(f"Fraud %: {(df['fraudulent'].sum() / len(df) * 100):.2f}%")

# Balance check
if df['fraudulent'].value_counts()[0] > df['fraudulent'].value_counts()[1] * 2:
    print("⚠️  Dataset is imbalanced. Using class weights in model.")

# ================================================================
# STEP 3: FEATURE ENGINEERING
# ================================================================
print("\n[STEP 3] Feature engineering...")

# Text length features
df['title_length'] = df['title'].str.len()
df['description_length'] = df['description'].str.len()
df['word_count'] = df['text'].str.split().str.len()
df['sentence_count'] = df['text'].str.split(r'[.!?]').str.len()

# Language features
df['has_urls'] = df['text'].str.contains(r'https?://', regex=True).astype(int)
df['has_email'] = df['text'].str.contains(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', regex=True).astype(int)
df['has_phone'] = df['text'].str.contains(r'\b\d{10}\b', regex=True).astype(int)

# Risk keywords
risk_keywords = [
    'payment', 'fee', 'registration', 'urgent', 'immediate', 'whatsapp',
    'telegram', 'bank details', 'credit card', 'aadhar', 'ssn',
    'guaranteed income', 'earn easy', 'limited time', 'apply now'
]
df['risk_keyword_count'] = 0
for keyword in risk_keywords:
    df['risk_keyword_count'] += df['text'].str.lower().str.count(keyword)

# Trust keywords
trust_keywords = [
    'responsibilities', 'requirements', 'benefits', 'experience',
    'skills', 'location', 'department', 'salary', 'pvt ltd',
    'limited', 'incorporated', 'official', 'careers'
]
df['trust_keyword_count'] = 0
for keyword in trust_keywords:
    df['trust_keyword_count'] += df['text'].str.lower().str.count(keyword)

df['keyword_ratio'] = (df['risk_keyword_count'] + 1) / (df['trust_keyword_count'] + 1)

print("✓ Engineered features:")
print(f"  - Text length features")
print(f"  - URL/Email/Phone detection")
print(f"  - Risk/Trust keyword counters")
print(f"  - Keyword ratio")

# ================================================================
# STEP 4: PREPARE DATA SPLITS
# ================================================================
print("\n[STEP 4] Preparing data splits...")

X = df['text']
y = df['fraudulent']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✓ Train set: {len(X_train)} samples")
print(f"✓ Test set: {len(X_test)} samples")
print(f"  Train fraud %: {(y_train.sum() / len(y_train) * 100):.2f}%")
print(f"  Test fraud %: {(y_test.sum() / len(y_test) * 100):.2f}%")

# ================================================================
# STEP 5: BUILD & TRAIN MODEL
# ================================================================
print("\n[STEP 5] Training models...")

# Model 1: Logistic Regression (Fast & Interpretable)
print("\n  Training Logistic Regression...")
model_lr = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        lowercase=True
    )),
    ('clf', LogisticRegression(
        max_iter=500,
        random_state=42,
        class_weight='balanced',
        solver='lbfgs'
    ))
])

model_lr.fit(X_train, y_train)
pred_lr = model_lr.predict(X_test)
pred_lr_proba = model_lr.predict_proba(X_test)[:, 1]
acc_lr = accuracy_score(y_test, pred_lr)
print(f"    ✓ Accuracy: {acc_lr:.4f}")

# Model 2: Random Forest (Ensemble)
print("\n  Training Random Forest...")
model_rf = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=3000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )),
    ('clf', RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    ))
])

model_rf.fit(X_train, y_train)
pred_rf = model_rf.predict(X_test)
pred_rf_proba = model_rf.predict_proba(X_test)[:, 1]
acc_rf = accuracy_score(y_test, pred_rf)
print(f"    ✓ Accuracy: {acc_rf:.4f}")

# Model 3: Gradient Boosting (Advanced Ensemble)
print("\n  Training Gradient Boosting...")
model_gb = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=3000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )),
    ('clf', GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    ))
])

model_gb.fit(X_train, y_train)
pred_gb = model_gb.predict(X_test)
pred_gb_proba = model_gb.predict_proba(X_test)[:, 1]
acc_gb = accuracy_score(y_test, pred_gb)
print(f"    ✓ Accuracy: {acc_gb:.4f}")

# ================================================================
# STEP 6: EVALUATE MODELS
# ================================================================
print("\n[STEP 6] Model Evaluation...")

models = {
    'Logistic Regression': (model_lr, pred_lr, pred_lr_proba),
    'Random Forest': (model_rf, pred_rf, pred_rf_proba),
    'Gradient Boosting': (model_gb, pred_gb, pred_gb_proba)
}

results = {}

for name, (model, preds, proba) in models.items():
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)
    auc = roc_auc_score(y_test, proba)
    
    results[name] = {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'auc': auc}
    
    print(f"\n{name}:")
    print(f"  Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {auc:.4f}")
    
    # Confusion matrix
    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
    print(f"  Confusion Matrix: TP={tp}, TN={tn}, FP={fp}, FN={fn}")

# ================================================================
# STEP 7: SELECT BEST MODEL & SAVE
# ================================================================
print("\n[STEP 7] Saving best model...")

best_model_name = max(results, key=lambda x: results[x]['f1'])
best_model = models[best_model_name][0]

print(f"\n✓ Best Model: {best_model_name} (F1={results[best_model_name]['f1']:.4f})")

# Save model
joblib.dump(best_model, "model.pkl")
print("✓ Model saved as 'model.pkl'")

# Save metadata
metadata = {
    'model_name': best_model_name,
    'training_date': pd.Timestamp.now().isoformat(),
    'test_accuracy': results[best_model_name]['accuracy'],
    'test_precision': results[best_model_name]['precision'],
    'test_recall': results[best_model_name]['recall'],
    'test_f1': results[best_model_name]['f1'],
    'test_auc': results[best_model_name]['auc'],
    'total_samples': len(df),
    'fraud_percentage': (df['fraudulent'].sum() / len(df)) * 100,
    'features': ['description', 'title'],
}

import json
with open("model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("✓ Metadata saved as 'model_metadata.json'")

# ================================================================
# STEP 8: CROSS-VALIDATION
# ================================================================
print("\n[STEP 8] Cross-validation (5-fold)...")

cv_scores = cross_val_score(best_model, X_train, y_train, cv=5, scoring='f1')
print(f"✓ CV F1 Scores: {cv_scores}")
print(f"  Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# ================================================================
# SUMMARY
# ================================================================
print("\n" + "=" * 70)
print("TRAINING COMPLETE!")
print("=" * 70)
print(f"\n📊 Model Performance Summary:")
print(f"  Accuracy:  {results[best_model_name]['accuracy']:.2%}")
print(f"  Precision: {results[best_model_name]['precision']:.2%}")
print(f"  Recall:    {results[best_model_name]['recall']:.2%}")
print(f"  F1-Score:  {results[best_model_name]['f1']:.4f}")
print(f"  ROC-AUC:   {results[best_model_name]['auc']:.4f}")
print(f"\n✅ Model ready for production!")
print(f"   Use: model = joblib.load('model.pkl')")
print(f"   Then: predictions = model.predict(job_texts)")