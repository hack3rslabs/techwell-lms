"use client";

import dynamic from "next/dynamic";

// 🔥 IMPORTANT: disable SSR to avoid "self is not defined"
const ResumeBuilder = dynamic(
  () => import("../../components/resume/ResumeBuilder"),
  {
    ssr: false,
  }
);

export default function ResumeBuilderPage() {
  return <ResumeBuilder />;
}