import { isDataKey, type DataKey } from "@/lib/constants/dataKeys";
import { isDataStatus, type DataStatus } from "@/lib/constants/dataStatus";

export const MAX_VALUE_TEXT_LENGTH = 20_000;
export const MAX_VALUE_JSON_INPUT_LENGTH = 20_000;

export type ProjectDataValidationResult =
  | { ok: true; key: DataKey; status: DataStatus; valueText: string | null; valueJson: unknown }
  | { ok: false; message: string };

export function validateProjectDataInput(formData: FormData): ProjectDataValidationResult {
  const keyRaw = String(formData.get("key") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "missing").trim();
  const valueTextRaw = String(formData.get("value_text") ?? "");
  const valueJsonRaw = String(formData.get("value_json") ?? "");

  if (!isDataKey(keyRaw)) {
    return { ok: false, message: "Некорректный ключ блока данных." };
  }

  if (!isDataStatus(statusRaw)) {
    return { ok: false, message: "Некорректный статус блока данных." };
  }

  if (valueTextRaw.length > MAX_VALUE_TEXT_LENGTH) {
    return { ok: false, message: `Текст слишком длинный (максимум ${MAX_VALUE_TEXT_LENGTH} символов).` };
  }

  if (valueJsonRaw.length > MAX_VALUE_JSON_INPUT_LENGTH) {
    return { ok: false, message: `JSON слишком длинный (максимум ${MAX_VALUE_JSON_INPUT_LENGTH} символов).` };
  }

  let valueJson: unknown = null;
  if (valueJsonRaw.trim()) {
    try {
      valueJson = JSON.parse(valueJsonRaw);
    } catch {
      return { ok: false, message: "Поле JSON заполнено неверно. Исправьте формат JSON." };
    }
  }

  return {
    ok: true,
    key: keyRaw,
    status: statusRaw,
    valueText: valueTextRaw.trim() ? valueTextRaw : null,
    valueJson,
  };
}
