import { NextRequest, NextResponse } from "next/server";
import { fetchConfig, saveConfig, fetchCommitHistory } from "@/lib/github";

const OWNER = process.env.GITHUB_OWNER ?? "mohandodla";
const REPO = process.env.GITHUB_REPO ?? "Ultimatetoolbox-config";
const PATH = process.env.GITHUB_CONFIG_PATH ?? "config.json";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

export async function GET() {
  try {
    if (!TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
    }

    const [{ config, sha }, history] = await Promise.all([
      fetchConfig(OWNER, REPO, PATH, TOKEN),
      fetchCommitHistory(OWNER, REPO, PATH, TOKEN),
    ]);

    return NextResponse.json({ config, sha, history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { config, sha, message } = body;

    if (!config || !sha) {
      return NextResponse.json({ error: "config and sha are required" }, { status: 400 });
    }

    const newSha = await saveConfig(
      OWNER, REPO, PATH, TOKEN, config, sha,
      message || `Dashboard update: ${new Date().toISOString()}`,
    );

    return NextResponse.json({ success: true, sha: newSha });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
