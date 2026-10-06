import type { ModelEntry } from "./types";

export const genjutsuMotionTransfer: ModelEntry = {
  id: "genjutsu-motion-transfer",
  surface: "video",
  label: "Genjutsu Motion Transfer",
  roles: { video: 1, reference: 8 },
  settings: {
    resolution: { type: "enum", values: ["480p", "720p", "1080p"], default: "720p" },
  },
};
