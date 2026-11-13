#!/usr/bin/env python3
"""Beacon Worship rebrand: replace user-visible 'FreeShow' with 'Beacon Worship'.

Deliberately PRESERVES:
  * the on-disk data folder name  -> changing it would orphan the operator's existing library
  * URLs (github.com/ChurchApps/FreeShow, freeshow.app, youtu.be links) -> would break links
  * GPL / upstream attribution in About.svelte and the API-key licence note -> legal requirement
  * code identifiers (FreeShowAction, addFreeShowWindows, freeshowLogo) -> no user-visible effect
  * asset file paths (import-logos/freeshow.webp)
"""
import io
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DRY = "--apply" not in sys.argv

WORD = re.compile(r"\bFreeShow\b")

# Lines matching any of these are left completely untouched.
PROTECTED_LINE = [
    r"github\.com",
    r"freeshow\.app",
    r"https?://",
    r"appFolderName",                     # ~/Documents/FreeShow data root
    r"Documents[/\\]+FreeShow",           # data / media sync paths
    r"import-logos/freeshow",             # asset path
    r"GPL-3\.0",                          # licence attribution
    r"upstream copyright",
    r"not allowed to used these keys",    # API key licence note
    r"independent customized build based on",
    r"path\.join",                        # real filesystem paths (downloads/FreeShow)
    r"getDataFolderPath|downloadsPath",
]
PROTECTED_RE = [re.compile(p, re.I) for p in PROTECTED_LINE]

# Whole files that must not be touched.
PROTECTED_FILES = {
    "src/electron/utils/keys.ts",
    "src/frontend/components/main/popups/About.svelte",
    "src/electron/utils/files.ts",   # data folder root + Documents/FreeShow comments
    "package.json",
    "package-lock.json",
    # these assert on the literal "FreeShow" to prove the rebrand worked
    "tests/regression/app.regression.ts",
}

SCAN_DIRS = ["src", "public/lang", "tests", "scripts"]
EXTS = {".ts", ".svelte", ".json", ".js", ".mjs", ".html", ".css"}


def protected(line: str) -> bool:
    return any(r.search(line) for r in PROTECTED_RE)


def rebrand_line(line: str) -> str:
    if protected(line):
        return line
    return WORD.sub("Beacon Worship", line)


def main():
    changed_files = []
    total = 0
    skipped = []

    for d in SCAN_DIRS:
        for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, d)):
            dirnames[:] = [x for x in dirnames if x not in {"node_modules", ".git", "dist", "build"}]
            for fn in filenames:
                ext = os.path.splitext(fn)[1]
                if ext not in EXTS:
                    continue
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, ROOT)
                if rel in PROTECTED_FILES:
                    continue
                # test fixtures assert on their own literals; leave them alone
                if ".test." in fn:
                    continue

                src = io.open(full, encoding="utf-8").read()
                if "FreeShow" not in src:
                    continue

                out_lines = []
                n = 0
                for line in src.split("\n"):
                    new = rebrand_line(line)
                    if new != line:
                        n += len(WORD.findall(line)) - len(WORD.findall(new))
                    elif "FreeShow" in line and WORD.search(line):
                        skipped.append((rel, line.strip()[:110]))
                    out_lines.append(new)

                if n:
                    changed_files.append((rel, n))
                    total += n
                    if not DRY:
                        io.open(full, "w", encoding="utf-8", newline="").write("\n".join(out_lines))

    print(("DRY RUN" if DRY else "APPLIED") + f": {total} replacements in {len(changed_files)} files\n")
    for rel, n in sorted(changed_files, key=lambda a: -a[1]):
        print(f"  {n:3d}  {rel}")
    if skipped:
        print(f"\nPROTECTED ({len(skipped)} lines kept):")
        for rel, line in skipped[:25]:
            print(f"  {rel}: {line}")


if __name__ == "__main__":
    main()
