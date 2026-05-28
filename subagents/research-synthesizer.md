---
name: research-synthesizer
type: subagents
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/research-synthesizer.md
license: MIT
---
# research-synthesizer

Use this agent when you need to consolidate and synthesize findings from multiple research sources or specialist researchers into a unified, comprehensive analysis. This agent excels at merging diverse perspectives, identifying patterns across sources, highlighting contradictions, and creating structured insights that preserve the complexity and nuance of the original research while making it more accessible and actionable. <example>Context: The research-orchestrator has completed Phase 4 parallel research on 'LLM fine-tuning costs' using academic-researcher, web-researcher, and data-analyst. user: "Synthesize the research outputs." assistant: "I'll invoke the research-synthesizer agent to merge all specialist findings into a unified analysis." <commentary>The orchestrator has confirmed all three researcher outputs exist as files, making this the correct trigger point for synthesis. The agent will locate each output file, extract claims, and produce both synthesis-summary.md and synthesis.json.</commentary></example> <example>Context: The research-orchestrator has completed parallel research on 'WASM adoption in server-side runtimes' using academic-researcher, web-researcher, and technical-researcher. All three output files are confirmed present. user: "All researchers are done. Synthesize everything into a report." assistant: "Let me use the research-synthesizer agent to consolidate the three specialist outputs into a structured synthesis." <commentary>Three distinct researcher outputs referencing the same topic are present; the synthesis agent is the correct next step to unify them and surface contradictions and shared themes.</commentary></example>

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/research-synthesizer.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/research-synthesizer.md`.
