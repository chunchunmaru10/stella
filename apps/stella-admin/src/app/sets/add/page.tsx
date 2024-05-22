import React from "react";
import SetForm from "../set-form";
import { api } from "@/trpc/server";

export default async function AddSetPage() {
  const allTypes = await api.type.getAllTypes.query();

  return (
    <>
      <SetForm allTypes={allTypes} />
    </>
  );
}
