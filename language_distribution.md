cloc|github.com/AlDanial/cloc v 2.08  T=1.89 s (7.4 files/s, 1538.4 lines/s)
--- | ---

Language|files|blank %|comment %|code %
:-------|-------:|-------:|-------:|-------:
JavaScript|5|50.00|85.64|55.66|
CSS|2|18.67|2.05|10.90|
Rust|1|10.24|10.77|10.50|
HTML|1|3.01|0.00|9.60|
Text|1|0.00|0.00|7.55|
Markdown|1|12.05|0.00|2.01|
YAML|1|5.42|1.03|1.85|
TypeScript|1|0.00|0.00|1.30|
TOML|1|0.60|0.51|0.63|
--------|--------|--------|--------|--------
SUM:|14|100.00|100.00|100.00

```bash
cloc . --vcs=git --md --report-file=code_stats.md --exclude-dir="public" --percent --exclude-ext="json"
mv code_stats.md language_distribution.md
```