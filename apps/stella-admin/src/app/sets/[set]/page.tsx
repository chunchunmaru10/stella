import { getSetFull } from "@/lib/server/utils";
import { notFound } from "next/navigation";
import React from "react";
import SetForm from "../set-form";
import { api } from "@/trpc/server";

export default async function EditSetPage({
  params,
}: {
  params: { set: string };
}) {
  const setName = decodeURI(params.set);
  const set = await getSetFull(setName);
  const allTypes = await api.type.getAllTypes.query();

  if (!set) notFound();

  return <SetForm allTypes={allTypes} existingSet={set} />;
}
