/**
 * GitHub API client for reading/writing the remote config JSON file.
 *
 * Uses the GitHub Contents API to:
 * - GET the current config.json (with SHA for updates)
 * - PUT the updated config.json (creates a commit)
 *
 * Requires a GitHub Personal Access Token with `repo` scope.
 */

const GITHUB_API = "https://api.github.com";

export interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

export interface GitHubCommitInfo {
  sha: string;
  message: string;
  date: string;
  author: string;
}

/**
 * Fetch the current config.json from the GitHub repo.
 */
export async function fetchConfig(
  owner: string,
  repo: string,
  path: string,
  token: string,
): Promise<{ config: Record<string, unknown>; sha: string }> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${error}`);
  }

  const data: GitHubFileResponse = await res.json();
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  const config = JSON.parse(decoded);

  return { config, sha: data.sha };
}

/**
 * Write the updated config.json to the GitHub repo (creates a commit).
 */
export async function saveConfig(
  owner: string,
  repo: string,
  path: string,
  token: string,
  config: Record<string, unknown>,
  sha: string,
  message: string = "Update config via dashboard",
): Promise<string> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const content = Buffer.from(
    JSON.stringify(config, null, 2) + "\n",
    "utf-8",
  ).toString("base64");

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content,
      sha,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${error}`);
  }

  const result = await res.json();
  return result.content.sha;
}

/**
 * Fetch recent commits for the config file (version history).
 */
export async function fetchCommitHistory(
  owner: string,
  repo: string,
  path: string,
  token: string,
  limit: number = 20,
): Promise<GitHubCommitInfo[]> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=${limit}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const commits = await res.json();
  return commits.map((c: any) => ({
    sha: c.sha?.slice(0, 7) ?? "",
    message: c.commit?.message ?? "",
    date: c.commit?.author?.date ?? "",
    author: c.commit?.author?.name ?? "",
  }));
}
