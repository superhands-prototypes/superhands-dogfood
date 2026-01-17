// Mock deployment data for the design playground
export interface MockDeployment {
  id: string;
  branchId: string;
  branch: string;
  name: string;
  previewUrl: string | null;
  status: "pending" | "building" | "deployed" | "failed";
  repoFullName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  createdById: string;
}

// Generate mock deployment data
export const mockDeployments: MockDeployment[] = [
  {
    id: "deploy-1",
    branchId: "branch-1",
    branch: "main",
    name: "Homepage Redesign",
    previewUrl: "https://example.com",
    status: "deployed",
    repoFullName: "superhands/web-dashboard",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    createdBy: null,
    createdById: "designer-1",
  },
  {
    id: "deploy-2",
    branchId: "branch-2",
    branch: "feature/new-nav",
    name: "New Navigation Flow",
    previewUrl: "https://example.com",
    status: "deployed",
    repoFullName: "superhands/web-dashboard",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    createdBy: null,
    createdById: "user-2",
  },
  {
    id: "deploy-3",
    branchId: "branch-3",
    branch: "feature/dark-mode",
    name: "Dark Mode Improvements",
    previewUrl: "https://example.com",
    status: "deployed",
    repoFullName: "superhands/web-dashboard",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdBy: null,
    createdById: "user-3",
  },
  {
    id: "deploy-4",
    branchId: "branch-4",
    branch: "feature/buttons",
    name: "Button Variants Update",
    previewUrl: null,
    status: "building",
    repoFullName: "superhands/web-dashboard",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    createdBy: null,
    createdById: "designer-1",
  },
];

// Convert mock deployments to the format expected by components
export function getAvailableDeployments() {
  return mockDeployments.map((d) => ({
    id: d.id,
    branchId: d.branchId,
    branch: d.branch,
    preview_url: d.previewUrl,
    status: d.status,
    name: d.name,
    repoFullName: d.repoFullName,
    created_by_user: d.createdBy,
    created_by_id: d.createdById,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  }));
}

// Convert mock deployments to branch data format
export function getMockBranches() {
  return mockDeployments.map((d) => ({
    id: d.branchId,
    name: d.name,
    branchName: d.branch,
    isDefault: d.branch === "main",
    parentBranchId: null,
    lastPushAt: d.updatedAt,
    createdAt: d.createdAt,
    repo: {
      id: "repo-1",
      name: "web-dashboard",
      fullName: d.repoFullName,
      defaultBranch: "main",
      installation: {
        id: 123,
        accountLogin: "superhands",
        accountType: "organization",
      },
    },
    deployment: {
      id: d.id,
      status: d.status,
      previewUrl: d.previewUrl,
      screenshotUrl: null,
      deployedCommitSha: null,
      errorMessage: null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      createdBy: d.createdBy,
      createdById: d.createdById,
    },
  }));
}
