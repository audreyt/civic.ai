import { readFileSync } from "node:fs";

export const kamiPrompt = {
    en: readFileSync("_data/kami-prompt-v1.en.md", "utf8"),
    tw: readFileSync("_data/kami-prompt-v1.tw.md", "utf8"),
};

export const kamiPromptUrl = {
    en: "/kami/prompt-v1.md",
    tw: "/tw/kami/prompt-v1.md",
};
