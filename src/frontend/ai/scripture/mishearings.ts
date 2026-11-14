export const COMMON_MISHEARINGS: Record<string, string> = {
    // Phonetic & ASR Mishearings
    palm: "psalm",
    palms: "psalms",
    genes: "genesis",
    joan: "jonah",
    ask: "exodus",
    genius: "genesis",
    exit: "exodus",
    josh: "joshua",
    ester: "esther",
    proverb: "proverbs",
    jeremy: "jeremiah",
    lamentation: "lamentations",
    jose: "joseph",
    hose: "hosea",
    hosiah: "hosea",
    hosaia: "hosea",
    jewel: "joel",
    mica: "micah",
    johny: "john",
    donut: "jonah",
    donuts: "jonah",
    isiah: "isaiah",
    izaiah: "isaiah",
    obadayah: "obadiah",
    obadaya: "obadiah",
    obediah: "obadiah",
    zachariah: "zechariah",
    zacharia: "zechariah",
    habakuk: "habakkuk",
    deutronomy: "deuteronomy",
    deuteromony: "deuteronomy",
    ecclesiastic: "ecclesiastes",
    ecclesiastics: "ecclesiastes",
    malakai: "malachi",
    thessalonian: "thessalonians",
    philippian: "philippians",
    levitic: "leviticus",
    romance: "romans",
    corinthian: "corinthians",
    galatian: "galatians",
    ephesian: "ephesians",
    colossian: "colossians",
    collisions: "colossians",
    philman: "philemon",
    philamon: "philemon",
    filman: "philemon",
    hebrew: "hebrews",
    revelations: "revelation",
    revolution: "revelation",
    revolutions: "revelation",

    // Common Book Abbreviations
    mat: "matthew",
    matt: "matthew",
    gen: "genesis",
    ex: "exodus",
    lev: "leviticus",
    num: "numbers",
    deut: "deuteronomy",
    sam: "samuel",
    ps: "psalms",
    psa: "psalms",
    prov: "proverbs",
    eccl: "ecclesiastes",
    isa: "isaiah",
    jer: "jeremiah",
    dan: "daniel",
    hos: "hosea",
    hab: "habakkuk",
    zeph: "zephaniah",
    hag: "haggai",
    zech: "zechariah",
    mal: "malachi",
    rom: "romans",
    cor: "corinthians",
    gal: "galatians",
    eph: "ephesians",
    phil: "philippians",
    col: "colossians",
    thess: "thessalonians",
    tim: "timothy",
    heb: "hebrews",
    rev: "revelation",

    // Ordinal Number Mishearings
    thirst: "first",
    sec: "second",
    turd: "third",
    ford: "fourth",

    // Other Mishearings
    cha: "chapter"
}

export function normalizeMishearings(text: string): string {
    let normalized = text.toLowerCase()

    // "for" as "four" only after a chapter/verse cue. Never rewrite "for God so loved".
    normalized = normalized.replace(/\b((?:chapter|chapters|verse|verses|chapitre|capítulo|capitulo|kapitel|capitolo|hoofdstuk|kapittel)\s+)for\b/giu, "$1four")

    const mishearingKeys = Object.keys(COMMON_MISHEARINGS).sort((a, b) => b.length - a.length)
    const mishearingRegex = new RegExp(`(?<!\\p{L})(${mishearingKeys.join("|")})(?!\\p{L})`, "giu")

    return normalized.replace(mishearingRegex, (match) => {
        return COMMON_MISHEARINGS[match.toLowerCase()] || match
    })
}
