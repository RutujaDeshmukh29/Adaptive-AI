"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-500">Welcome to your adaptive learning space. Head over to the Assistant or Knowledge Base!</p>
    </div>
  )
}
