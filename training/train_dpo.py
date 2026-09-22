import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import DPOTrainer, DPOConfig

# ==========================================
# 1. LOAD FINE-TUNED BASE MODEL
# ==========================================
MODEL_PATH = "./trained_model_output"
MAX_SEQ_LENGTH = 2048

print(f"[+] Loading model from {MODEL_PATH} for DPO alignment...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_PATH,
    max_seq_length=MAX_SEQ_LENGTH,
    load_in_4bit=True,
)

# ==========================================
# 2. CONFIGURE DPO PEFT ADAPTERS
# ==========================================
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
)

# ==========================================
# 3. LOAD DPO PREFERENCE DATASET
# ==========================================
print("[+] Loading DPO preference pairs from dpo_dataset.jsonl...")
dataset = load_dataset("json", data_files={"train": "dpo_dataset.jsonl"}, split="train")

# ==========================================
# 4. SET DPO TRAINING CONFIGURATION
# ==========================================
dpo_config = DPOConfig(
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    warmup_ratio=0.1,
    max_steps=40,
    learning_rate=5e-6,
    fp16=not torch.cuda.is_bf16_supported(),
    bf16=torch.cuda.is_bf16_supported(),
    logging_steps=1,
    optim="adamw_8bit",
    output_dir="dpo_outputs",
    beta=0.1,
)

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=None,
    tokenizer=tokenizer,
    train_dataset=dataset,
    max_length=MAX_SEQ_LENGTH,
    max_prompt_length=512,
    args=dpo_config,
)

# ==========================================
# 5. EXECUTE DPO TRAINING & SAVE
# ==========================================
print("[*] Running Direct Preference Optimization (DPO)...")
dpo_trainer.train()

print("[+] Saving fully aligned model to ./aligned_model_output...")
model.save_pretrained_merged("aligned_model_output", tokenizer, save_method="merged_16bit")
print("[✓] DPO Alignment successfully completed!")
