import { api } from "@/trpc/server";
import React from "react";
import SetList from "./set-list";

export default async function Sets() {
  const allSets = await api.set.getAllSets.query();

  return (
    <div className="h-full">
      <div>
        <div>
          <h1 className="text-2xl font-bold">Sets</h1>
        </div>
        <SetList allSets={allSets} />
      </div>
    </div>
  );
}
