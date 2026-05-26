import { DEFAULT_LOCALE, SUPPORTED_LOCALE_CODES, type LocaleCode } from './locales'

type LabelValueCopy = {
  label: string
  value: string
}

type TextCardCopy = {
  title: string
  text: string
}

type NumberedStepCopy = {
  label: string
  title: string
  text: string
}

type SourceRowCopy = {
  name: string
  mode: string
  status: string
}

export type SiteCopy = {
  metadata: {
    homeTitle: string
    homeDescription: string
    instructionsTitle: string
    instructionsDescription: string
    contactEmail: string
    contactSubject: string
    localizationStatus: 'source' | 'complete' | 'partial'
  }
  language: {
    label: string
    selectLabel: string
    buttonLabel: string
    panelTitle: string
    searchPlaceholder: string
    noResults: string
    currentLabel: string
  }
  header: {
    brandLabel: string
    nav: {
      download: string
      instructions: string
      sources: string
      security: string
    }
    actionLabel: string
  }
  home: {
    hero: {
      eyebrow: string
      title: string
      lede: string
      secondaryAction: string
      factsAriaLabel: string
      facts: readonly LabelValueCopy[]
    }
    download: {
      eyebrow: string
      title: string
      body: string
      panelTitle: string
      panelMeta: string
      items: readonly string[]
      action: string
    }
    how: {
      eyebrow: string
      title: string
      diagramAriaLabel: string
      nodes: readonly TextCardCopy[]
      body: string
      specs: readonly string[]
    }
    sources: {
      eyebrow: string
      title: string
      body: string
      tableAriaLabel: string
      columns: readonly string[]
      rows: readonly SourceRowCopy[]
    }
    use: {
      eyebrow: string
      title: string
      cards: readonly TextCardCopy[]
    }
    trust: {
      eyebrow: string
      title: string
      body: string
      cards: readonly TextCardCopy[]
    }
    pilot: {
      eyebrow: string
      title: string
      steps: readonly NumberedStepCopy[]
    }
    closing: {
      eyebrow: string
      title: string
      primaryAction: string
      secondaryAction: string
    }
    footer: {
      brand: string
      tagline: string
    }
  }
  instructions: {
    hero: {
      eyebrow: string
      title: string
      body: string
      primaryAction: string
      secondaryAction: string
    }
    quickStart: {
      eyebrow: string
      title: string
      steps: readonly NumberedStepCopy[]
    }
    versions: {
      eyebrow: string
      title: string
      items: readonly TextCardCopy[]
    }
    warning: {
      title: string
      body: string
    }
  }
}

type DeepPartial<T> = T extends readonly (infer Item)[]
  ? readonly DeepPartial<Item>[]
  : T extends object
    ? { readonly [Key in keyof T]?: DeepPartial<T[Key]> }
    : T

const englishCopy: SiteCopy = {
  metadata: {
    homeTitle: 'Vedawiki Field Recorder',
    homeDescription:
      'Passive controller-side and log-import telemetry recorder for authorized non-weaponized training, debriefing, QA, and evaluation.',
    instructionsTitle: 'Run Vedawiki from a USB drive',
    instructionsDescription:
      'Quick-start instructions for running Vedawiki Field Recorder as a portable USB app and passive log importer.',
    contactEmail: 'contact@vedawiki.com',
    contactSubject: 'Vedawiki passive recorder evaluation',
    localizationStatus: 'source',
  },
  language: {
    label: 'Language',
    selectLabel: 'Select language',
    buttonLabel: 'Change language',
    panelTitle: 'Language',
    searchPlaceholder: 'Search languages',
    noResults: 'No matching languages',
    currentLabel: 'Current language',
  },
  header: {
    brandLabel: 'Vedawiki home',
    nav: {
      download: 'Download',
      instructions: 'Instructions',
      sources: 'Sources',
      security: 'Security',
    },
    actionLabel: 'Download kit',
  },
  home: {
    hero: {
      eyebrow: 'Controlled evaluation build',
      title: 'Vedawiki Field Recorder',
      lede:
        'Passive controller-side and log-import telemetry recorder for authorized non-weaponized training, debriefing, QA, and evaluation.',
      secondaryAction: 'Request signed build',
      factsAriaLabel: 'Recorder facts',
      facts: [
        { label: 'Recorder', value: 'Native Python process' },
        { label: 'Sources', value: 'USB, SD-card, official exports' },
        { label: 'Boundary', value: 'Read-only and import-only' },
      ],
    },
    download: {
      eyebrow: 'Evaluation download',
      title: 'Start with USB import before hardware integration.',
      body:
        'Vedawiki begins with local capture and official log exports because that is the safest way to collect useful flight data across mixed drone fleets. The public kit explains the controlled build, supported passive paths, and pilot requirements.',
      panelTitle: 'Vedawiki passive recorder kit',
      panelMeta: 'ZIP archive · portable recorder app',
      items: [
        'Portable USB app archive',
        'Windows and macOS start scripts',
        'Native Python controller recorder',
        'Passive log importer for CSV, JSON, JSONL, and GUTMA-style exports',
        'Source catalog for DJI, MAVLink, EdgeTX, Blackbox, Skydio, Autel, and Parrot',
        'Structured JSONL logs and CSV export tooling',
      ],
      action: 'Download recorder ZIP',
    },
    how: {
      eyebrow: 'How it works',
      title: 'A flight recorder at the operator side.',
      diagramAriaLabel: 'Controller-side recording flow',
      nodes: [
        {
          title: 'Controller or log export',
          text: 'Authorized passive source',
        },
        {
          title: 'USB app / importer',
          text: 'Read-only capture and normalization',
        },
        {
          title: 'Review package',
          text: 'Offline files and CSV export',
        },
      ],
      body:
        'The prototype records Xbox-compatible controller input, imports passive telemetry exports, and saves timestamped event logs from a native local process. The public site does not connect to local devices or recorder services.',
      specs: [
        'USB/log-import MVP',
        'Structured session replay data',
        'Read-only physical path for open telemetry',
      ],
    },
    sources: {
      eyebrow: 'Source coverage',
      title: 'Built around passive source families.',
      body:
        'The recorder treats closed ecosystems as official import/API sources and reserves physical recording for documented, open, receive-only telemetry.',
      tableAriaLabel: 'Passive source families',
      columns: ['Ecosystem', 'Safe capture mode', 'Implementation'],
      rows: [
        {
          name: 'DJI',
          mode: 'Official export / SDK / cloud',
          status: 'Import/API only',
        },
        {
          name: 'MAVLink',
          mode: 'CSV, JSON, SD-card, receive-only serial',
          status: 'Physical path supported for open telemetry',
        },
        {
          name: 'EdgeTX / ELRS',
          mode: 'Radio SD-card CSV or approved telemetry export',
          status: 'USB import now',
        },
        {
          name: 'Betaflight / iNav',
          mode: 'Blackbox CSV/JSON export',
          status: 'Binary logs archived for approved decoders',
        },
        {
          name: 'Skydio / Autel / Parrot',
          mode: 'Official API, cloud, SDK, or GUTMA export',
          status: 'Closed-platform import only',
        },
      ],
    },
    use: {
      eyebrow: 'Evaluation uses',
      title: 'Built for repeatable review, not anecdotes.',
      cards: [
        {
          title: 'Training debriefs',
          text:
            'Replay operator inputs with timestamps so instructors can review timing, control discipline, and repeated mistakes.',
        },
        {
          title: 'Fleet evaluation',
          text:
            'Compare authorized non-weaponized flights across teams, controller profiles, manufacturers, and environments.',
        },
        {
          title: 'Manufacturer QA',
          text:
            'Give drone builders a normalized record of operator-side events when investigating failures or performance gaps.',
        },
      ],
    },
    trust: {
      eyebrow: 'Security posture',
      title: 'Authorized data, controlled movement.',
      body:
        'Flight data only matters if users trust the custody path. Vedawiki is designed around explicit authorization, local capture, and structured export controls for review teams.',
      cards: [
        {
          title: 'Authorized collection',
          text:
            'Designed for explicit public-sector, research, or manufacturer evaluation programs. No informal mission scraping.',
        },
        {
          title: 'Local-first capture',
          text:
            'Logs are recorded at the controller side and can remain offline until an approved export or review workflow.',
        },
        {
          title: 'Chain of custody',
          text:
            'Exports are structured for signed sessions, hashes, custody notes, and role-based access in the review process.',
        },
      ],
    },
    pilot: {
      eyebrow: 'Pilot path',
      title: 'From download to field evaluation.',
      steps: [
        {
          label: '01',
          title: 'Download the portable app',
          text: 'Unzip Vedawiki Field Recorder onto a USB drive or local working folder.',
        },
        {
          label: '02',
          title: 'Start the recorder',
          text:
            'Run the Windows or macOS start file, then plug in the Xbox-compatible controller.',
        },
        {
          label: '03',
          title: 'Review sessions',
          text: 'Review JSONL session files and export CSV files for approved debrief or QA workflows.',
        },
      ],
    },
    closing: {
      eyebrow: 'For authorized programs',
      title: 'Evaluate a drone-agnostic flight recorder.',
      primaryAction: 'Download recorder ZIP',
      secondaryAction: 'Contact Vedawiki',
    },
    footer: {
      brand: 'Vedawiki',
      tagline: 'Passive flight recording for authorized non-weaponized evaluation.',
    },
  },
  instructions: {
    hero: {
      eyebrow: 'Start recorder',
      title: 'Run Vedawiki from a USB drive.',
      body:
        "A normal USB flash drive cannot record Xbox controller commands by itself. Vedawiki's downloadable version is a portable app that runs on the laptop or ground station, records local controller input, imports official log exports, and writes sessions back to the USB drive.",
      primaryAction: 'Download recorder ZIP',
      secondaryAction: 'View kit contents',
    },
    quickStart: {
      eyebrow: 'Quick start',
      title: 'Portable USB app workflow.',
      steps: [
        {
          label: '01',
          title: 'Download and unzip',
          text:
            'Download VedawikiFieldRecorder.zip, unzip it, and move the Vedawiki-Recorder folder onto a USB drive or local working folder.',
        },
        {
          label: '02',
          title: 'Start the recorder',
          text:
            'On Windows, double-click start-recorder-windows.bat. On macOS, double-click start-recorder-mac.command. The script creates a local Python environment, installs dependencies, and starts the recorder API.',
        },
        {
          label: '03',
          title: 'Plug in the controller',
          text:
            'Connect an Xbox-compatible controller to the same laptop or ground station. The recorder writes timestamped JSONL files into sessions/.',
        },
        {
          label: '04',
          title: 'Review and export',
          text:
            'Keep the raw JSONL files in sessions/. Use the included export tooling to produce CSV files for approved debrief or QA workflows.',
        },
        {
          label: '05',
          title: 'Import passive logs',
          text:
            'Run python recorder/import_logs.py --list-sources, then import approved CSV, JSON, JSONL, or GUTMA-style exports into the same sessions/ folder.',
        },
      ],
    },
    versions: {
      eyebrow: 'What is possible',
      title: 'Three realistic recorder versions.',
      items: [
        {
          title: '1. Portable USB app',
          text:
            'Possible now. The USB drive contains the app, start scripts, recorder code, sessions folder, source catalog, log importer, and export tooling.',
        },
        {
          title: '2. Portable executable',
          text:
            'Better next step. Package the Python recorder with PyInstaller so users do not install Python before recording sessions.',
        },
        {
          title: '3. Read-only physical recorder',
          text:
            'The hardware product. Use USB-C for power/export and a separate receive-only telemetry input for open systems such as MAVLink. Closed ecosystems stay official import/API only.',
        },
      ],
    },
    warning: {
      title: 'What a flash drive cannot do',
      body:
        'USB is not an audio splitter. A flash drive plugged into a computer cannot listen to another USB port, and an Xbox controller usually cannot host or read a flash drive. Something has to run recorder software, or approved hardware must listen on a documented receive-only telemetry branch.',
    },
  },
}

const ukrainianCopy: DeepPartial<SiteCopy> = {
  metadata: {
    homeTitle: 'Vedawiki Field Recorder',
    homeDescription:
      'Пасивний реєстратор телеметрії на боці оператора та імпорту журналів для дозволеного неозброєного навчання, розбору, QA та оцінювання.',
    instructionsTitle: 'Запуск Vedawiki з USB-накопичувача',
    instructionsDescription:
      'Короткі інструкції для запуску Vedawiki Field Recorder як портативного USB-додатка та пасивного імпортера журналів.',
    contactSubject: 'Оцінювання пасивного реєстратора Vedawiki',
    localizationStatus: 'complete',
  },
  language: {
    label: 'Мова',
    selectLabel: 'Вибрати мову',
    buttonLabel: 'Змінити мову',
    panelTitle: 'Мова',
    searchPlaceholder: 'Пошук мов',
    noResults: 'Немає відповідних мов',
    currentLabel: 'Поточна мова',
  },
  header: {
    brandLabel: 'Головна Vedawiki',
    nav: {
      download: 'Завантаження',
      instructions: 'Інструкції',
      sources: 'Джерела',
      security: 'Безпека',
    },
    actionLabel: 'Завантажити набір',
  },
  home: {
    hero: {
      eyebrow: 'Контрольована оцінювальна збірка',
      lede:
        'Пасивний реєстратор телеметрії на боці оператора та імпорту журналів для дозволеного неозброєного навчання, розбору, QA та оцінювання.',
      secondaryAction: 'Запросити підписану збірку',
      factsAriaLabel: 'Факти про реєстратор',
      facts: [
        { label: 'Реєстратор', value: 'Нативний процес Python' },
        { label: 'Джерела', value: 'USB, SD-карта, офіційні експорти' },
        { label: 'Межа', value: 'Лише читання та імпорт' },
      ],
    },
    download: {
      eyebrow: 'Завантаження для оцінювання',
      title: 'Почніть з імпорту через USB до апаратної інтеграції.',
      body:
        'Vedawiki починає з локального захоплення та офіційних експортів журналів, бо це найбезпечніший спосіб збирати корисні польотні дані для змішаних флотів дронів. Публічний набір пояснює контрольовану збірку, підтримані пасивні шляхи та вимоги до пілота.',
      panelTitle: 'Пасивний реєстратор Vedawiki',
      panelMeta: 'ZIP-архів · портативний додаток реєстратора',
      items: [
        'Архів портативного USB-додатка',
        'Стартові скрипти для Windows і macOS',
        'Нативний реєстратор контролера на Python',
        'Пасивний імпортер журналів для CSV, JSON, JSONL та GUTMA-подібних експортів',
        'Каталог джерел для DJI, MAVLink, EdgeTX, Blackbox, Skydio, Autel і Parrot',
        'Структуровані журнали JSONL та інструменти експорту CSV',
      ],
      action: 'Завантажити ZIP реєстратора',
    },
    how: {
      eyebrow: 'Як це працює',
      title: 'Польотний реєстратор на боці оператора.',
      diagramAriaLabel: 'Потік запису на боці контролера',
      nodes: [
        {
          title: 'Контролер або експорт журналу',
          text: 'Дозволене пасивне джерело',
        },
        {
          title: 'USB-додаток / імпортер',
          text: 'Захоплення лише для читання та нормалізація',
        },
        {
          title: 'Пакет для перевірки',
          text: 'Офлайн-файли та експорт CSV',
        },
      ],
      body:
        'Прототип записує введення з Xbox-сумісного контролера, імпортує пасивні експорти телеметрії та зберігає події з часовими мітками через нативний локальний процес. Публічний сайт не підключається до локальних пристроїв або служб реєстратора.',
      specs: [
        'MVP для USB/імпорту журналів',
        'Структуровані дані відтворення сесій',
        'Фізичний шлях лише для читання для відкритої телеметрії',
      ],
    },
    sources: {
      eyebrow: 'Покриття джерел',
      title: 'Побудовано навколо пасивних сімейств джерел.',
      body:
        'Реєстратор обробляє закриті екосистеми як офіційні джерела імпорту/API та залишає фізичний запис для задокументованої відкритої телеметрії лише на приймання.',
      tableAriaLabel: 'Пасивні сімейства джерел',
      columns: ['Екосистема', 'Безпечний режим захоплення', 'Реалізація'],
      rows: [
        {
          name: 'DJI',
          mode: 'Офіційний експорт / SDK / хмара',
          status: 'Лише імпорт/API',
        },
        {
          name: 'MAVLink',
          mode: 'CSV, JSON, SD-карта, послідовний канал лише на приймання',
          status: 'Фізичний шлях підтримується для відкритої телеметрії',
        },
        {
          name: 'EdgeTX / ELRS',
          mode: 'CSV з SD-карти радіо або затверджений експорт телеметрії',
          status: 'USB-імпорт доступний зараз',
        },
        {
          name: 'Betaflight / iNav',
          mode: 'Експорт Blackbox CSV/JSON',
          status: 'Бінарні журнали архівуються для затверджених декодерів',
        },
        {
          name: 'Skydio / Autel / Parrot',
          mode: 'Офіційний API, хмара, SDK або GUTMA-експорт',
          status: 'Лише імпорт із закритої платформи',
        },
      ],
    },
    use: {
      eyebrow: 'Сценарії оцінювання',
      title: 'Створено для повторюваної перевірки, а не для переказів.',
      cards: [
        {
          title: 'Навчальні розбори',
          text:
            'Відтворюйте дії оператора з часовими мітками, щоб інструктори могли оцінювати таймінг, дисципліну керування та повторювані помилки.',
        },
        {
          title: 'Оцінювання флоту',
          text:
            'Порівнюйте дозволені неозброєні польоти між командами, профілями контролерів, виробниками та середовищами.',
        },
        {
          title: 'QA виробника',
          text:
            'Надавайте виробникам дронів нормалізований запис подій на боці оператора для розслідування збоїв або прогалин продуктивності.',
        },
      ],
    },
    trust: {
      eyebrow: 'Позиція безпеки',
      title: 'Дозволені дані, контрольований рух.',
      body:
        'Польотні дані мають значення лише тоді, коли користувачі довіряють ланцюгу збереження. Vedawiki побудовано навколо явного дозволу, локального захоплення та структурованого експортного контролю для команд перевірки.',
      cards: [
        {
          title: 'Дозволений збір',
          text:
            'Призначено для явних програм оцінювання у публічному секторі, дослідженнях або у виробників. Без неформального збору місій.',
        },
        {
          title: 'Локальне захоплення',
          text:
            'Журнали записуються на боці контролера та можуть залишатися офлайн до затвердженого експорту або перегляду.',
        },
        {
          title: 'Ланцюг збереження',
          text:
            'Експорти структуровано для підписаних сесій, хешів, нотаток збереження та рольового доступу в процесі перегляду.',
        },
      ],
    },
    pilot: {
      eyebrow: 'Шлях пілота',
      title: 'Від завантаження до польового оцінювання.',
      steps: [
        {
          label: '01',
          title: 'Завантажте портативний додаток',
          text: 'Розпакуйте Vedawiki Field Recorder на USB-накопичувач або в локальну робочу теку.',
        },
        {
          label: '02',
          title: 'Запустіть реєстратор',
          text:
            'Запустіть стартовий файл для Windows або macOS, а потім підключіть Xbox-сумісний контролер.',
        },
        {
          label: '03',
          title: 'Перегляньте сесії',
          text: 'Переглядайте файли сесій JSONL та експортуйте CSV для затверджених розборів або QA.',
        },
      ],
    },
    closing: {
      eyebrow: 'Для дозволених програм',
      title: 'Оцініть польотний реєстратор, незалежний від моделі дрона.',
      primaryAction: 'Завантажити ZIP реєстратора',
      secondaryAction: 'Звʼязатися з Vedawiki',
    },
    footer: {
      tagline: 'Пасивний запис польотів для дозволеного неозброєного оцінювання.',
    },
  },
  instructions: {
    hero: {
      eyebrow: 'Запуск реєстратора',
      title: 'Запустіть Vedawiki з USB-накопичувача.',
      body:
        'Звичайний USB-накопичувач не може самостійно записувати команди Xbox-контролера. Завантажувана версія Vedawiki - це портативний додаток, який працює на ноутбуці або наземній станції, записує локальне введення контролера, імпортує офіційні експорти журналів і записує сесії назад на USB-накопичувач.',
      primaryAction: 'Завантажити ZIP реєстратора',
      secondaryAction: 'Переглянути вміст набору',
    },
    quickStart: {
      eyebrow: 'Швидкий старт',
      title: 'Процес портативного USB-додатка.',
      steps: [
        {
          label: '01',
          title: 'Завантажте та розпакуйте',
          text:
            'Завантажте VedawikiFieldRecorder.zip, розпакуйте його та перемістіть теку Vedawiki-Recorder на USB-накопичувач або в локальну робочу теку.',
        },
        {
          label: '02',
          title: 'Запустіть реєстратор',
          text:
            'У Windows двічі клацніть start-recorder-windows.bat. У macOS двічі клацніть start-recorder-mac.command. Скрипт створює локальне середовище Python, встановлює залежності та запускає API реєстратора.',
        },
        {
          label: '03',
          title: 'Підключіть контролер',
          text:
            'Підключіть Xbox-сумісний контролер до того самого ноутбука або наземної станції. Реєстратор записує JSONL-файли з часовими мітками в sessions/.',
        },
        {
          label: '04',
          title: 'Перегляд і експорт',
          text:
            'Зберігайте необроблені JSONL-файли в sessions/. Використовуйте інструменти експорту для створення CSV-файлів для затвердженого розбору або QA.',
        },
        {
          label: '05',
          title: 'Імпортуйте пасивні журнали',
          text:
            'Запустіть python recorder/import_logs.py --list-sources, а потім імпортуйте затверджені CSV, JSON, JSONL або GUTMA-подібні експорти в ту саму теку sessions/.',
        },
      ],
    },
    versions: {
      eyebrow: 'Що можливо',
      title: 'Три реалістичні версії реєстратора.',
      items: [
        {
          title: '1. Портативний USB-додаток',
          text:
            'Можливо зараз. USB-накопичувач містить додаток, стартові скрипти, код реєстратора, теку sessions, каталог джерел, імпортер журналів та інструменти експорту.',
        },
        {
          title: '2. Портативний виконуваний файл',
          text:
            'Кращий наступний крок. Упакуйте Python-реєстратор через PyInstaller, щоб користувачам не потрібно було встановлювати Python перед записом сесій.',
        },
        {
          title: '3. Фізичний реєстратор лише для читання',
          text:
            'Апаратний продукт. Використовуйте USB-C для живлення/експорту та окремий телеметричний вхід лише на приймання для відкритих систем, таких як MAVLink. Закриті екосистеми залишаються лише офіційним імпортом/API.',
        },
      ],
    },
    warning: {
      title: 'Що не може зробити флеш-накопичувач',
      body:
        'USB - це не аудіорозгалужувач. Флеш-накопичувач, підключений до компʼютера, не може слухати інший USB-порт, а Xbox-контролер зазвичай не може бути хостом або читати флеш-накопичувач. Має працювати програмне забезпечення реєстратора, або затверджене обладнання має слухати задокументовану телеметричну гілку лише на приймання.',
    },
  },
}

type CoreLocaleLabels = {
  languageLabel: string
  selectLabel: string
  nav: SiteCopy['header']['nav']
  actionLabel: string
  downloadAction: string
  requestAction: string
  contactAction: string
  kitAction: string
  contactSubject: string
}

type HeroIntroCopy = {
  eyebrow: string
  lede: string
  facts: SiteCopy['home']['hero']['facts']
}

const coreLocaleLabels: Partial<Record<LocaleCode, CoreLocaleLabels>> = {
  bg: coreLabels('Език', 'Изберете език', ['Изтегляне', 'Инструкции', 'Източници', 'Сигурност'], 'Изтегли пакета', 'Изтегли ZIP', 'Заяви подписана версия', 'Свържи се с Vedawiki', 'Преглед на пакета', 'Оценка на пасивния рекордер Vedawiki'),
  hr: coreLabels('Jezik', 'Odaberite jezik', ['Preuzimanje', 'Upute', 'Izvori', 'Sigurnost'], 'Preuzmi paket', 'Preuzmi ZIP', 'Zatraži potpisanu verziju', 'Kontaktiraj Vedawiki', 'Prikaži sadržaj paketa', 'Evaluacija pasivnog snimača Vedawiki'),
  cs: coreLabels('Jazyk', 'Vyberte jazyk', ['Stažení', 'Pokyny', 'Zdroje', 'Zabezpečení'], 'Stáhnout sadu', 'Stáhnout ZIP', 'Vyžádat podepsanou verzi', 'Kontaktovat Vedawiki', 'Zobrazit obsah sady', 'Hodnocení pasivního rekordéru Vedawiki'),
  da: coreLabels('Sprog', 'Vælg sprog', ['Download', 'Vejledning', 'Kilder', 'Sikkerhed'], 'Download pakke', 'Download ZIP', 'Anmod om signeret build', 'Kontakt Vedawiki', 'Se pakkens indhold', 'Evaluering af Vedawiki passiv optager'),
  nl: coreLabels('Taal', 'Selecteer taal', ['Download', 'Instructies', 'Bronnen', 'Beveiliging'], 'Download kit', 'Download ZIP', 'Vraag ondertekende build aan', 'Neem contact op met Vedawiki', 'Bekijk kitinhoud', 'Evaluatie passieve recorder Vedawiki'),
  et: coreLabels('Keel', 'Vali keel', ['Allalaadimine', 'Juhised', 'Allikad', 'Turvalisus'], 'Laadi komplekt alla', 'Laadi ZIP alla', 'Taotle allkirjastatud versiooni', 'Võta Vedawikiga ühendust', 'Vaata komplekti sisu', 'Vedawiki passiivse salvesti hindamine'),
  fi: coreLabels('Kieli', 'Valitse kieli', ['Lataa', 'Ohjeet', 'Lähteet', 'Turvallisuus'], 'Lataa paketti', 'Lataa ZIP', 'Pyydä allekirjoitettu versio', 'Ota yhteyttä Vedawikiin', 'Näytä paketin sisältö', 'Vedawiki-passive tallentimen arviointi'),
  fr: coreLabels('Langue', 'Choisir la langue', ['Télécharger', 'Instructions', 'Sources', 'Sécurité'], 'Télécharger le kit', 'Télécharger le ZIP', 'Demander une version signée', 'Contacter Vedawiki', 'Voir le contenu du kit', 'Évaluation de l’enregistreur passif Vedawiki'),
  de: coreLabels('Sprache', 'Sprache auswählen', ['Download', 'Anleitung', 'Quellen', 'Sicherheit'], 'Kit herunterladen', 'ZIP herunterladen', 'Signierten Build anfordern', 'Vedawiki kontaktieren', 'Kit-Inhalt anzeigen', 'Evaluierung des passiven Vedawiki-Rekorders'),
  el: coreLabels('Γλώσσα', 'Επιλέξτε γλώσσα', ['Λήψη', 'Οδηγίες', 'Πηγές', 'Ασφάλεια'], 'Λήψη πακέτου', 'Λήψη ZIP', 'Αίτημα υπογεγραμμένης έκδοσης', 'Επικοινωνία με Vedawiki', 'Προβολή περιεχομένων πακέτου', 'Αξιολόγηση παθητικού καταγραφέα Vedawiki'),
  hu: coreLabels('Nyelv', 'Nyelv kiválasztása', ['Letöltés', 'Utasítások', 'Források', 'Biztonság'], 'Készlet letöltése', 'ZIP letöltése', 'Aláírt build kérése', 'Kapcsolat a Vedawikivel', 'Készlet tartalmának megtekintése', 'Vedawiki passzív rögzítő értékelése'),
  ga: coreLabels('Teanga', 'Roghnaigh teanga', ['Íoslódáil', 'Treoracha', 'Foinsí', 'Slándáil'], 'Íoslódáil an tacar', 'Íoslódáil ZIP', 'Iarr leagan sínithe', 'Déan teagmháil le Vedawiki', 'Féach ar ábhar an tacair', 'Measúnú taifeadta éighníomhaigh Vedawiki'),
  it: coreLabels('Lingua', 'Seleziona lingua', ['Download', 'Istruzioni', 'Fonti', 'Sicurezza'], 'Scarica kit', 'Scarica ZIP', 'Richiedi build firmata', 'Contatta Vedawiki', 'Vedi contenuto del kit', 'Valutazione del registratore passivo Vedawiki'),
  lv: coreLabels('Valoda', 'Izvēlieties valodu', ['Lejupielāde', 'Instrukcijas', 'Avoti', 'Drošība'], 'Lejupielādēt komplektu', 'Lejupielādēt ZIP', 'Pieprasīt parakstītu būvējumu', 'Sazināties ar Vedawiki', 'Skatīt komplekta saturu', 'Vedawiki pasīvā ierakstītāja novērtēšana'),
  lt: coreLabels('Kalba', 'Pasirinkite kalbą', ['Atsisiųsti', 'Instrukcijos', 'Šaltiniai', 'Saugumas'], 'Atsisiųsti rinkinį', 'Atsisiųsti ZIP', 'Prašyti pasirašytos versijos', 'Susisiekti su Vedawiki', 'Peržiūrėti rinkinio turinį', 'Vedawiki pasyvaus įrašymo vertinimas'),
  mt: coreLabels('Lingwa', 'Agħżel lingwa', ['Niżżel', 'Istruzzjonijiet', 'Sorsi', 'Sigurtà'], 'Niżżel il-kit', 'Niżżel ZIP', 'Itlob build iffirmat', 'Ikkuntattja lil Vedawiki', 'Ara l-kontenut tal-kit', 'Evalwazzjoni tar-reġistratur passiv Vedawiki'),
  pl: coreLabels('Język', 'Wybierz język', ['Pobierz', 'Instrukcje', 'Źródła', 'Bezpieczeństwo'], 'Pobierz zestaw', 'Pobierz ZIP', 'Poproś o podpisaną wersję', 'Skontaktuj się z Vedawiki', 'Zobacz zawartość zestawu', 'Ocena pasywnego rejestratora Vedawiki'),
  pt: coreLabels('Idioma', 'Selecionar idioma', ['Transferir', 'Instruções', 'Fontes', 'Segurança'], 'Transferir kit', 'Transferir ZIP', 'Pedir build assinada', 'Contactar Vedawiki', 'Ver conteúdo do kit', 'Avaliação do gravador passivo Vedawiki'),
  ro: coreLabels('Limbă', 'Selectați limba', ['Descărcare', 'Instrucțiuni', 'Surse', 'Securitate'], 'Descarcă kitul', 'Descarcă ZIP', 'Solicită versiune semnată', 'Contactează Vedawiki', 'Vezi conținutul kitului', 'Evaluarea recorderului pasiv Vedawiki'),
  sk: coreLabels('Jazyk', 'Vyberte jazyk', ['Stiahnuť', 'Pokyny', 'Zdroje', 'Bezpečnosť'], 'Stiahnuť súpravu', 'Stiahnuť ZIP', 'Vyžiadať podpísanú verziu', 'Kontaktovať Vedawiki', 'Zobraziť obsah súpravy', 'Hodnotenie pasívneho rekordéra Vedawiki'),
  sl: coreLabels('Jezik', 'Izberite jezik', ['Prenos', 'Navodila', 'Viri', 'Varnost'], 'Prenesi paket', 'Prenesi ZIP', 'Zahtevaj podpisano različico', 'Stik z Vedawiki', 'Prikaži vsebino paketa', 'Ocenjevanje pasivnega snemalnika Vedawiki'),
  es: coreLabels('Idioma', 'Seleccionar idioma', ['Descargar', 'Instrucciones', 'Fuentes', 'Seguridad'], 'Descargar kit', 'Descargar ZIP', 'Solicitar versión firmada', 'Contactar con Vedawiki', 'Ver contenido del kit', 'Evaluación del registrador pasivo Vedawiki'),
  sv: coreLabels('Språk', 'Välj språk', ['Ladda ned', 'Instruktioner', 'Källor', 'Säkerhet'], 'Ladda ned paket', 'Ladda ned ZIP', 'Begär signerad version', 'Kontakta Vedawiki', 'Visa paketets innehåll', 'Utvärdering av Vedawiki passiv registrering'),
}

const heroIntroByLocale: Partial<Record<LocaleCode, HeroIntroCopy>> = {
  bg: heroIntro(
    'Контролирана оценъчна сборка',
    'Пасивен регистратор на телеметрия от контролера и импорт на логове за разрешено невъоръжено обучение, разбор, QA и оценяване.',
    ['Рекордер', 'Нативен Python процес', 'Източници', 'USB, SD-карта, официални експорти', 'Граница', 'Само четене и импорт'],
  ),
  hr: heroIntro(
    'Kontrolirana evaluacijska verzija',
    'Pasivni snimač telemetrije na strani kontrolera i uvoza zapisnika za odobrenu neoružanu obuku, analizu, QA i evaluaciju.',
    ['Snimač', 'Izvorni Python proces', 'Izvori', 'USB, SD kartica, službeni izvozi', 'Granica', 'Samo čitanje i uvoz'],
  ),
  cs: heroIntro(
    'Kontrolované hodnoticí sestavení',
    'Pasivní záznamník telemetrie na straně ovladače a importu logů pro autorizovaný neozbrojený výcvik, rozbor, QA a hodnocení.',
    ['Záznamník', 'Nativní proces Pythonu', 'Zdroje', 'USB, SD karta, oficiální exporty', 'Hranice', 'Pouze čtení a import'],
  ),
  da: heroIntro(
    'Kontrolleret evalueringsbuild',
    'Passiv telemetrioptager på controllersiden og logimport til autoriseret ubevæbnet træning, debriefing, QA og evaluering.',
    ['Optager', 'Native Python-proces', 'Kilder', 'USB, SD-kort, officielle eksporter', 'Grænse', 'Kun læsning og import'],
  ),
  nl: heroIntro(
    'Gecontroleerde evaluatiebuild',
    'Passieve telemetrierecorder aan controllerzijde en logimport voor geautoriseerde niet-bewapende training, debriefing, QA en evaluatie.',
    ['Recorder', 'Native Python-proces', 'Bronnen', 'USB, SD-kaart, officiële exports', 'Grens', 'Alleen lezen en importeren'],
  ),
  et: heroIntro(
    'Kontrollitud hindamisversioon',
    'Passiivne kontrolleripoolne telemeetria salvesti ja logide import volitatud relvastamata treeningu, järelanalüüsi, QA ja hindamise jaoks.',
    ['Salvesti', 'Natiivne Pythoni protsess', 'Allikad', 'USB, SD-kaart, ametlikud ekspordid', 'Piir', 'Ainult lugemine ja import'],
  ),
  fi: heroIntro(
    'Hallittu arviointiversio',
    'Passiivinen ohjainpuolen telemetriatallennin ja lokien tuonti hyväksyttyyn aseistamattomaan koulutukseen, jälkipuintiin, QA:han ja arviointiin.',
    ['Tallennin', 'Natiivi Python-prosessi', 'Lähteet', 'USB, SD-kortti, viralliset viennit', 'Raja', 'Vain luku ja tuonti'],
  ),
  fr: heroIntro(
    'Version d’évaluation contrôlée',
    'Enregistreur passif de télémétrie côté contrôleur et import de journaux pour la formation non armée autorisée, le débriefing, la QA et l’évaluation.',
    ['Enregistreur', 'Processus Python natif', 'Sources', 'USB, carte SD, exports officiels', 'Limite', 'Lecture seule et import'],
  ),
  de: heroIntro(
    'Kontrollierter Evaluierungsbuild',
    'Passiver Telemetrie-Recorder auf Controller-Seite und Log-Import für autorisiertes unbewaffnetes Training, Debriefing, QA und Bewertung.',
    ['Recorder', 'Nativer Python-Prozess', 'Quellen', 'USB, SD-Karte, offizielle Exporte', 'Grenze', 'Nur Lesen und Import'],
  ),
  el: heroIntro(
    'Ελεγχόμενη έκδοση αξιολόγησης',
    'Παθητικός καταγραφέας τηλεμετρίας από την πλευρά του χειριστηρίου και εισαγωγή αρχείων καταγραφής για εγκεκριμένη άοπλη εκπαίδευση, απολογισμό, QA και αξιολόγηση.',
    ['Καταγραφέας', 'Εγγενής διεργασία Python', 'Πηγές', 'USB, κάρτα SD, επίσημες εξαγωγές', 'Όριο', 'Μόνο ανάγνωση και εισαγωγή'],
  ),
  hu: heroIntro(
    'Ellenőrzött értékelési build',
    'Passzív, vezérlőoldali telemetriarögzítő és naplóimport engedélyezett, fegyvertelen képzéshez, kiértékeléshez, QA-hoz és értékeléshez.',
    ['Rögzítő', 'Natív Python-folyamat', 'Források', 'USB, SD-kártya, hivatalos exportok', 'Határ', 'Csak olvasás és import'],
  ),
  ga: heroIntro(
    'Tógáil mheasúnaithe rialaithe',
    'Taifeadán teiliméadrachta éighníomhach ar thaobh an rialaitheora agus iompórtáil logaí le haghaidh oiliúna neamharmtha údaraithe, díospóireachta, QA agus measúnaithe.',
    ['Taifeadán', 'Próiseas dúchasach Python', 'Foinsí', 'USB, cárta SD, easpórtálacha oifigiúla', 'Teorainn', 'Léamh amháin agus iompórtáil'],
  ),
  it: heroIntro(
    'Build di valutazione controllata',
    'Registratore passivo di telemetria lato controller e importazione dei log per addestramento non armato autorizzato, debriefing, QA e valutazione.',
    ['Registratore', 'Processo Python nativo', 'Fonti', 'USB, scheda SD, esportazioni ufficiali', 'Limite', 'Solo lettura e importazione'],
  ),
  lv: heroIntro(
    'Kontrolēts novērtēšanas būvējums',
    'Pasīvs kontroliera puses telemetrijas ierakstītājs un žurnālu imports atļautai neapbruņotai apmācībai, analīzei, QA un novērtēšanai.',
    ['Ierakstītājs', 'Vietējs Python process', 'Avoti', 'USB, SD karte, oficiālie eksporti', 'Robeža', 'Tikai lasīšana un imports'],
  ),
  lt: heroIntro(
    'Kontroliuojama vertinimo versija',
    'Pasyvus valdiklio pusės telemetrijos įrašymo įrankis ir žurnalų importas autorizuotam neginkluotam mokymui, aptarimui, QA ir vertinimui.',
    ['Įrašymo įrankis', 'Natūralus Python procesas', 'Šaltiniai', 'USB, SD kortelė, oficialūs eksportai', 'Riba', 'Tik skaitymas ir importas'],
  ),
  mt: heroIntro(
    'Build ta’ evalwazzjoni kkontrollata',
    'Reġistratur passiv tat-telemetrija min-naħa tal-kontrollur u importazzjoni ta’ logs għal taħriġ mhux armat awtorizzat, debriefing, QA u evalwazzjoni.',
    ['Reġistratur', 'Proċess Python nattiv', 'Sorsi', 'USB, karta SD, esportazzjonijiet uffiċjali', 'Limitu', 'Qari biss u importazzjoni'],
  ),
  pl: heroIntro(
    'Kontrolowana wersja ewaluacyjna',
    'Pasywny rejestrator telemetrii po stronie kontrolera i import logów do autoryzowanego nieuzbrojonego szkolenia, omówień, QA i oceny.',
    ['Rejestrator', 'Natywny proces Python', 'Źródła', 'USB, karta SD, oficjalne eksporty', 'Granica', 'Tylko odczyt i import'],
  ),
  pt: heroIntro(
    'Build de avaliação controlada',
    'Gravador passivo de telemetria no lado do controlador e importação de logs para treino não armado autorizado, debriefing, QA e avaliação.',
    ['Gravador', 'Processo Python nativo', 'Fontes', 'USB, cartão SD, exportações oficiais', 'Limite', 'Apenas leitura e importação'],
  ),
  ro: heroIntro(
    'Versiune de evaluare controlată',
    'Recorder pasiv de telemetrie pe partea controlerului și import de jurnale pentru instruire neînarmată autorizată, analiză, QA și evaluare.',
    ['Recorder', 'Proces Python nativ', 'Surse', 'USB, card SD, exporturi oficiale', 'Limită', 'Doar citire și import'],
  ),
  sk: heroIntro(
    'Kontrolovaná hodnotiaca zostava',
    'Pasívny záznamník telemetrie na strane ovládača a import logov pre autorizovaný neozbrojený výcvik, rozbor, QA a hodnotenie.',
    ['Záznamník', 'Natívny proces Pythonu', 'Zdroje', 'USB, SD karta, oficiálne exporty', 'Hranica', 'Iba čítanie a import'],
  ),
  sl: heroIntro(
    'Nadzorovana ocenjevalna različica',
    'Pasivni snemalnik telemetrije na strani krmilnika in uvoz dnevnikov za odobreno neoboroženo usposabljanje, analizo, QA in ocenjevanje.',
    ['Snemalnik', 'Izvorni proces Python', 'Viri', 'USB, kartica SD, uradni izvozi', 'Meja', 'Samo branje in uvoz'],
  ),
  es: heroIntro(
    'Build de evaluación controlada',
    'Registrador pasivo de telemetría del lado del controlador e importación de registros para entrenamiento no armado autorizado, debriefing, QA y evaluación.',
    ['Registrador', 'Proceso Python nativo', 'Fuentes', 'USB, tarjeta SD, exportaciones oficiales', 'Límite', 'Solo lectura e importación'],
  ),
  sv: heroIntro(
    'Kontrollerad utvärderingsversion',
    'Passiv telemetriinspelare på kontrollsidan och loggimport för auktoriserad obeväpnad träning, genomgång, QA och utvärdering.',
    ['Inspelare', 'Inbyggd Python-process', 'Källor', 'USB, SD-kort, officiella exporter', 'Gräns', 'Endast läsning och import'],
  ),
}

const localeOverrides: Partial<Record<LocaleCode, DeepPartial<SiteCopy>>> = {
  uk: ukrainianCopy,
  ...Object.fromEntries(
    Object.entries(coreLocaleLabels).map(([locale, labels]) => [
      locale,
      partialLocaleCopy(locale as LocaleCode, labels),
    ]),
  ),
}

export const copyByLocale = SUPPORTED_LOCALE_CODES.reduce(
  (copy, locale) => {
    copy[locale] = mergeCopy(englishCopy, localeOverrides[locale])
    return copy
  },
  {} as Record<LocaleCode, SiteCopy>,
)

export function getSiteCopy(locale: LocaleCode): SiteCopy {
  return copyByLocale[locale] ?? copyByLocale[DEFAULT_LOCALE]
}

function coreLabels(
  languageLabel: string,
  selectLabel: string,
  navItems: [string, string, string, string],
  actionLabel: string,
  downloadAction: string,
  requestAction: string,
  contactAction: string,
  kitAction: string,
  contactSubject: string,
): CoreLocaleLabels {
  return {
    languageLabel,
    selectLabel,
    nav: {
      download: navItems[0],
      instructions: navItems[1],
      sources: navItems[2],
      security: navItems[3],
    },
    actionLabel,
    downloadAction,
    requestAction,
    contactAction,
    kitAction,
    contactSubject,
  }
}

function heroIntro(
  eyebrow: string,
  lede: string,
  [
    recorderLabel,
    recorderValue,
    sourcesLabel,
    sourcesValue,
    boundaryLabel,
    boundaryValue,
  ]: [string, string, string, string, string, string],
): HeroIntroCopy {
  return {
    eyebrow,
    lede,
    facts: [
      { label: recorderLabel, value: recorderValue },
      { label: sourcesLabel, value: sourcesValue },
      { label: boundaryLabel, value: boundaryValue },
    ],
  }
}

function partialLocaleCopy(locale: LocaleCode, labels: CoreLocaleLabels): DeepPartial<SiteCopy> {
  const hero = heroIntroByLocale[locale]

  return {
    metadata: {
      contactSubject: labels.contactSubject,
      localizationStatus: 'partial',
    },
    language: {
      label: labels.languageLabel,
      selectLabel: labels.selectLabel,
    },
    header: {
      nav: labels.nav,
      actionLabel: labels.actionLabel,
    },
    home: {
      hero: {
        ...hero,
        factsAriaLabel: englishCopy.home.hero.factsAriaLabel,
        secondaryAction: labels.requestAction,
      },
      download: {
        action: labels.downloadAction,
      },
      closing: {
        primaryAction: labels.downloadAction,
        secondaryAction: labels.contactAction,
      },
    },
    instructions: {
      hero: {
        primaryAction: labels.downloadAction,
        secondaryAction: labels.kitAction,
      },
    },
  }
}

function mergeCopy<T>(base: T, override?: DeepPartial<T>): T {
  if (override === undefined) return base
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T

  const merged = { ...base } as Record<string, unknown>
  for (const key of Object.keys(override)) {
    const baseValue = (base as Record<string, unknown>)[key]
    const overrideValue = (override as Record<string, unknown>)[key]
    if (overrideValue !== undefined) {
      merged[key] = mergeCopy(baseValue, overrideValue as DeepPartial<typeof baseValue>)
    }
  }
  return merged as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
