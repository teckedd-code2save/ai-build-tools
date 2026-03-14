export const VERSION = "1.0.1";

export const SKILLS_DIR_NAME = "skills";
export const RULES_DIR_NAME = "rules";

export const ORCHESTRATOR_SKILL = "business-to-data-platform";

export const ALL_SKILLS = [
  "business-to-data-platform",
  "cloud-solution-architect",
  "api-test-generator",
  "frontend-data-consumer",
  "frontend-design-review",
  "infrastructure-as-code-architect",
  "context7-mcp",
] as const;

export type SkillName = (typeof ALL_SKILLS)[number];

export const SKILL_DESCRIPTIONS: Record<SkillName, string> = {
  "business-to-data-platform":
    "Orchestrator — converts any business spec into a production-grade data platform",
  "cloud-solution-architect":
    "Designs Docker/K8s + GitHub Actions cloud architectures",
  "api-test-generator":
    "Generates comprehensive integration tests for scaffolded backends",
  "frontend-data-consumer":
    "Scaffolds Vite/Next.js components with Tailwind CSS and Shadcn/UI",
  "frontend-design-review":
    "Reviews and creates distinctive, production-grade frontend interfaces",
  "infrastructure-as-code-architect":
    "Generates Dockerfiles, K8s manifests, and GitHub Actions workflows",
  "context7-mcp":
    "Fetches up-to-date docs and patterns for any library or framework",
};

export const RULE_FILENAME = "b2dp.md";
