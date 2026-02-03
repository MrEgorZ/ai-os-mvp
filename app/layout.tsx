import React from "react";

export const metadata = {
  title: "AI OS",
  description: "Личная AI OS: проекты, сценарии, автопромпты.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>{children}</body>
    </html>
  );
}
