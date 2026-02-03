"use client";
import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14, background: "white" }}>{children}</div>;
}
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, margin: "18px 0 10px" }}>{children}</h2>;
}
