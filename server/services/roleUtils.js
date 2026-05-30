export function deriveTagFromRole(targetRole = "") {
  const role = targetRole.toLowerCase();
  if (role.includes("frontend") || role.includes("front-end")) {
    return "react";
  }
  if (role.includes("backend")) {
    return "node";
  }
  if (role.includes("full stack") || role.includes("full-stack")) {
    return "full stack";
  }
  if (role.includes("devops") || role.includes("sre")) {
    return "devops";
  }
  if (role.includes("data") || role.includes("analytics")) {
    return "data";
  }
  if (role.includes("ai") || role.includes("machine learning")) {
    return "machine learning";
  }
  if (role.includes("product")) {
    return "product";
  }
  if (role.includes("design")) {
    return "design";
  }
  if (role.includes("security")) {
    return "security";
  }
  if (role.includes("marketing")) {
    return "marketing";
  }
  if (role.includes("support") || role.includes("customer")) {
    return "support";
  }
  return "";
}

export function deriveCategoryFromRole(targetRole = "") {
  const role = targetRole.toLowerCase();
  if (role.includes("design")) return "design";
  if (role.includes("product")) return "product";
  if (role.includes("support") || role.includes("customer")) {
    return "customer-support";
  }
  if (role.includes("devops") || role.includes("sre")) {
    return "devops-sysadmin";
  }
  if (role.includes("sales") || role.includes("marketing")) {
    return "sales-marketing";
  }
  if (role.includes("finance") || role.includes("business")) {
    return "business-management-finance";
  }
  if (role.includes("copy")) return "copywriting";
  return "programming";
}
