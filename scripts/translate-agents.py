#!/usr/bin/env python3
"""
Translate Agents.md from Vietnamese to English
Reduces file size by ~3-5% (UTF-8 Vietnamese chars → ASCII English)
"""

import re

# Vietnamese → English translation dictionary
TRANSLATIONS = {
    # Headers
    "MỤC TIÊU CHÍNH": "PRIMARY GOAL",
    "NGUYÊN TẮC CỐT LÕI": "CORE PRINCIPLES",
    "YÊU CẦU BẮT BUỘC": "MANDATORY REQUIREMENTS",
    "Phong Cách Lập Trình Cá Nhân": "Personal Programming Style",
    "Phương Pháp Thiết Kế": "Design Methodology",
    "Tổ Chức Dự Án": "Project Organization",
    "Quy Trình Phát Triển": "Development Workflow",
    "Chất Lượng Code": "Code Quality",
    "Quy Tắc Giao Diện": "UI/UX Rules",
    "Dọn Dẹp Sau Mỗi Task": "Post-Task Cleanup",
    "TUYỆT ĐỐI TRÁNH": "ABSOLUTELY AVOID",
    "ĐẶC ĐIỂM CÁ NHÂN": "PERSONALITY TRAITS",

    # Common phrases
    "TUYỆT ĐỐI PHẢI": "MUST ABSOLUTELY",
    "TUYỆT ĐỐI KHÔNG": "ABSOLUTELY NO",
    "BẮT BUỘC PHẢI": "MUST",
    "CHỈ ĐƯỢC CHỨA": "MUST ONLY CONTAIN",
    "KHÔNG được có ở root": "FORBIDDEN in root",

    # Descriptions
    "Code từng phần nhỏ, commit nhiều lần theo thời gian": "Code in small parts, commit multiple times over time",
    "giống con người code dần dần": "like humans code gradually",
    "KHÔNG code toàn bộ project một lúc": "NOT entire project at once",
    "KHÔNG code perfect ngay lần đầu": "NOT perfect code first try",
    "đây là dấu hiệu của AI": "this is AI signature",
    "để developer tự quyết định": "let developer decide",
    "giải thích \"tại sao\" (why) chứ không chỉ \"cái gì\" (what)": "explain \"why\" not just \"what\"",
    "học từ existing code": "learn from existing code",
    "giống con người làm việc thực tế": "like real human work",

    # Design
    "sử dụng Human MCP để generate visual mockups": "use Human MCP to generate visual mockups",
    "có lý do toán học rõ ràng và documented": "have clear mathematical reasoning and documented",
    "KHÔNG arbitrary hoặc \"looks good\"": "NOT arbitrary or \"looks good\"",
    "KHÔNG uniform/robotic": "NOT uniform/robotic",
    "tất cả cùng 1 speed": "all same speed",
    "Tỉ mỉ với từng pixel": "Meticulous with every pixel",

    # Organization
    "sau mỗi task hoàn thành": "after each task completion",
    "theo convention rõ ràng": "with clear convention",
    "để prevent garbage files": "to prevent garbage files",
    "xem Section": "see Section",
    "hoặc": "or",
    "ở root": "in root",

    # Workflow
    "mỗi phase": "per phase",
    "sau mỗi change": "after each change",
    "từng phần nhỏ": "in small parts",
    "verify hoạt động trước khi move on": "verify working before moving on",
    "KHÔNG code toàn bộ feature một lúc": "NOT entire feature at once",
    "ngay khi code": "while coding",
    "KHÔNG để lại sau": "NOT leave for later",
    "Nếu không chắc chắn về": "If unsure about",
    "ASK user trước khi proceed": "ASK user before proceeding",

    # UI/UX
    "KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI UI/UX": "NO UNAUTHORIZED UI/UX CHANGES",
    "trừ khi user yêu cầu rõ ràng": "unless user explicitly requests",
    "mà không hỏi user": "without asking user",
    "nếu chúng đang hoạt động tốt": "if they're working well",
    "theo ý riêng của AI": "based on AI's own judgment",
    "LUÔN hỏi user trước": "ALWAYS ask user first",
    "theo đúng yêu cầu của user": "exactly as user requests",

    # Code Quality
    "KHÔNG dùng": "NOT use",
    "dùng": "use",
    "với": "with",
    "enabled": "enabled",

    # Cleanup
    "SAU MỖI TASK HOÀN THÀNH": "AFTER EACH TASK COMPLETION",
    "Tìm các file rác": "Find garbage files",
    "Check và remove unused imports": "Check and remove unused imports",
    "trong mọi files đã modify": "in all modified files",
    "Sử dụng ESLint để detect": "Use ESLint to detect",
    "nếu cần rebuild": "if rebuild needed",
    "Đảm bảo mọi files ở đúng folder": "Ensure all files in correct folders",
    "KHÔNG có files lạc loài": "NO misplaced files",
    "Nếu KHÔNG chắc chắn có nên xóa file hay không": "If UNSURE whether to delete file",
    "để review sau": "for later review",
    "KHÔNG xóa trực tiếp nếu không chắc chắn": "NOT delete directly if unsure",
    "Hỏi user trước khi xóa files quan trọng": "Ask user before deleting important files",

    # AI Patterns
    "unrealistic, dấu hiệu AI": "unrealistic, AI signature",
    "obvious, redundant": "obvious, redundant",
    "too generic - dùng descriptive names": "too generic - use descriptive names",
    "unrealistic - commit incrementally": "unrealistic - commit incrementally",
    "varied timing, natural imperfections": "varied timing, natural imperfections",
    "trong project": "in project",

    # Response Patterns
    "KHÔNG tạo response dạng markdown summary": "NO markdown summary responses",
    "trừ khi user yêu cầu rõ ràng": "unless user explicitly requests",
    "KHÔNG dùng quá nhiều": "NO excessive",
    "KHÔNG giải thích dài dòng những gì đã làm": "NO verbose explanations of what was done",
    "user có thể đọc code/logs": "user can read code/logs",
    "just report facts": "just report facts",
    "KHÔNG làm/nói quá những gì user yêu cầu": "NO doing/saying more than user requested",

    # Examples
    "trước": "before",
    "sau": "after",
    "was": "was",

    # Critical Rules
    "KHÔNG xóa files trong": "NO deleting files in",
    "KHÔNG xóa files nếu không chắc chắn": "NO deleting files if unsure",
    "Move to": "Move to",
    "instead": "instead",
    "KHÔNG cleanup ảnh hưởng đến": "NO cleanup affecting",
    "kết cấu, thiết kế, functionality của project": "structure, design, functionality of project",
    "LUÔN verify project hoạt động bình thường sau cleanup": "ALWAYS verify project works normally after cleanup",
    "LUÔN backup": "ALWAYS backup",
    "trước khi cleanup nếu có nhiều files cần xóa": "before cleanup if many files to delete",
}

def translate_line(line):
    """Translate a single line from Vietnamese to English"""
    result = line

    # Sort by length (longest first) to avoid partial replacements
    for vn, en in sorted(TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True):
        result = result.replace(vn, en)

    return result

def main():
    input_file = "Agents.md"
    output_file = "Agents.md.new"

    print(f"Translating {input_file}...")

    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    translated_lines = []
    for i, line in enumerate(lines, 1):
        translated = translate_line(line)
        translated_lines.append(translated)

        if i % 100 == 0:
            print(f"Processed {i}/{len(lines)} lines...")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(translated_lines)

    # Calculate size reduction
    import os
    old_size = os.path.getsize(input_file)
    new_size = os.path.getsize(output_file)
    reduction = ((old_size - new_size) / old_size) * 100

    print(f"\n✅ Translation complete!")
    print(f"Old size: {old_size:,} bytes")
    print(f"New size: {new_size:,} bytes")
    print(f"Reduction: {reduction:.1f}%")
    print(f"\nOutput: {output_file}")
    print(f"\nTo apply: mv {output_file} {input_file}")

if __name__ == "__main__":
    main()
