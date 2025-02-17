
import subprocess

import os
from openai import OpenAI

# Lấy danh sách file thay đổi trong Pull Request
changed_files = subprocess.check_output(["git", "diff", "--name-only", "HEAD~1"]).decode().splitlines()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("Missing OPENAI_API_KEY. Make sure it's set in GitHub Secrets.")


client = OpenAI(
    api_key=api_key,  # This is the default and can be omitted
)

review_comments = []

for file in changed_files:
    if file.endswith((".js", ".py", ".java", ".ts", ".cpp")):  # Chỉ review các file code
        with open(file, "r", encoding="utf-8") as f:
            code = f.read()

        prompt = f"Review the following code and suggest improvements:\n\n{code}"

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        review_comments.append(f"### Review for `{file}`:\n" + response["choices"][0]["message"]["content"])

# Ghi review vào file để GitHub Actions có thể hiển thị
with open(os.getenv("GITHUB_STEP_SUMMARY"), "w") as summary_file:
    summary_file.write("\n\n".join(review_comments))
