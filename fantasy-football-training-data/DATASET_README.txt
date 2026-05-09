DYNASTY FANTASY FOOTBALL - TRAINING-READY DATASETS
====================================================
Generated: 2026-05-08

This directory now contains TWO ready-to-train JSONL datasets converted from
the source corpus. Pick whichever format your fine-tuning pipeline expects.

================================================================
FILE 1: dynasty_dataset_instruction.jsonl  (RECOMMENDED FOR UNSLOTH)
================================================================
- Format:     JSON Lines (one JSON object per line)
- Schema:     OpenAI / Hugging Face "messages" chat format
- Examples:   487
- Size:       1.28 MB

Each line looks like:
{"messages": [
  {"role": "system",    "content": "You are an expert dynasty fantasy football analyst..."},
  {"role": "user",      "content": "How should I approach a startup draft?"},
  {"role": "assistant", "content": "..."}
]}

This is the format Unsloth Studio expects for instruction / SFT (supervised
fine-tuning). Upload this file directly to Unsloth Studio for fine-tuning.

The dataset includes:
- 1 whole-document Q&A example per source file (broad topic coverage).
- Multiple section-level Q&A examples per file (one per section header).
- 12 hand-crafted scenario Q&A pairs for instruction-following diversity
  (orphan team takeover, age-cliff trade decisions, FAAB strategy, SF
  rookie QB picks, TEP impact, process-vs-results, "studs win", liquidity,
  etc.).

================================================================
FILE 2: dynasty_dataset_pretraining.jsonl  (FOR CONTINUED PRETRAINING)
================================================================
- Format:     JSON Lines (one JSON object per line)
- Schema:     {"text": "..."}
- Examples:   475
- Size:       1.02 MB

Each line looks like:
{"text": "<chunk of corpus content>"}

Use this if your pipeline supports continued pretraining (CPT) instead of
or alongside SFT. CPT teaches the model the domain language and concepts
without forcing it into a Q&A format.

================================================================
WHICH ONE TO UPLOAD TO UNSLOTH?
================================================================
- Unsloth Studio default workflow: dynasty_dataset_instruction.jsonl
- Both files can be used in sequence (CPT first, then SFT) for stronger
  domain transfer, but the instruction file alone is sufficient.

================================================================
DATASET BUILD METHOD
================================================================
The build script (_build_dataset.ps1) is preserved in this directory.
You can re-run it any time the source corpus changes:

  pwsh -File _build_dataset.ps1

It mechanically chunks each source .txt file into question-answer pairs
based on section headers, prepends a domain-expert system prompt to each
example, and emits the JSONL files. It also appends the hand-crafted
scenario examples at the end of the instruction file.

================================================================
SOURCE-MATERIAL FILES (PRESERVED, NOT REQUIRED FOR TRAINING)
================================================================
The original 58 .txt source files and the COMBINED corpus are still in
this directory unchanged. The dataset files are derived from them. You do
NOT need to upload the source files to Unsloth - just the JSONL.

================================================================
VALIDATION
================================================================
Both JSONL files have been validated:
- All 487 lines in instruction file parse as valid JSON with messages key.
- All 475 lines in pretraining file parse as valid JSON with text key.
- UTF-8 encoding without BOM (Unsloth-compatible).

If Unsloth still complains, double-check:
1. You uploaded the .jsonl file (not the .txt corpus).
2. Your Unsloth pipeline expects "messages" format (most do). If it
   expects "conversations" / ShareGPT format, the build script can be
   modified to emit that format instead - ask and I'll adjust.
