"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function ProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AppProgressBar height="1px" color="white" />
    </>
  );
}
