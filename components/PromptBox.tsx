'use client';

import CopyButton from '@/components/CopyButton';
import type { DataKey } from '@/lib/constants/dataKeys';

type PromptBoxProps = {
  blockKey: DataKey;
};

const FALLBACK_PROMPT = 'Опиши блок максимально конкретно: цель, контекст, ограничения, метрики успеха, риски и следующую рекомендацию.';

const BLOCK_PROMPTS: Record<DataKey, string> = {
  project_profile: `Ты — бизнес-аналитик. Собери полный профиль проекта в формате JSON + краткое резюме.

Контекст:
- Ниша/продукт: {{если известно}}
- Рынок/гео: {{если известно}}

Верни:
1) 'Краткое резюме' (5-7 предложений)
2) JSON c полями:
{
  "product": "",
  "problem": "",
  "target_result": "",
  "business_model": "",
  "geo": "",
  "constraints": [""],
  "integrations": [""],
  "success_metrics": [""],
  "risks": [""]
}

Если данных не хватает — перечисли уточняющие вопросы в конце.`,
  audience: `Ты — senior-маркетолог. Помоги описать целевую аудиторию так, чтобы потом писать сильные офферы и тексты.

Верни:
1) Сегменты ЦА (B2B/B2C, роль ЛПР, отрасль, размер компании/доход)
2) Боли/триггеры/барьеры по каждому сегменту
3) Возражения и как их снимать
4) JTBD (Jobs To Be Done)
5) JSON:
{
  "segments": [{"name":"","description":""}],
  "pains": [{"segment":"","items":[""]}],
  "triggers": [{"segment":"","items":[""]}],
  "objections": [{"segment":"","items":[""]}],
  "jtbd": [{"segment":"","job":""}]
}

Пиши по-русски, кратко и практично.`,
  offer: `Ты — эксперт по упаковке продукта. Сформируй оффер, который можно сразу тестировать в рекламе/лендинге.

Дай 3 варианта оффера. Для каждого:
- Основное обещание результата
- Для кого
- За какой срок/при каких условиях
- Доказательства (кейс, цифры, гарантия, соц.доказательство)
- CTA
- Ограничение/дедлайн

Потом выбери лучший вариант и верни JSON:
{
  "best_offer": {
    "headline": "",
    "subheadline": "",
    "proof": [""],
    "cta": "",
    "risk_reversal": "",
    "urgency": ""
  }
}`,
  competitors: `Ты — исследователь рынка. Сделай структурированный анализ конкурентов.

Нужно:
1) Найти 5-10 релевантных конкурентов
2) Для каждого: продукт, цена, позиционирование, канал привлечения, сильные/слабые стороны
3) Выделить незакрытые потребности (gaps)
4) Предложить стратегию отстройки

Формат ответа:
- Таблица (можно markdown)
- Затем JSON:
{
  "competitors": [{"name":"","offer":"","price":"","channels":[""],"strengths":[""],"weaknesses":[""]}],
  "market_gaps": [""],
  "differentiation_strategy": [""]
}`,
  references: `Ты — арт-директор + UX-редактор. Помоги собрать качественные референсы для сайта/продукта.

Верни:
1) 10-15 референсов (URL + короткий комментарий, что именно взять)
2) Что НЕЛЬЗЯ повторять (антипаттерны)
3) Рекомендации по стилю: визуал, типографика, тон оф войс
4) JSON:
{
  "references": [{"url":"","what_to_use":""}],
  "anti_patterns": [""],
  "style_guidelines": {
    "visual": [""],
    "typography": [""],
    "tone_of_voice": [""]
  }
}`,
  tracking: `Ты — performance-маркетолог + аналитик. Составь базовый план аналитики для запуска.

Нужно:
1) UTM-стандарт (source/medium/campaign/content/term)
2) События воронки (view/click/submit/purchase и т.д.)
3) Что должно быть в dashboard
4) Правила stop/go для рекламных связок

Верни:
- Чеклист внедрения
- JSON:
{
  "utm_template": "",
  "events": [{"name":"","params":[""]}],
  "dashboard_metrics": [""],
  "stop_go_rules": [""]
}`,
};

export default function PromptBox({ blockKey }: PromptBoxProps) {
  const prompt = BLOCK_PROMPTS[blockKey] ?? FALLBACK_PROMPT;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <textarea
        readOnly
        value={prompt}
        style={{ width: '100%', minHeight: 220, padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 12, color: '#666' }}>Скопируй и отправь в ИИ-сервис, затем вернись с результатом.</div>
        <CopyButton text={prompt} />
      </div>
    </div>
  );
}
