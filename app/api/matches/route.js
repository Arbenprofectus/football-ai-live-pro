import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const demoMatches = [
  { id: 101, league: "Premier League", minute: 67, status: "LIVE", home: "Arsenal", away: "Liverpool", homeGoals: 2, awayGoals: 1, homeForm: 82, awayForm: 76, momentum: 64 },
  { id: 102, league: "La Liga", minute: 34, status: "LIVE", home: "Barcelona", away: "Sevilla", homeGoals: 1, awayGoals: 0, homeForm: 86, awayForm: 61, momentum: 71 },
  { id: 103, league: "Serie A", minute: 0, status: "NS", home: "Inter", away: "Roma", homeGoals: 0, awayGoals: 0, homeForm: 79, awayForm: 68, momentum: 50 },
  { id: 104, league: "Bundesliga", minute: 81, status: "LIVE", home: "Bayern", away: "Leverkusen", homeGoals: 2, awayGoals: 2, homeForm: 84, awayForm: 81, momentum: 54 }
];

function predict(match) {
  const goalEdge = (match.homeGoals - match.awayGoals) * (match.status === "LIVE" ? 18 : 8);
  const timeWeight = match.status === "LIVE" ? match.minute / 90 : 0;
  const strengthEdge = (match.homeForm - match.awayForm) * (1 - timeWeight * 0.55);
  const momentumEdge = (match.momentum - 50) * 0.35;
  const values = [Math.max(5, 43 + goalEdge + strengthEdge * 0.55 + momentumEdge), Math.max(5, 26 - Math.abs(goalEdge) * 0.35 + (match.homeGoals === match.awayGoals ? 8 * timeWeight : 0)), Math.max(5, 31 - goalEdge - strengthEdge * 0.4 - momentumEdge)];
  const total = values.reduce((sum, value) => sum + value, 0);
  const percentages = values.map((value) => Math.round(value / total * 100));
  percentages[0] += 100 - percentages.reduce((sum, value) => sum + value, 0);
  return { home: percentages[0], draw: percentages[1], away: percentages[2], confidence: Math.min(94, Math.round(55 + Math.max(...percentages) * 0.35)) };
}

function fromApi(item) {
  const minute = item.fixture.status.elapsed || 0, homeGoals = item.goals.home || 0, awayGoals = item.goals.away || 0;
  return { id: item.fixture.id, league: item.league.name, minute, status: item.fixture.status.short, home: item.teams.home.name, away: item.teams.away.name, homeLogo: item.teams.home.logo, awayLogo: item.teams.away.logo, homeGoals, awayGoals, homeForm: 70, awayForm: 70, momentum: homeGoals === awayGoals ? 50 : homeGoals > awayGoals ? 65 : 35 };
}

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ source: "demo", updatedAt: new Date().toISOString(), matches: demoMatches.map((m) => ({ ...m, prediction: predict(m) })) });
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", { headers: { "x-apisports-key": key }, next: { revalidate: 30 } });
    if (!response.ok) throw new Error(`API Football: ${response.status}`);
    const data = await response.json();
    const matches = data.response.slice(0, 20).map(fromApi);
    return NextResponse.json({ source: "live", updatedAt: new Date().toISOString(), matches: matches.map((m) => ({ ...m, prediction: predict(m) })) });
  } catch {
    return NextResponse.json({ source: "demo", warning: "Live feed unavailable", updatedAt: new Date().toISOString(), matches: demoMatches.map((m) => ({ ...m, prediction: predict(m) })) });
  }
}
