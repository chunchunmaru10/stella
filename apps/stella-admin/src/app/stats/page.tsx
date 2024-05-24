import { api } from "@/trpc/server";
import React from "react";
import StatList from "./stat-list";

export default async function StatsPage() {
  const allStats = await api.stat.getAllStats.query();

  return (
    <div className="h-full">
      <div>
        <div>
          <h1 className="text-2xl font-bold">Sets</h1>
        </div>
        <StatList allStats={allStats} />
      </div>
    </div>
  );
}
