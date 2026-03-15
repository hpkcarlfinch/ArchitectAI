import { defineSecret, defineString } from "firebase-functions/params";

export const openAIApiKey = defineSecret("OPENAI_API_KEY");
export const openAIModel = defineString("OPENAI_MODEL", {
  default: "gpt-5-mini",
});
