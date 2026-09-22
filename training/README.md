# Complete AI Model Fine-Tuning, Memory & Behavior Execution Pipeline

This repository directory contains all training data formats, LoRA adapter configurations, vector database indexing scripts, and DPO alignment code.

---

## 📁 Directory Structure
```
aetheris-ai/
├── knowledge_base/               # Knowledge source text files for RAG
│   ├── 01_creator_profile.txt
│   ├── 02_fullstack_engineering.txt
│   ├── 03_ai_transformers_rag.txt
│   ├── 04_bangladesh_history_geography.txt
│   └── 05_mathematics_science.txt
└── training/                     # Fine-tuning & alignment scripts
    ├── dataset.jsonl             # Section 1.1 QLoRA dataset
    ├── train_qlora.py            # Section 1.2 QLoRA training script
    ├── rag_pipeline.py           # Section 2.1 ChromaDB RAG vector script
    ├── dpo_dataset.jsonl         # Section 3.2 DPO preference dataset
    ├── train_dpo.py              # Section 3.2 DPO alignment script
    └── requirements.txt          # Python dependencies
```

---

## 🚀 Execution Workflow (Step-by-Step)

### Step 1: Install Python Dependencies
```bash
pip install -r training/requirements.txt
```

### Step 2: Index External Knowledge Base (RAG & ChromaDB)
```bash
cd training
python rag_pipeline.py
```
*Result: Generates `./chroma_db` vector database containing indexed knowledge embeddings.*

### Step 3: Run QLoRA Base Model Fine-Tuning
```bash
python train_qlora.py
```
*Result: Fine-tunes the base model on `dataset.jsonl` and exports the merged model into `./trained_model_output`.*

### Step 4: Run Direct Preference Optimization (DPO Alignment)
```bash
python train_dpo.py
```
*Result: Aligns model behavior to eliminate hallucinations using `dpo_dataset.jsonl` and exports to `./aligned_model_output`.*

### Step 5: Web Application Runtime Integration
The Next.js web application automatically applies the Section 3.1 system prompt directive and runtime RAG context injection across all chat sessions.
