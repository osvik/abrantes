# AGENTS.md
This repository includes a Claude skill definition in `SKILL.md`.

## ChatGPT Behavior
When the user types `/experiment` (or asks to create/build/plan an experiment in this repo), follow the workflow and guidance described in `SKILL.md` as the source of truth. `SKILL.md` is the core file; it tells you which files in `references/` to read for each kind of experiment (redirect, iframes, GTM, consent mode, other tracking tools, testing, the static site + GA4 + form recipe).

## Tool Constraints (ChatGPT)
When following `SKILL.md`, limit tool usage to the closest ChatGPT equivalents of the Claude allowed tools:
- Read / view local files
- Grep / search local files
- Glob / list local files
- Bash with `curl` only
- Web fetch
- Web search

If the user request is unrelated to A/B test experiments, proceed normally.
