import { describe, expect, it } from "vitest"
import { slimPowerpointJson } from "./slimPowerpointJson"

describe("slimPowerpointJson", () => {
    it("keeps XML, rels, contentPaths and the deck thumbnail", () => {
        const slim = slimPowerpointJson({
            "ppt/presentation.xml": { slides: 1 },
            "ppt/slides/_rels/slide1.xml.rels": [{ id: "rId1" }],
            "[Content_Types].xml": { types: true },
            contentPaths: { "ppt/media/image1.png": "/tmp/image1.png" },
            deckThumbnailPath: "/tmp/thumb.jpeg",
            "ppt/media/image1.png": Buffer.from("fake"),
            "ppt/embeddings/oleObject1.bin": Buffer.from("ole")
        })

        expect(slim["ppt/presentation.xml"]).toEqual({ slides: 1 })
        expect(slim["ppt/slides/_rels/slide1.xml.rels"]).toEqual([{ id: "rId1" }])
        expect(slim["[Content_Types].xml"]).toEqual({ types: true })
        expect(slim.contentPaths).toEqual({ "ppt/media/image1.png": "/tmp/image1.png" })
        expect(slim.deckThumbnailPath).toBe("/tmp/thumb.jpeg")
        expect(slim["ppt/media/image1.png"]).toBeUndefined()
        expect(slim["ppt/embeddings/oleObject1.bin"]).toBeUndefined()
    })

    it("returns non-objects unchanged", () => {
        expect(slimPowerpointJson(null)).toBeNull()
        expect(slimPowerpointJson(undefined)).toBeUndefined()
    })
})
