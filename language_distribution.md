cloc|github.com/AlDanial/cloc v 2.08  T=15.15 s (1.1 files/s, 201.2 lines/s)
--- | ---

Language|files|blank %|comment %|code %
:-------|-------:|-------:|-------:|-------:
JavaScript|5|44.52|87.05|57.96|
HTML|1|7.10|0.00|11.85|
CSS|2|20.65|2.07|10.26|
Text|1|0.00|0.00|7.11|
Rust|1|6.45|9.33|6.22|
Markdown|2|14.84|0.00|2.56|
YAML|2|5.81|1.04|2.07|
TypeScript|1|0.00|0.00|1.22|
TOML|1|0.65|0.52|0.74|
--------|--------|--------|--------|--------
SUM:|16|100.00|100.00|100.00

```bash
cloc . --vcs=git --md --report-file=code_stats.md --exclude-dir="public" --percent --exclude-ext="json"
mv code_stats.md language_distribution.md
```