import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# ==========================================
# 1. MODEL CONFIGURATION
# ==========================================
MAX_SEQ_LENGTH = 2048
MODEL_NAME = "unsloth/mistral-7b-bnb-4bit"

print(f"[+] Loading base model: {MODEL_NAME} with 4-bit quantization...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    load_in_4bit=True,
)

# ==========================================
# 2. CONFIGURE LORA ADAPTERS (QLoRA)
# ==========================================
print("[+] Configuring LoRA adapter matrices (r=16, alpha=16)...")
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing=True,
)

# ==========================================
# 3. LOAD TRAINING DATASET
# ==========================================
print("[+] Loading training dataset from dataset.jsonl...")
dataset = load_dataset("json", data_files={"train": "dataset.jsonl"}, split="train")

def format_chat_prompt(batch):
    formatted_texts = []
    for messages in batch["messages"]:
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        formatted_texts.append(text)
    return {"text": formatted_texts}

dataset = dataset.map(format_chat_prompt, batched=True)

# ==========================================
# 4. SET TRAINING ARGUMENTS
# ==========================================
print("[+] Initializing SFTTrainer with AdamW 8-bit...")
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    dataset_num_proc=2,
    packing=False,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        max_steps=60,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir="outputs",
    ),
)

# ==========================================
# 5. START TRAINING
# ==========================================
print("[*] Starting QLoRA fine-tuning...")
trainer.train()

# ==========================================
# 6. EXPORT MERGED MODEL
# ==========================================
print("[+] Exporting merged 16-bit model to ./trained_model_output...")
model.save_pretrained_merged("trained_model_output", tokenizer, save_method="merged_16bit")
print("[✓] Model fine-tuning and export complete!")
