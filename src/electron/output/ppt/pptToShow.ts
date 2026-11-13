import { XMLParser } from "fast-xml-parser"
import path from "path"
import { toApp } from "../.."
import { MAIN } from "../../../types/Channels"
import { decompressZipStream } from "../../data/zip"
import { createFolder, getDataFolderPath, sanitizeFileName } from "../../utils/files"
import { getPowerpointEntryFileName, isPowerpointThumbnailEntry } from "./pptEntries"

// Extract .pptx contents (zip) and convert XML files to JSON
// Media and fonts are streamed directly to disk to avoid OOM with large embedded videos.
export async function pptToShow(filePath: string) {
    try {
        console.info("Starting PPT importing...")
        const rawName = path.basename(filePath, path.extname(filePath))
        const fileName = sanitizeFileName(rawName)
        const importsFolder = getDataFolderPath("imports", "PowerPoint")
        const contentFolder = createFolder(path.join(importsFolder, fileName))

        // Decompress with streaming: media/fonts/preview go directly to disk, XML/other files buffered in memory
        const entries = await decompressZipStream(filePath, true, {
            getOutputPath: (fileName: string) => {
                const outputName = getPowerpointEntryFileName(fileName)
                if (!outputName) return undefined
                return path.join(contentFolder, outputName)
            }
        })

        const json: any = {}
        const contentPaths: { [key: string]: string } = {}
        // Beacon Worship: filesystem path of the deck's own preview image, used as the
        // stored thumbnail for Hymns/Shows drawer rows.
        let deckThumbnailPath: string | null = null

        // Process entries sequentially to avoid flooding the event loop / CPU with many
        // concurrent xml2js parses for large presentations.
        for (const entry of entries) {
            const entryName = entry.name

            // media, fonts and the deck preview: already written to disk, just store the path reference
            if (getPowerpointEntryFileName(entryName)) {
                // content is the file path when written to disk
                contentPaths[entryName] = entry.content as string
                if (isPowerpointThumbnailEntry(entryName)) deckThumbnailPath = entry.content as string
                continue
            }

            // XML files (and rels) -> parse to JSON using xml2js
            if (entryName.endsWith(".xml") || entryName.endsWith(".rels")) {
                const xmlText = typeof entry.content === "string" ? entry.content : entry.content.toString("utf8")
                try {
                    const options = {
                        ignoreAttributes: false,
                        attributeNamePrefix: "",
                        preserveOrder: true,
                        allowBooleanAttributes: true,
                        ignoreDeclaration: true,
                        trimValues: false
                    }
                    const parser = new XMLParser(options)
                    const output = parser.parse(xmlText)

                    json[entryName] = output
                } catch (err: any) {
                    console.error("Failed to parse XML for", entryName, err)
                    // fallback to raw xml text so caller still has the data
                    json[entryName] = xmlText
                }
                continue
            }

            // other files (binary or text) - store raw buffer
            json[entryName] = entry.content
        }

        json.contentPaths = contentPaths
        if (deckThumbnailPath) json.deckThumbnailPath = deckThumbnailPath

        return json
    } catch (err) {
        console.error("PPT convertion failed for", filePath, err)

        if (err.message.includes("Invalid or unsupported zip format")) {
            toApp(MAIN, { channel: "ALERT", data: "Invalid format" })
        }

        return null
    }
}
