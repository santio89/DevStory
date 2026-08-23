export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

const en = {
  common: {
    signIn: "Sign in with GitHub",
    signOut: "Sign out",
    toggleTheme: "Toggle theme",
    toggleLocale: "Switch language",
    shareTagline: "a story from the invisible hours",
  },
  hero: {
    badge: "Git, narrated.",
    titleFirst: "Any Code.",
    titleSecond: "Any Story.",
    subtitle:
      "Type a public GitHub username. We turn their commit history into a narrative timeline.",
    lookupPlaceholder: "github-username",
    lookupButton: "Look up",
    lookupLoading: "Looking up…",
    invalidUsername: "Enter a valid GitHub username.",
    scrollDown: "Scroll to the next section",
  },
  features: {
    title: "How it works",
    one: {
      t: "Every commit is a chapter",
      d: "We read public repository history, from the first hello world to the latest refactor, and find the moments that mattered.",
    },
    two: {
      t: "AI-written narrative",
      d: "A language model trained as a biographer turns raw git data into eras: The Hello World Era, The Framework Awakening.",
    },
    three: {
      t: "A timeline that moves you",
      d: "Scroll through a beautifully animated vertical timeline that builds the story in front of your eyes.",
    },
  },
  marquee: [
    "commits are letters",
    "repos are chapters",
    "every build is a heartbeat",
    "the invisible hours are the whole story",
  ],
  footer: {
    tagline: "commits are letters, repos are chapters",
  },
  preview: {
    phase: "phase 02 · the brain",
    titleFor: (username: string) => `GitHub data for @${username}`,
    refresh: "Re-fetch",
    digging: "Digging…",
    harvestingFor: (username: string) => `harvesting @${username}'s commit history…`,
    repos: "repos",
    stars: "stars",
    commitsAnalyzed: "commits analyzed",
    firstRepo: "first repo",
    languagesTitle: "Languages over time",
    noLanguageData: "no language data yet",
    earliestCommits: "Earliest commits",
    latestCommits: "Latest commits",
    noCommits: "no commits found in their oldest repos",
    noLatestCommits: "no recent commits found in their newest repos",
    fetchError: (status: number) => `GitHub data fetch failed (${status}).`,
    genericError: "Something went wrong.",
  },
  generator: {
    phase: "phase 03 · the biographer",
    titleFor: (username: string) => `Dev Story · @${username}`,
    writing: "Writing…",
    rewrite: "Rewrite story",
    generate: "Generate story",
    readingFor: (username: string) =>
      `the biographer is reading @${username}'s commits…`,
    failed: "Story generation failed. Try again.",
    emptyTitle: "Ready for the biographer",
    emptyBody: (username: string) =>
      `GitHub data for @${username} is in. Generate the narrative timeline when you're ready.`,
    emptyCta: "Generate story",
    waitingTitle: "Waiting on the brain",
    waitingBody: (username: string) =>
      `Still harvesting @${username}'s GitHub history before the biographer can begin.`,
    translationFailed: "Translation unavailable. Showing the original.",
  },
  share: {
    title: "Share this story",
    subjectFor: (name: string) => `${name}'s Dev Story`,
    blurbFor: (username: string) => `The journey of @${username}`,
    erasLabel: (n: number) => `${n} eras`,
    noLanguages: "no languages",
    copyText: "Copy as text",
    copied: "Copied!",
    downloadJson: "Download JSON",
    copyLink: "Copy link",
    linkCopied: "Link copied!",
    emailTitle: "Email this story",
    emailSuccess: "Check your inbox. The story is on its way.",
    emailPlaceholder: "you@example.com",
    send: "Send it",
    sending: "Sending…",
    emailFailed: "Couldn't send the email.",
    emailAriaLabel: "Email address",
    sendAnother: "Send to another",
    shareBtn: "Share",
    shareMenuTitle: "Share this story",
    socialTitle: "Share on",
    x: "Post on X",
    facebook: "Share on Facebook",
    linkedin: "Share on LinkedIn",
    whatsapp: "Send on WhatsApp",
    telegram: "Send on Telegram",
    embed: "Copy embed code",
    embedCopied: "Embed code copied!",
  },
  play: {
    title: "Re-tell this story",
    subtitle: "Pick a literary style to rewrite the text. Then hear it read aloud.",
    narrator: "Narrated by the biographer",
    remixFailed: "The remix failed. Try again.",
    noAI: "The AI isn't configured yet.",
    listen: "Hear it again",
    hearStory: "Hear story",
    stop: "Stop",
    generating: "preparing audio…",
    audioFailed: "Couldn't generate audio. Try again.",
    remixedAs: (voice: string) => `retold as ${voice}`,
    restore: "restore original",
    voice: {
      cyberpunk: "Cyberpunk legend",
      noir: "Hard-boiled noir",
      letter: "Letter to a younger self",
      fantasy: "Epic fantasy",
      western: "Spaghetti western",
      space: "Space mission log",
      fairy: "Fairy tale",
      documentary: "Nature documentary",
      arcade: "8-bit arcade quest",
      sportscast: "Sports underdog",
      myth: "Greek myth",
      changelog: "Ironic changelog",
    },
    deepDive: "Read the full chapter",
    collapseDeepDive: "Hide chapter",
    deepDiveLoading: "the biographer is digging into this era…",
    deepDiveFailed: "The deep dive failed. Try again.",
    deepDiveHighlights: "quotes worth keeping",
  },
  moment: {
    title: "Summon a memory",
    subtitle: "A scene from this timeline, recalled in voice-over.",
    summon: "Summon a memory",
    summonAnother: "Summon another memory",
    loading: "summoning a memory…",
    translating: "translating…",
    failed: "Couldn't summon a memory. Try again.",
    noAI: "The AI isn't configured yet.",
    of: (date: string) => `from ${date}`,
  },
  chat: {
    open: "Ask the biographer",
    title: "The biographer",
    subtitle: "I've read this journey. Ask what you will.",
    placeholder: "Ask the biographer",
    send: "Send",
    you: "you",
    narrator: "biographer",
    failed: "The biographer went quiet. Try again.",
    noAI: "The biographer isn't awake yet. AI isn't configured.",
    greeting:
      "I've sat with this story long enough to know its quiet corners. Ask about the early years, the loud ones, a repo nearly lost to time. I'll tell you what the ledger remembers.",
    close: "Close chat",
    offTopic:
      "Mm. That's another picture entirely. I'm only here for this developer's journey — the eras, the repos, the commits that shaped them. Ask me about those.",
    suggestionPool: {
      earliestYears: (username: string) =>
        `What defined @${username}'s earliest years?`,
      storyRepo: (username: string) =>
        `Which repo carries @${username}'s story best?`,
      eraChapter: (username: string, eraName: string) =>
        `What happened during @${username}'s "${eraName}" chapter?`,
      archetypeMeaning: (username: string, archetype: string) =>
        `Why does @${username} fit the archetype "${archetype}"?`,
      commitScene: (username: string, commitMsg: string) =>
        `Tell me about @${username}'s commit: "${commitMsg}"`,
      languageTurn: (username: string, from: string, to: string) =>
        `How did @${username} move from ${from} toward ${to}?`,
      quietStretch: (username: string) =>
        `Were there quiet years in @${username}'s ledger?`,
      latestChapter: (username: string, eraName: string) =>
        `What does "${eraName}" reveal about where @${username} is headed?`,
      standoutRepo: (username: string, repo: string) =>
        `What makes the repo "${repo}" matter for @${username}?`,
      invisibleHours: (username: string) =>
        `What do @${username}'s invisible hours look like?`,
      firstLight: (username: string, year: string) =>
        `How did @${username}'s story begin around ${year}?`,
      journeyAhead: (username: string) =>
        `Where does @${username}'s journey seem to be heading?`,
    },
    thinking: "Let me turn the pages…",
  },
  story: {
    crafted: "crafted by the biographer",
    previewSample: "preview sample · add an AI key for the real story",
    era: (n: number) => `era ${String(n).padStart(2, "0")}`,
    translating: "Translating…",
    closingLabel: "the journey continues",
    archetype: "archetype",
    portraitSince: (year: string) => `Est. ${year}`,
  },
  sharePage: {
    of: (name: string) => `${name}'s Dev Story`,
    savedStory: "A saved Dev Story",
    writeYours: "Look up another developer.",
    ctaDesc:
      "Every commit is a chapter. Type any public GitHub username and let Dev Story turn their invisible hours into a narrative timeline.",
    tellYours: "Look someone up",
  },
};

export type Messages = typeof en;

const es: Messages = {
  common: {
    signIn: "Iniciar sesión con GitHub",
    signOut: "Cerrar sesión",
    toggleTheme: "Cambiar tema",
    toggleLocale: "Cambiar idioma",
    shareTagline: "una historia de las horas invisibles",
  },
  hero: {
    badge: "Git, narrado.",
    titleFirst: "Cualquier Código.",
    titleSecond: "Cualquier Historia.",
    subtitle:
      "Escribe un usuario público de GitHub. Convertimos su historial de commits en una línea de tiempo narrativa.",
    lookupPlaceholder: "usuario-github",
    lookupButton: "Buscar",
    lookupLoading: "Buscando…",
    invalidUsername: "Introduce un usuario de GitHub válido.",
    scrollDown: "Desplázate a la siguiente sección",
  },
  features: {
    title: "Cómo funciona",
    one: {
      t: "Cada commit es un capítulo",
      d: "Leemos el historial público de repositorios, desde el primer hola mundo hasta el último refactor, y encontramos los momentos que importaron.",
    },
    two: {
      t: "Narrativa escrita por IA",
      d: "Un modelo de lenguaje entrenado como biógrafo convierte los datos crudos de git en épocas: La Era del Hola Mundo, El Despertar de los Frameworks.",
    },
    three: {
      t: "Una línea de tiempo que te emociona",
      d: "Desplázate por una línea de tiempo vertical bellamente animada que construye la historia frente a tus ojos.",
    },
  },
  marquee: [
    "los commits son letras",
    "los repos son capítulos",
    "cada build es un latido",
    "las horas invisibles son toda la historia",
  ],
  footer: {
    tagline: "los commits son letras, los repos son capítulos",
  },
  preview: {
    phase: "fase 02 · el cerebro",
    titleFor: (username: string) => `Datos de GitHub · @${username}`,
    refresh: "Recargar",
    digging: "Rastreando…",
    harvestingFor: (username: string) =>
      `recolectando el historial de @${username}…`,
    repos: "repos",
    stars: "estrellas",
    commitsAnalyzed: "commits analizados",
    firstRepo: "primer repo",
    languagesTitle: "Lenguajes a lo largo del tiempo",
    noLanguageData: "aún no hay datos de lenguajes",
    earliestCommits: "Primeros commits",
    latestCommits: "Últimos commits",
    noCommits: "no hay commits en sus repos más antiguos",
    noLatestCommits: "no hay commits recientes en sus repos más nuevos",
    fetchError: (status: number) =>
      `Error al obtener los datos de GitHub (${status}).`,
    genericError: "Algo salió mal.",
  },
  generator: {
    phase: "fase 03 · el biógrafo",
    titleFor: (username: string) => `Dev Story · @${username}`,
    writing: "Escribiendo…",
    rewrite: "Reescribir historia",
    generate: "Generar historia",
    readingFor: (username: string) =>
      `el biógrafo está leyendo los commits de @${username}…`,
    failed: "No se pudo generar la historia. Inténtalo de nuevo.",
    emptyTitle: "Listo para el biógrafo",
    emptyBody: (username: string) =>
      `Los datos de GitHub de @${username} están aquí. Genera la línea de tiempo narrativa cuando quieras.`,
    emptyCta: "Generar historia",
    waitingTitle: "Esperando al cerebro",
    waitingBody: (username: string) =>
      `Todavía estamos recopilando el historial de GitHub de @${username} antes de que el biógrafo pueda empezar.`,
    translationFailed: "Traducción no disponible. Mostrando el original.",
  },
  share: {
    title: "Comparte esta historia",
    subjectFor: (name: string) => `Dev Story de ${name}`,
    blurbFor: (username: string) => `El viaje de @${username}`,
    erasLabel: (n: number) => `${n} épocas`,
    noLanguages: "sin lenguajes",
    copyText: "Copiar como texto",
    copied: "¡Copiado!",
    downloadJson: "Descargar JSON",
    copyLink: "Copiar enlace",
    linkCopied: "¡Enlace copiado!",
    emailTitle: "Enviar esta historia por email",
    emailSuccess: "Revisa tu bandeja de entrada. La historia va en camino.",
    emailPlaceholder: "tu@ejemplo.com",
    send: "Enviar",
    sending: "Enviando…",
    emailFailed: "No se pudo enviar el email.",
    emailAriaLabel: "Correo electrónico",
    sendAnother: "Enviar a otro",
    shareBtn: "Compartir",
    shareMenuTitle: "Compartir esta historia",
    socialTitle: "Compartir en",
    x: "Publicar en X",
    facebook: "Compartir en Facebook",
    linkedin: "Compartir en LinkedIn",
    whatsapp: "Enviar por WhatsApp",
    telegram: "Enviar por Telegram",
    embed: "Copiar código de inserción",
    embedCopied: "¡Código de inserción copiado!",
  },
  play: {
    title: "Re-cuenta esta historia",
    subtitle:
      "Elige un estilo literario para reescribir el texto. Luego escúchalo en voz alta.",
    narrator: "Narrado por el biógrafo",
    remixFailed: "Falló el remix. Inténtalo de nuevo.",
    noAI: "La IA aún no está configurada.",
    listen: "Escúchalo otra vez",
    hearStory: "Escucha la historia",
    stop: "Detener",
    generating: "preparando audio…",
    audioFailed: "No pude generar el audio. Inténtalo de nuevo.",
    remixedAs: (voice: string) => `recontada como ${voice}`,
    restore: "restaurar original",
    voice: {
      cyberpunk: "Leyenda cyberpunk",
      noir: "Noir de novela negra",
      letter: "Carta a un yo del pasado",
      fantasy: "Fantasía épica",
      western: "Western crepuscular",
      space: "Bitácora de misión espacial",
      fairy: "Cuento de hadas",
      documentary: "Documental de naturaleza",
      arcade: "Aventura arcade 8-bit",
      sportscast: "Cuento deportivo del underdog",
      myth: "Mito griego",
      changelog: "Changelog irónico",
    },
    deepDive: "Leer el capítulo completo",
    collapseDeepDive: "Ocultar capítulo",
    deepDiveLoading: "el biógrafo está excavando en esta época…",
    deepDiveFailed: "Falló la inmersión. Inténtalo de nuevo.",
    deepDiveHighlights: "frases que vale la pena guardar",
  },
  moment: {
    title: "Evocar un recuerdo",
    subtitle: "Una escena de esta línea de tiempo, recordada en voz en off.",
    summon: "Evocar un recuerdo",
    summonAnother: "Evocar otro recuerdo",
    loading: "evocando un recuerdo…",
    translating: "traduciendo…",
    failed: "No pude evocar un recuerdo. Inténtalo de nuevo.",
    noAI: "La IA aún no está configurada.",
    of: (date: string) => `del ${date}`,
  },
  chat: {
    open: "Pregúntale al biógrafo",
    title: "El biógrafo",
    subtitle: "He leído este recorrido. Pregunta lo que quieras.",
    placeholder: "Pregúntale al biógrafo",
    send: "Enviar",
    you: "tú",
    narrator: "biógrafo",
    failed: "El biógrafo se quedó en silencio. Inténtalo de nuevo.",
    noAI: "El biógrafo aún no despierta. La IA no está configurada.",
    greeting:
      "Llevo bastante tiempo con esta historia para conocer sus rincones callados. Pregunta por los primeros años, los ruidosos, un repo casi olvidado. Te diré lo que guarda el legado.",
    close: "Cerrar chat",
    offTopic:
      "Mm. Esa es otra película. Solo estoy aquí por el viaje de este desarrollador: las épocas, los repos, los commits que lo forjaron. Pregúntame por eso.",
    suggestionPool: {
      earliestYears: (username: string) =>
        `¿Qué definió los primeros años de @${username}?`,
      storyRepo: (username: string) =>
        `¿Qué repo cuenta mejor la historia de @${username}?`,
      eraChapter: (username: string, eraName: string) =>
        `¿Qué pasó en el capítulo "${eraName}" de @${username}?`,
      archetypeMeaning: (username: string, archetype: string) =>
        `¿Por qué encaja @${username} con el arquetipo "${archetype}"?`,
      commitScene: (username: string, commitMsg: string) =>
        `Cuéntame el commit de @${username}: "${commitMsg}"`,
      languageTurn: (username: string, from: string, to: string) =>
        `¿Cómo pasó @${username} de ${from} hacia ${to}?`,
      quietStretch: (username: string) =>
        `¿Hubo años callados en el legado de @${username}?`,
      latestChapter: (username: string, eraName: string) =>
        `¿Qué revela "${eraName}" sobre hacia dónde va @${username}?`,
      standoutRepo: (username: string, repo: string) =>
        `¿Por qué importa el repo "${repo}" para @${username}?`,
      invisibleHours: (username: string) =>
        `¿Cómo se ven las horas invisibles de @${username}?`,
      firstLight: (username: string, year: string) =>
        `¿Cómo empezó la historia de @${username} hacia ${year}?`,
      journeyAhead: (username: string) =>
        `¿Hacia dónde parece dirigirse el viaje de @${username}?`,
    },
    thinking: "Déjame pasar las páginas…",
  },
  story: {
    crafted: "creada por el biógrafo",
    previewSample:
      "muestra de vista previa · añade una clave de IA para la historia real",
    era: (n: number) => `época ${String(n).padStart(2, "0")}`,
    translating: "Traduciendo…",
    closingLabel: "el viaje continúa",
    archetype: "arquetipo",
    portraitSince: (year: string) => `Desde ${year}`,
  },
  sharePage: {
    of: (name: string) => `Dev Story de ${name}`,
    savedStory: "Una Dev Story guardada",
    writeYours: "Busca a otro desarrollador.",
    ctaDesc:
      "Cada commit es un capítulo. Escribe cualquier usuario público de GitHub y deja que Dev Story convierta sus horas invisibles en una línea de tiempo narrativa.",
    tellYours: "Buscar a alguien",
  },
};

export const dictionary: Record<Locale, Messages> = { en, es };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "es";
}
