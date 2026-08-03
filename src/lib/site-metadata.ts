import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

type AppLocale = (typeof routing.locales)[number];
type StaticPageKey =
  | "welcome"
  | "cover"
  | "menu"
  | "search"
  | "statistics"
  | "definition"
  | "books"
  | "persons"
  | "organizations"
  | "relatedBooks";
type BookPageKey =
  | "bookRecord"
  | "tableOfContents"
  | "backCover"
  | "pressCritiques"
  | "availability"
  | "publishing";

export const SITE_NAME = "Israeli Literature";
export const SITE_URL = "https://israeli-literature.com";
const SITE_KEYWORDS = [
  "Israeli literature",
  "Israeli books",
  "Israeli authors",
  "Hebrew literature",
  "Israeli book database",
  "Israeli translations",
  "bibliography",
  "biography",
];

type LocaleMetadataDictionary = {
  siteDescription: string;
  staticPages: Record<StaticPageKey, { title: string; description: string }>;
  dynamic: {
    bookPages: Record<BookPageKey, string>;
    personRecord: string;
    organizationRecord: string;
  };
  descriptions: {
    bookRecord: (title?: string) => string;
    tableOfContents: (title?: string) => string;
    backCover: (title?: string) => string;
    pressCritiques: (title?: string) => string;
    availability: (title?: string) => string;
    publishing: (title?: string) => string;
    relatedBooks: (value?: string) => string;
    personRecord: (name?: string) => string;
    organizationRecord: (name?: string) => string;
  };
};

const localeMetadata: Record<AppLocale, LocaleMetadataDictionary> = {
  en: {
    siteDescription:
      "Multilingual bibliographic and biographical database dedicated to Israeli books, authors, translations and literary organizations.",
    staticPages: {
      welcome: {
        title: "Welcome",
        description:
          "Entry page for Israeli Literature, a multilingual database dedicated to Israeli books, authors, translations and literary organizations.",
      },
      cover: {
        title: "Welcome",
        description:
          "Presentation page of Israeli Literature and its bibliographic and biographical database dedicated to Israeli literary creation.",
      },
      menu: {
        title: "Menu",
        description:
          "Browse the main sections of Israeli Literature and access books, persons, organizations and research tools.",
      },
      search: {
        title: "Search",
        description:
          "Search the Israeli Literature database by title, person, organization, theme, publication language or year.",
      },
      statistics: {
        title: "Statistics",
        description:
          "Access statistical graphs and comparison options for titles, translations, languages, countries and publication periods.",
      },
      definition: {
        title: "Definition",
        description:
          "Explore thematic definitions and connected titles inside the Israeli Literature database.",
      },
      books: {
        title: "Books",
        description:
          "Browse book records, original titles, translations, publishers and publication data in Israeli Literature.",
      },
      persons: {
        title: "Persons",
        description:
          "Browse authors, translators, illustrators and other literary contributors in Israeli Literature.",
      },
      organizations: {
        title: "Organizations",
        description:
          "Browse publishers, libraries, websites and literary organizations referenced in Israeli Literature.",
      },
      relatedBooks: {
        title: "Related Books",
        description:
          "Discover books connected by author, language, publisher, theme and other literary facets in Israeli Literature.",
      },
    },
    dynamic: {
      bookPages: {
        bookRecord: "Book Record",
        tableOfContents: "Table of Contents",
        backCover: "Back Cover",
        pressCritiques: "Press Critiques",
        availability: "Availability",
        publishing: "Publishing",
      },
      personRecord: "Person Record",
      organizationRecord: "Organization Record",
    },
    descriptions: {
      bookRecord: (title) =>
        title
          ? `Detailed bibliographic record for ${title}, including authors, publishers, availability and publication data in Israeli Literature.`
          : "Detailed bibliographic record including authors, publishers, availability and publication data in Israeli Literature.",
      tableOfContents: (title) =>
        title
          ? `Table of contents and collective-work details for ${title} in Israeli Literature.`
          : "Table of contents and collective-work details in Israeli Literature.",
      backCover: (title) =>
        title
          ? `Back cover text, summary context and linked information for ${title} in Israeli Literature.`
          : "Back cover text, summary context and linked information in Israeli Literature.",
      pressCritiques: (title) =>
        title
          ? `Press reviews and critical excerpts for ${title} in Israeli Literature.`
          : "Press reviews and critical excerpts in Israeli Literature.",
      availability: (title) =>
        title
          ? `Library, website and organization availability for ${title} in Israeli Literature.`
          : "Library, website and organization availability in Israeli Literature.",
      publishing: (title) =>
        title
          ? `Publication languages, editions and publishing history for ${title} in Israeli Literature.`
          : "Publication languages, editions and publishing history in Israeli Literature.",
      relatedBooks: (value) =>
        value
          ? `Browse books related to ${value} in the Israeli Literature database.`
          : "Browse books connected by shared literary facets in the Israeli Literature database.",
      personRecord: (name) =>
        name
          ? `Biographical record, bibliography and literary activity for ${name} in Israeli Literature.`
          : "Biographical record, bibliography and literary activity in Israeli Literature.",
      organizationRecord: (name) =>
        name
          ? `Organization record for ${name}, including publishing activity and literary references in Israeli Literature.`
          : "Organization record including publishing activity and literary references in Israeli Literature.",
    },
  },
  fr: {
    siteDescription:
      "Base bibliographique et biographique multilingue consacrée aux livres israéliens, aux auteurs, aux traductions et aux organismes littéraires.",
    staticPages: {
      welcome: {
        title: "Bienvenue",
        description:
          "Page d'entrée d'Israeli Literature, une base multilingue consacrée aux livres israéliens, aux auteurs, aux traductions et aux organismes littéraires.",
      },
      cover: {
        title: "Bienvenue",
        description:
          "Page de présentation d'Israeli Literature et de sa base bibliographique et biographique dédiée à la création littéraire israélienne.",
      },
      menu: {
        title: "Menu",
        description:
          "Parcourez les sections principales d'Israeli Literature et accédez aux livres, aux personnes, aux organismes et aux outils de recherche.",
      },
      search: {
        title: "Recherche",
        description:
          "Recherchez dans la base Israeli Literature par titre, personne, organisme, thème, langue de publication ou année.",
      },
      statistics: {
        title: "Statistiques",
        description:
          "Accédez aux graphes statistiques et aux options de comparaison par titres, traductions, langues, pays et périodes de parution.",
      },
      definition: {
        title: "Définition",
        description:
          "Explorez les définitions thématiques et les titres associés dans la base Israeli Literature.",
      },
      books: {
        title: "Livres",
        description:
          "Parcourez les fiches livres, les titres originaux, les traductions, les éditeurs et les données de publication d'Israeli Literature.",
      },
      persons: {
        title: "Personnes",
        description:
          "Parcourez les auteurs, traducteurs, illustrateurs et autres contributeurs littéraires dans Israeli Literature.",
      },
      organizations: {
        title: "Organismes",
        description:
          "Parcourez les éditeurs, bibliothèques, sites web et organismes littéraires référencés dans Israeli Literature.",
      },
      relatedBooks: {
        title: "Livres liés",
        description:
          "Découvrez des livres reliés par auteur, langue, éditeur, thème et autres facettes littéraires dans Israeli Literature.",
      },
    },
    dynamic: {
      bookPages: {
        bookRecord: "Fiche livre",
        tableOfContents: "Table des matières",
        backCover: "Quatrième de couverture",
        pressCritiques: "Critiques de presse",
        availability: "Disponibilité",
        publishing: "Parution",
      },
      personRecord: "Fiche personne",
      organizationRecord: "Fiche organisme",
    },
    descriptions: {
      bookRecord: (title) =>
        title
          ? `Notice bibliographique détaillée pour ${title}, avec auteurs, éditeurs, disponibilité et données de publication dans Israeli Literature.`
          : "Notice bibliographique détaillée avec auteurs, éditeurs, disponibilité et données de publication dans Israeli Literature.",
      tableOfContents: (title) =>
        title
          ? `Table des matières et informations d’ouvrage collectif pour ${title} dans Israeli Literature.`
          : "Table des matières et informations d’ouvrage collectif dans Israeli Literature.",
      backCover: (title) =>
        title
          ? `Texte de quatrième de couverture, contexte de résumé et informations liées pour ${title} dans Israeli Literature.`
          : "Texte de quatrième de couverture, contexte de résumé et informations liées dans Israeli Literature.",
      pressCritiques: (title) =>
        title
          ? `Critiques de presse et extraits critiques pour ${title} dans Israeli Literature.`
          : "Critiques de presse et extraits critiques dans Israeli Literature.",
      availability: (title) =>
        title
          ? `Disponibilité en bibliothèques, sites et organismes pour ${title} dans Israeli Literature.`
          : "Disponibilité en bibliothèques, sites et organismes dans Israeli Literature.",
      publishing: (title) =>
        title
          ? `Langues de parution, éditions et historique éditorial de ${title} dans Israeli Literature.`
          : "Langues de parution, éditions et historique éditorial dans Israeli Literature.",
      relatedBooks: (value) =>
        value
          ? `Parcourez les livres liés à ${value} dans la base Israeli Literature.`
          : "Parcourez des livres reliés par des facettes littéraires communes dans la base Israeli Literature.",
      personRecord: (name) =>
        name
          ? `Notice biographique, bibliographie et activité littéraire de ${name} dans Israeli Literature.`
          : "Notice biographique, bibliographie et activité littéraire dans Israeli Literature.",
      organizationRecord: (name) =>
        name
          ? `Fiche organisme pour ${name}, avec activité éditoriale et références littéraires dans Israeli Literature.`
          : "Fiche organisme avec activité éditoriale et références littéraires dans Israeli Literature.",
    },
  },
  es: {
    siteDescription:
      "Base de datos bibliográfica y biográfica multilingüe dedicada a libros israelíes, autores, traducciones y organizaciones literarias.",
    staticPages: {
      welcome: {
        title: "Bienvenida",
        description:
          "Página de entrada de Israeli Literature, una base multilingüe dedicada a libros israelíes, autores, traducciones y organizaciones literarias.",
      },
      cover: {
        title: "Bienvenida",
        description:
          "Página de presentación de Israeli Literature y de su base bibliográfica y biográfica dedicada a la creación literaria israelí.",
      },
      menu: {
        title: "Menú",
        description:
          "Recorra las secciones principales de Israeli Literature y acceda a libros, personas, organizaciones y herramientas de búsqueda.",
      },
      search: {
        title: "Búsqueda",
        description:
          "Busque en la base Israeli Literature por título, persona, organización, tema, idioma de publicación o año.",
      },
      statistics: {
        title: "Estadísticas",
        description:
          "Acceda a gráficos estadísticos y opciones de comparación por títulos, traducciones, idiomas, países y períodos de publicación.",
      },
      definition: {
        title: "Definición",
        description:
          "Explore definiciones temáticas y títulos relacionados dentro de la base Israeli Literature.",
      },
      books: {
        title: "Libros",
        description:
          "Explore fichas de libros, títulos originales, traducciones, editoriales y datos de publicación en Israeli Literature.",
      },
      persons: {
        title: "Personas",
        description:
          "Explore autores, traductores, ilustradores y otros colaboradores literarios en Israeli Literature.",
      },
      organizations: {
        title: "Organizaciones",
        description:
          "Explore editoriales, bibliotecas, sitios web y organizaciones literarias referenciadas en Israeli Literature.",
      },
      relatedBooks: {
        title: "Libros relacionados",
        description:
          "Descubra libros conectados por autor, idioma, editorial, tema y otras facetas literarias en Israeli Literature.",
      },
    },
    dynamic: {
      bookPages: {
        bookRecord: "Ficha del libro",
        tableOfContents: "Índice",
        backCover: "Contracubierta",
        pressCritiques: "Críticas de prensa",
        availability: "Disponibilidad",
        publishing: "Publicación",
      },
      personRecord: "Ficha de persona",
      organizationRecord: "Ficha de organización",
    },
    descriptions: {
      bookRecord: (title) =>
        title
          ? `Ficha bibliográfica detallada de ${title}, con autores, editoriales, disponibilidad y datos de publicación en Israeli Literature.`
          : "Ficha bibliográfica detallada con autores, editoriales, disponibilidad y datos de publicación en Israeli Literature.",
      tableOfContents: (title) =>
        title
          ? `Índice e información de obra colectiva de ${title} en Israeli Literature.`
          : "Índice e información de obras colectivas en Israeli Literature.",
      backCover: (title) =>
        title
          ? `Texto de contracubierta, contexto del resumen e información vinculada de ${title} en Israeli Literature.`
          : "Texto de contracubierta, contexto del resumen e información vinculada en Israeli Literature.",
      pressCritiques: (title) =>
        title
          ? `Críticas de prensa y extractos críticos sobre ${title} en Israeli Literature.`
          : "Críticas de prensa y extractos críticos en Israeli Literature.",
      availability: (title) =>
        title
          ? `Disponibilidad en bibliotecas, sitios y organizaciones para ${title} en Israeli Literature.`
          : "Disponibilidad en bibliotecas, sitios y organizaciones en Israeli Literature.",
      publishing: (title) =>
        title
          ? `Idiomas de publicación, ediciones e historial editorial de ${title} en Israeli Literature.`
          : "Idiomas de publicación, ediciones e historial editorial en Israeli Literature.",
      relatedBooks: (value) =>
        value
          ? `Explore libros relacionados con ${value} en la base Israeli Literature.`
          : "Explore libros conectados por facetas literarias compartidas en la base Israeli Literature.",
      personRecord: (name) =>
        name
          ? `Ficha biográfica, bibliografía y actividad literaria de ${name} en Israeli Literature.`
          : "Ficha biográfica, bibliografía y actividad literaria en Israeli Literature.",
      organizationRecord: (name) =>
        name
          ? `Ficha de organización de ${name}, con actividad editorial y referencias literarias en Israeli Literature.`
          : "Ficha de organización con actividad editorial y referencias literarias en Israeli Literature.",
    },
  },
  de: {
    siteDescription:
      "Mehrsprachige bibliografische und biografische Datenbank zu israelischen Büchern, Autorinnen und Autoren, Übersetzungen und literarischen Einrichtungen.",
    staticPages: {
      welcome: {
        title: "Willkommen",
        description:
          "Einstiegsseite von Israeli Literature, einer mehrsprachigen Datenbank zu israelischen Büchern, Autorinnen und Autoren, Übersetzungen und literarischen Einrichtungen.",
      },
      cover: {
        title: "Willkommen",
        description:
          "Präsentationsseite von Israeli Literature und seiner bibliografischen und biografischen Datenbank zur israelischen Literatur.",
      },
      menu: {
        title: "Menü",
        description:
          "Durchsuchen Sie die Hauptbereiche von Israeli Literature und greifen Sie auf Bücher, Personen, Organisationen und Suchwerkzeuge zu.",
      },
      search: {
        title: "Suche",
        description:
          "Durchsuchen Sie die Datenbank Israeli Literature nach Titel, Person, Organisation, Thema, Publikationssprache oder Jahr.",
      },
      statistics: {
        title: "Statistiken",
        description:
          "Greifen Sie auf statistische Grafiken und Vergleichsoptionen nach Titeln, Übersetzungen, Sprachen, Ländern und Publikationszeiträumen zu.",
      },
      definition: {
        title: "Definition",
        description:
          "Erkunden Sie thematische Definitionen und verknüpfte Titel innerhalb der Datenbank Israeli Literature.",
      },
      books: {
        title: "Bücher",
        description:
          "Durchsuchen Sie Buchtitel, Originaltitel, Übersetzungen, Verlage und Publikationsdaten in Israeli Literature.",
      },
      persons: {
        title: "Personen",
        description:
          "Durchsuchen Sie Autorinnen und Autoren, Übersetzerinnen und Übersetzer, Illustratorinnen und Illustratoren sowie weitere literarische Mitwirkende in Israeli Literature.",
      },
      organizations: {
        title: "Organisationen",
        description:
          "Durchsuchen Sie Verlage, Bibliotheken, Websites und literarische Organisationen in Israeli Literature.",
      },
      relatedBooks: {
        title: "Verwandte Bücher",
        description:
          "Entdecken Sie Bücher, die über Autor, Sprache, Verlag, Thema und andere literarische Merkmale in Israeli Literature verbunden sind.",
      },
    },
    dynamic: {
      bookPages: {
        bookRecord: "Buchdatensatz",
        tableOfContents: "Inhaltsverzeichnis",
        backCover: "Rückseite",
        pressCritiques: "Pressestimmen",
        availability: "Verfügbarkeit",
        publishing: "Publikation",
      },
      personRecord: "Personendatensatz",
      organizationRecord: "Organisationsdatensatz",
    },
    descriptions: {
      bookRecord: (title) =>
        title
          ? `Detaillierter bibliografischer Datensatz zu ${title} mit Autorinnen und Autoren, Verlagen, Verfügbarkeit und Publikationsdaten in Israeli Literature.`
          : "Detaillierter bibliografischer Datensatz mit Autorinnen und Autoren, Verlagen, Verfügbarkeit und Publikationsdaten in Israeli Literature.",
      tableOfContents: (title) =>
        title
          ? `Inhaltsverzeichnis und Angaben zum Sammelwerk ${title} in Israeli Literature.`
          : "Inhaltsverzeichnis und Angaben zu Sammelwerken in Israeli Literature.",
      backCover: (title) =>
        title
          ? `Rückseitentext, Zusammenfassungskontext und verknüpfte Informationen zu ${title} in Israeli Literature.`
          : "Rückseitentext, Zusammenfassungskontext und verknüpfte Informationen in Israeli Literature.",
      pressCritiques: (title) =>
        title
          ? `Pressestimmen und kritische Auszüge zu ${title} in Israeli Literature.`
          : "Pressestimmen und kritische Auszüge in Israeli Literature.",
      availability: (title) =>
        title
          ? `Verfügbarkeit von ${title} in Bibliotheken, Websites und Organisationen in Israeli Literature.`
          : "Verfügbarkeit in Bibliotheken, Websites und Organisationen in Israeli Literature.",
      publishing: (title) =>
        title
          ? `Publikationssprachen, Ausgaben und Veröffentlichungsgeschichte von ${title} in Israeli Literature.`
          : "Publikationssprachen, Ausgaben und Veröffentlichungsgeschichte in Israeli Literature.",
      relatedBooks: (value) =>
        value
          ? `Durchsuchen Sie Bücher, die mit ${value} in der Datenbank Israeli Literature verbunden sind.`
          : "Durchsuchen Sie Bücher mit gemeinsamen literarischen Merkmalen in der Datenbank Israeli Literature.",
      personRecord: (name) =>
        name
          ? `Biografischer Datensatz, Bibliografie und literarische Tätigkeit von ${name} in Israeli Literature.`
          : "Biografischer Datensatz, Bibliografie und literarische Tätigkeit in Israeli Literature.",
      organizationRecord: (name) =>
        name
          ? `Organisationsdatensatz zu ${name} mit Verlagstätigkeit und literarischen Verweisen in Israeli Literature.`
          : "Organisationsdatensatz mit Verlagstätigkeit und literarischen Verweisen in Israeli Literature.",
    },
  },
  he: {
    siteDescription:
      "מאגר ביבליוגרפי וביוגרפי רב-לשוני המוקדש לספרים ישראליים, לסופרים, לתרגומים ולגופים ספרותיים.",
    staticPages: {
      welcome: {
        title: "ברוכים הבאים",
        description:
          "עמוד הכניסה של Israeli Literature, מאגר רב-לשוני המוקדש לספרים ישראליים, לסופרים, לתרגומים ולגופים ספרותיים.",
      },
      cover: {
        title: "ברוכים הבאים",
        description:
          "עמוד ההצגה של Israeli Literature ושל המאגר הביבליוגרפי והביוגרפי שלו המוקדש ליצירה הספרותית הישראלית.",
      },
      menu: {
        title: "תפריט",
        description:
          "עברו בין המדורים המרכזיים של Israeli Literature וקבלו גישה לספרים, לאישים, לארגונים ולכלי מחקר.",
      },
      search: {
        title: "חיפוש",
        description:
          "חפשו במאגר Israeli Literature לפי כותר, אדם, ארגון, נושא, שפת פרסום או שנה.",
      },
      statistics: {
        title: "סטטיסטיקה",
        description:
          "גישה לגרפים סטטיסטיים ולאפשרויות השוואה לפי כותרים, תרגומים, שפות, מדינות ותקופות פרסום.",
      },
      definition: {
        title: "הגדרה",
        description:
          "חקרו הגדרות נושאיות וכותרים קשורים בתוך מאגר Israeli Literature.",
      },
      books: {
        title: "ספרים",
        description:
          "עיינו ברשומות ספרים, כותרים מקוריים, תרגומים, מו\"לים ונתוני פרסום ב-Israeli Literature.",
      },
      persons: {
        title: "אישים",
        description:
          "עיינו בסופרים, מתרגמים, מאיירים ובתורמים ספרותיים נוספים ב-Israeli Literature.",
      },
      organizations: {
        title: "ארגונים",
        description:
          "עיינו במו\"לים, ספריות, אתרים וארגונים ספרותיים המופיעים ב-Israeli Literature.",
      },
      relatedBooks: {
        title: "ספרים קשורים",
        description:
          "גלו ספרים המחוברים דרך מחבר, שפה, מו\"ל, נושא ומאפיינים ספרותיים נוספים ב-Israeli Literature.",
      },
    },
    dynamic: {
      bookPages: {
        bookRecord: "רשומת ספר",
        tableOfContents: "תוכן העניינים",
        backCover: "כריכה אחורית",
        pressCritiques: "ביקורות עיתונות",
        availability: "זמינות",
        publishing: "פרסום",
      },
      personRecord: "רשומת איש",
      organizationRecord: "רשומת ארגון",
    },
    descriptions: {
      bookRecord: (title) =>
        title
          ? `רשומה ביבליוגרפית מפורטת עבור ${title}, כולל מחברים, מו"לים, זמינות ונתוני פרסום ב-Israeli Literature.`
          : "רשומה ביבליוגרפית מפורטת הכוללת מחברים, מו\"לים, זמינות ונתוני פרסום ב-Israeli Literature.",
      tableOfContents: (title) =>
        title
          ? `תוכן העניינים ופרטי יצירה קולקטיבית עבור ${title} ב-Israeli Literature.`
          : "תוכן העניינים ופרטי יצירות קולקטיביות ב-Israeli Literature.",
      backCover: (title) =>
        title
          ? `טקסט הכריכה האחורית, הקשר התקציר ומידע מקושר עבור ${title} ב-Israeli Literature.`
          : "טקסט הכריכה האחורית, הקשר התקציר ומידע מקושר ב-Israeli Literature.",
      pressCritiques: (title) =>
        title
          ? `ביקורות עיתונות וקטעים ביקורתיים על ${title} ב-Israeli Literature.`
          : "ביקורות עיתונות וקטעים ביקורתיים ב-Israeli Literature.",
      availability: (title) =>
        title
          ? `זמינות של ${title} בספריות, באתרים ובארגונים ב-Israeli Literature.`
          : "זמינות בספריות, באתרים ובארגונים ב-Israeli Literature.",
      publishing: (title) =>
        title
          ? `שפות פרסום, מהדורות והיסטוריית הוצאה לאור של ${title} ב-Israeli Literature.`
          : "שפות פרסום, מהדורות והיסטוריית הוצאה לאור ב-Israeli Literature.",
      relatedBooks: (value) =>
        value
          ? `עיינו בספרים הקשורים אל ${value} במאגר Israeli Literature.`
          : "עיינו בספרים המחוברים דרך מאפיינים ספרותיים משותפים במאגר Israeli Literature.",
      personRecord: (name) =>
        name
          ? `רשומה ביוגרפית, ביבליוגרפיה ופעילות ספרותית של ${name} ב-Israeli Literature.`
          : "רשומה ביוגרפית, ביבליוגרפיה ופעילות ספרותית ב-Israeli Literature.",
      organizationRecord: (name) =>
        name
          ? `רשומת ארגון עבור ${name}, כולל פעילות הוצאה לאור והפניות ספרותיות ב-Israeli Literature.`
          : "רשומת ארגון הכוללת פעילות הוצאה לאור והפניות ספרותיות ב-Israeli Literature.",
    },
  },
  ar: {
    siteDescription:
      "قاعدة بيانات ببليوغرافية وبيوغرافية متعددة اللغات مخصصة للكتب الإسرائيلية والكتّاب والترجمات والمؤسسات الأدبية.",
    staticPages: {
      welcome: {
        title: "مرحباً",
        description:
          "صفحة الدخول إلى Israeli Literature، وهي قاعدة متعددة اللغات مخصصة للكتب الإسرائيلية والكتّاب والترجمات والمؤسسات الأدبية.",
      },
      cover: {
        title: "أهلا وسهلا",
        description:
          "صفحة تقديم Israeli Literature وقاعدته الببليوغرافية والبيوغرافية المخصصة للإنتاج الأدبي الإسرائيلي.",
      },
      menu: {
        title: "القائمة",
        description:
          "تصفّح الأقسام الرئيسية في Israeli Literature للوصول إلى الكتب والأشخاص والمؤسسات وأدوات البحث.",
      },
      search: {
        title: "البحث",
        description:
          "ابحث في قاعدة Israeli Literature حسب العنوان أو الشخص أو المؤسسة أو الموضوع أو لغة النشر أو السنة.",
      },
      statistics: {
        title: "الإحصاءات",
        description:
          "الوصول إلى الرسوم البيانية الإحصائية وخيارات المقارنة حسب العناوين والترجمات واللغات والبلدان وفترات النشر.",
      },
      definition: {
        title: "التعريف",
        description:
          "استكشف التعريفات الموضوعية والعناوين المرتبطة داخل قاعدة Israeli Literature.",
      },
      books: {
        title: "الكتب",
        description:
          "تصفّح سجلات الكتب والعناوين الأصلية والترجمات والناشرين وبيانات النشر في Israeli Literature.",
      },
      persons: {
        title: "الأشخاص",
        description:
          "تصفّح المؤلفين والمترجمين والرسامين وسائر المساهمين الأدبيين في Israeli Literature.",
      },
      organizations: {
        title: "المؤسسات",
        description:
          "تصفّح دور النشر والمكتبات والمواقع والمؤسسات الأدبية المدرجة في Israeli Literature.",
      },
      relatedBooks: {
        title: "الكتب المرتبطة",
        description:
          "اكتشف الكتب المرتبطة بالمؤلف أو اللغة أو الناشر أو الموضوع وغيرها من السمات الأدبية في Israeli Literature.",
      },
    },
    dynamic: {
      bookPages: {
        bookRecord: "سجل الكتاب",
        tableOfContents: "جدول المحتويات",
        backCover: "الغلاف الخلفي",
        pressCritiques: "مراجعات الصحافة",
        availability: "التوفّر",
        publishing: "النشر",
      },
      personRecord: "سجل الشخص",
      organizationRecord: "سجل المؤسسة",
    },
    descriptions: {
      bookRecord: (title) =>
        title
          ? `سجل ببليوغرافي مفصل لكتاب ${title} يتضمن المؤلفين والناشرين والتوفّر وبيانات النشر في Israeli Literature.`
          : "سجل ببليوغرافي مفصل يتضمن المؤلفين والناشرين والتوفّر وبيانات النشر في Israeli Literature.",
      tableOfContents: (title) =>
        title
          ? `جدول المحتويات ومعلومات العمل الجماعي لكتاب ${title} في Israeli Literature.`
          : "جدول المحتويات ومعلومات الأعمال الجماعية في Israeli Literature.",
      backCover: (title) =>
        title
          ? `نص الغلاف الخلفي وسياق الملخص والمعلومات المرتبطة بكتاب ${title} في Israeli Literature.`
          : "نص الغلاف الخلفي وسياق الملخص والمعلومات المرتبطة في Israeli Literature.",
      pressCritiques: (title) =>
        title
          ? `مراجعات الصحافة والمقتطفات النقدية الخاصة بكتاب ${title} في Israeli Literature.`
          : "مراجعات الصحافة والمقتطفات النقدية في Israeli Literature.",
      availability: (title) =>
        title
          ? `توفّر ${title} في المكتبات والمواقع والمؤسسات ضمن Israeli Literature.`
          : "التوفّر في المكتبات والمواقع والمؤسسات ضمن Israeli Literature.",
      publishing: (title) =>
        title
          ? `لغات النشر والإصدارات وتاريخ النشر لكتاب ${title} في Israeli Literature.`
          : "لغات النشر والإصدارات وتاريخ النشر في Israeli Literature.",
      relatedBooks: (value) =>
        value
          ? `تصفّح الكتب المرتبطة بـ ${value} داخل قاعدة Israeli Literature.`
          : "تصفّح الكتب المرتبطة بسمات أدبية مشتركة داخل قاعدة Israeli Literature.",
      personRecord: (name) =>
        name
          ? `سجل بيوغرافي وببليوغرافيا ونشاط أدبي خاص بـ ${name} في Israeli Literature.`
          : "سجل بيوغرافي وببليوغرافيا ونشاط أدبي في Israeli Literature.",
      organizationRecord: (name) =>
        name
          ? `سجل المؤسسة ${name} متضمناً نشاط النشر والمراجع الأدبية في Israeli Literature.`
          : "سجل مؤسسة يتضمن نشاط النشر والمراجع الأدبية في Israeli Literature.",
    },
  },
};

function normalizeLocale(locale: string): AppLocale {
  if (routing.locales.includes(locale as AppLocale)) {
    return locale as AppLocale;
  }

  return routing.defaultLocale;
}

function buildLocalizedPath(locale: AppLocale, pathname: string): string {
  const normalizedPath = pathname === "/" ? "" : pathname;
  return `/${locale}${normalizedPath}`;
}

function buildLocalizedUrl(locale: AppLocale, pathname: string): string {
  return new URL(buildLocalizedPath(locale, pathname), SITE_URL).toString();
}

function buildLanguageAlternates(pathname: string): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, buildLocalizedUrl(locale, pathname)])),
    "x-default": buildLocalizedUrl(routing.defaultLocale, pathname),
  };
}

function buildMetadata(locale: string, title: string, description: string, pathname: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const url = buildLocalizedUrl(normalizedLocale, pathname);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...SITE_KEYWORDS, title],
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(pathname),
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function buildSiteMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const dictionary = localeMetadata[normalizedLocale];

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: SITE_NAME,
    description: dictionary.siteDescription,
    keywords: SITE_KEYWORDS,
    alternates: {
      canonical: buildLocalizedUrl(normalizedLocale, ""),
      languages: buildLanguageAlternates(""),
    },
    icons: {
      icon: [{ url: "/icons/logo/icon-stavnet.jpg", type: "image/jpeg" }],
      shortcut: ["/icons/logo/icon-stavnet.jpg"],
      apple: [{ url: "/icons/logo/icon-stavnet.jpg", type: "image/jpeg" }],
    },
    openGraph: {
      type: "website",
      url: buildLocalizedUrl(normalizedLocale, ""),
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: dictionary.siteDescription,
    },
    twitter: {
      card: "summary",
      title: SITE_NAME,
      description: dictionary.siteDescription,
    },
  };
}

export function buildStaticPageMetadata(locale: string, key: StaticPageKey, pathname: string): Metadata {
  const dictionary = localeMetadata[normalizeLocale(locale)];
  const page = dictionary.staticPages[key];
  return buildMetadata(locale, page.title, page.description, pathname);
}

export function buildBookPageMetadata(
  locale: string,
  key: BookPageKey,
  pathname: string,
  title?: string,
): Metadata {
  const dictionary = localeMetadata[normalizeLocale(locale)];
  const pageTitle = title
    ? `${title} | ${dictionary.dynamic.bookPages[key]}`
    : dictionary.dynamic.bookPages[key];
  const description = dictionary.descriptions[key](title);

  return buildMetadata(locale, pageTitle, description, pathname);
}

export function buildPersonPageMetadata(locale: string, pathname: string, name?: string): Metadata {
  const dictionary = localeMetadata[normalizeLocale(locale)];
  const pageTitle = name ? `${name} | ${dictionary.dynamic.personRecord}` : dictionary.dynamic.personRecord;
  const description = dictionary.descriptions.personRecord(name);

  return buildMetadata(locale, pageTitle, description, pathname);
}

export function buildOrganizationPageMetadata(locale: string, pathname: string, name?: string): Metadata {
  const dictionary = localeMetadata[normalizeLocale(locale)];
  const pageTitle = name
    ? `${name} | ${dictionary.dynamic.organizationRecord}`
    : dictionary.dynamic.organizationRecord;
  const description = dictionary.descriptions.organizationRecord(name);

  return buildMetadata(locale, pageTitle, description, pathname);
}

export function buildRelatedBooksPageMetadata(locale: string, pathname: string, value?: string): Metadata {
  const dictionary = localeMetadata[normalizeLocale(locale)];
  const pageTitle = value ? `${value} | ${dictionary.staticPages.relatedBooks.title}` : dictionary.staticPages.relatedBooks.title;
  const description = dictionary.descriptions.relatedBooks(value);

  return buildMetadata(locale, pageTitle, description, pathname);
}
