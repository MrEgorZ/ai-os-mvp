import { isStepStatus, type StepStatus } from "@/lib/constants/stepStatus";

export const MAX_RESULT_TEXT_LENGTH = 100_000;
export const MAX_PROMPT_TEXT_LENGTH = 100_000;

export type StepValidationResult =
  | { ok: true; status: StepStatus; resultText: string; promptLastGenerated: string }
  | { ok: false; message: string };

export function validateStepUpdateInput(formData: FormData): StepValidationResult {
  const statusRaw = String(formData.get("status") ?? "todo").trim();
  const resultText = String(formData.get("result_text") ?? "");
  const promptLastGenerated = String(formData.get("prompt_last_generated") ?? "");

  if (!isStepStatus(statusRaw)) {
    return { ok: false, message: "Некорректный статус шага." };
  }

  if (resultText.length > MAX_RESULT_TEXT_LENGTH) {
    return { ok: false, message: `Результат слишком длинный (максимум ${MAX_RESULT_TEXT_LENGTH} символов).` };
  }

  if (promptLastGenerated.length > MAX_PROMPT_TEXT_LENGTH) {
    return { ok: false, message: `Промпт слишком длинный (максимум ${MAX_PROMPT_TEXT_LENGTH} символов).` };
  }

  return {
    ok: true,
    status: statusRaw,
    resultText,
    promptLastGenerated,
  };
}
