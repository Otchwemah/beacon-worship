const BOOK_NAMES = [
    "",
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalm",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation"
]

function bookName(book: number | string): string {
    if (typeof book === "string" && /[A-Za-z]/.test(book) && !/^\d+$/.test(book.trim())) return book.trim()
    return BOOK_NAMES[Number(book)] || String(book)
}

export function formatSermonReference(resolved: { book: number | string; chapter: number; verses: number[] }): string {
    const name = bookName(resolved.book)
    const verses = (resolved.verses || []).filter((n) => Number.isFinite(Number(n))).map(Number)
    if (!verses.length) return `${name} ${resolved.chapter}`
    if (verses.length === 1) return `${name} ${resolved.chapter}:${verses[0]}`
    const contiguous = verses.every((verse, index) => index === 0 || verse === verses[index - 1] + 1)
    const span = contiguous ? `${verses[0]}-${verses[verses.length - 1]}` : verses.join(",")
    return `${name} ${resolved.chapter}:${span}`
}
