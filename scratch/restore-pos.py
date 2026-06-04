import json

log_path = r"C:\Users\jsilv\.gemini\antigravity\brain\4d9ca700-8501-46c7-8d19-92378a9575de\.system_generated\logs\transcript.jsonl"
out_path = r"c:\Users\jsilv\Desktop\My Projects\the gilded fork\scratch\steps_utf8.txt"

print("Extracting...")
results = []
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            idx = step.get("step_index")
            if idx in [193, 199]:
                results.append(step)
        except Exception as e:
            pass

with open(out_path, "w", encoding="utf-8") as out:
    for res in results:
        out.write(f"=== STEP {res['step_index']} ===\n")
        out.write(json.dumps(res.get("tool_calls"), indent=2))
        out.write("\n\n")

print("Done writing steps_utf8.txt")
