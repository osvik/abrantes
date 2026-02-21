# Abrantes - AI Context

Abrantes is a lightweight JavaScript A/B testing library. When working with this project, be aware of the following:

## AI Experiment Builder Skill

There is a comprehensive AI experiment builder reference at `SKILL.md` in the repository root. It contains the full API reference, all experiment patterns, tracking recommendations, and step-by-step instructions for building experiments. A Claude Code skill at `.claude/skills/experiment/` wraps this file — use `/experiment` to invoke it.

## Key Resources

- **Documentation site**: https://osvik.github.io/abrantes/
- **AI-readable documentation**: https://osvik.github.io/abrantes/llms.txt
- **Examples**: See the `examples/` folder for all experiment patterns
- **A/B Test Planner**: https://osvik.github.io/abrantes-test-calculator/planner.html
- **A/B Test Significance Calculator**: https://osvik.github.io/abrantes-test-calculator/

## Project Structure

- `Abrantes.js` — Core library (no plugins)
- `AbrantesPlus.js` — Core + bundled plugins (classic script)
- `AbrantesPlusMod.js` — Core + plugins as ES6 module
- `plugins/` — Individual plugin files
- `examples/` — Usage examples for all patterns
- `docs/` — Documentation website (GitHub Pages)
- `gulpfile.js` — Build configuration for custom builds
