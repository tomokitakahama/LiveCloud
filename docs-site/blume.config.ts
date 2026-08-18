import { defineConfig } from "blume";

export default defineConfig({
  title: "LiveCloud 設計書",
  description: "LiveCloud ライブ記録アプリの設計ドキュメント",
  content: {
    root: "../docs",
  },
  theme: {
    accent: "violet",
    mode: "system",
  },
  search: {
    provider: "orama",
  },
  ai: {
    llmsTxt: true,
  },
  deployment: {
    output: "static",
  },
});
