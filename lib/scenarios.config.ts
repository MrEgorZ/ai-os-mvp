import type { ScenarioType } from "@/types";

export type ScenarioLaunch = {
  type: ScenarioType;
  titleRu: string;
  subtitleRu: string;
  modes: { mode: "A" | "B"; titleRu: string; descriptionRu: string }[];
};

export const SCENARIO_LAUNCHERS: ScenarioLaunch[] = [
  { type: "site", titleRu: "Создать сайт", subtitleRu: "Лендинг/сайт: от идеи до передачи или до деплоя + домен.",
    modes: [
      { mode: "A", titleRu: "Передача исполнителю", descriptionRu: "Пакет: структура, тексты, ТЗ, чеклисты." },
      { mode: "B", titleRu: "Готовый сайт", descriptionRu: "Сборка, деплой, домен/SSL, форма, минимум аналитики." }
    ]
  },
  { type: "bot", titleRu: "Создать бота", subtitleRu: "Telegram-бот: логика → код → продакшн.",
    modes: [
      { mode: "A", titleRu: "Передача исполнителю", descriptionRu: "ТЗ, state machine, тест-кейсы." },
      { mode: "B", titleRu: "Бот в продакшне", descriptionRu: "Деплой + токен + логи + запись лидов." }
    ]
  },
  { type: "ads", titleRu: "Создать рекламу", subtitleRu: "Матрица тестов, тексты, промпты визуалов, структура кампаний.",
    modes: [
      { mode: "A", titleRu: "Пакет запуска", descriptionRu: "Матрица + тексты + структура кампаний." },
      { mode: "B", titleRu: "Запуск в кабинете", descriptionRu: "UTM/события + правила stop/go." }
    ]
  },
  { type: "strategy", titleRu: "Создать стратегию", subtitleRu: "Документ стратегии + план внедрения.",
    modes: [
      { mode: "A", titleRu: "Документ", descriptionRu: "Executive summary + план инициатив." },
      { mode: "B", titleRu: "Внедрение 4–8 недель", descriptionRu: "План задач по неделям + метрики." }
    ]
  },
  { type: "market", titleRu: "Анализ рынка", subtitleRu: "Спрос, конкуренты, цены, каналы, решение входить/не входить.",
    modes: [
      { mode: "A", titleRu: "Отчёт", descriptionRu: "Сводка фактов + выводы." },
      { mode: "B", titleRu: "Решение + план 30 дней", descriptionRu: "Decision memo + план действий." }
    ]
  },
  { type: "product", titleRu: "Упаковка продукта", subtitleRu: "Позиционирование, оффер, пакеты, материалы продаж.",
    modes: [
      { mode: "A", titleRu: "Упаковка", descriptionRu: "Позиционирование + оффер + пакеты." },
      { mode: "B", titleRu: "Готов к продаже", descriptionRu: "One-pager + FAQ + скрипты." }
    ]
  },
  { type: "software", titleRu: "Создать софт (MVP)", subtitleRu: "MVP: user stories → архитектура → каркас → деплой.",
    modes: [
      { mode: "A", titleRu: "Архитектура+ТЗ", descriptionRu: "Спека + модель данных + API." },
      { mode: "B", titleRu: "MVP по URL", descriptionRu: "Деплой + базовый функционал." }
    ]
  },
];
