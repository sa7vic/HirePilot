const SKILL_GRAPH = {
  react: ["typescript", "next.js", "redux", "testing", "tailwind"],
  "node.js": ["express", "postgresql", "docker", "aws", "graphql"],
  typescript: ["react", "node.js", "testing", "graphql"],
  python: ["fastapi", "django", "pandas", "docker", "aws"],
  devops: ["docker", "kubernetes", "terraform", "aws", "ci/cd"],
  "machine learning": ["pytorch", "tensorflow", "vector databases", "rag", "mlops"],
  "data engineering": ["spark", "airflow", "dbt", "kafka", "snowflake"],
  aws: ["terraform", "lambda", "ecs", "cloudwatch"],
  "product management": ["analytics", "experimentation", "roadmapping", "user research"],
};

const normalize = (value) => String(value || "").toLowerCase().trim();

export function getAdjacentSkills(skills = []) {
  const results = new Set();
  skills.forEach((skill) => {
    const key = normalize(skill);
    const neighbors = SKILL_GRAPH[key] || [];
    neighbors.forEach((neighbor) => results.add(neighbor));
  });
  skills.forEach((skill) => results.delete(normalize(skill)));
  return Array.from(results);
}
