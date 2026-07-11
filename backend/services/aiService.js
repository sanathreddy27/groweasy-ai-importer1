import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const BATCH_SIZE = 25;
const MAX_RETRIES = 3;

const buildPrompt = (records) => `
You are an expert CRM data extraction engine.

Convert the following CSV records into GrowEasy CRM format.
The CSV may use ANY column names, layout, or structure — infer the correct
mapping intelligently based on meaning, not just exact header names.

Return ONLY a valid JSON array. Do NOT wrap it in markdown. Do NOT add commentary.

Each object MUST contain these fields:
created_at
name
email
country_code
mobile_without_country_code
company
city
state
country
lead_owner
crm_status
crm_note
data_source
possession_time
description

Rules:
1. Allowed crm_status values (pick the closest match, or GOOD_LEAD_FOLLOW_UP if unclear):
GOOD_LEAD_FOLLOW_UP
DID_NOT_CONNECT
BAD_LEAD
SALE_DONE

2. Allowed data_source values (leave "" if none match confidently — do not guess):
leads_on_demand
meridian_tower
eden_park
varah_swamy
sarjapur_plots

3. Skip a record entirely if it has NEITHER an email NOR a phone number.

4. If multiple emails exist in a field:
Use the first email as "email".
Append the remaining emails into "crm_note".

5. If multiple phone numbers exist in a field:
Use the first phone number as "mobile_without_country_code".
Append the remaining numbers into "crm_note".

6. "created_at" must be a string parseable by JavaScript's new Date(). If no date
is present, use an empty string "".

7. Keep each record as a single flat JSON object. Do not introduce raw newlines
inside string values — escape them as \\n if needed.

8. If a field has no reasonable value, use an empty string "" (not null, not missing).

CSV Records:
${JSON.stringify(records)}
`;

const safeParseJSON = (text) => {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("No JSON array found in AI response.");
  }

  cleaned = cleaned.substring(start, end + 1);
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a JSON array.");
  }

  return parsed;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractBatch = async (model, batch, attempt = 1) => {
  try {
    const result = await model.generateContent(buildPrompt(batch));
    const response = await result.response;
    const text = response.text();
    return safeParseJSON(text);
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(
        `Batch extraction failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}. Retrying...`
      );
      await sleep(500 * attempt);
      return extractBatch(model, batch, attempt + 1);
    }

    console.error(
      `Batch permanently failed after ${MAX_RETRIES} attempts: ${err.message}`
    );
    // Don't let one bad batch kill the entire import — return empty for this batch
    return [];
  }
};

export const extractCRMData = async (records) => {
  if (!records || records.length === 0) return [];

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const batches = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }

  const results = [];
  for (const batch of batches) {
    const extracted = await extractBatch(model, batch);
    results.push(...extracted);
  }

  return results;
};
