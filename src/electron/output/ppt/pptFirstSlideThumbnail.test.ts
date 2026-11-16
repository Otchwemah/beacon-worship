import { describe, expect, it } from "vitest"
import { chooseFirstSlideImage, isPptRasterMediaEntry, isSlide1RelsEntry, parseImageRelationshipTargets, resolveSlideMediaPath } from "./pptFirstSlideThumbnail"

describe("isSlide1RelsEntry", () => {
    it("matches the first-slide relationships part", () => {
        expect(isSlide1RelsEntry("ppt/slides/_rels/slide1.xml.rels")).toBe(true)
        expect(isSlide1RelsEntry("ppt\\slides\\_rels\\slide1.xml.rels")).toBe(true)
        expect(isSlide1RelsEntry("./ppt/slides/_rels/slide1.xml.rels")).toBe(true)
    })

    it("rejects other slides and unrelated parts", () => {
        expect(isSlide1RelsEntry("ppt/slides/_rels/slide2.xml.rels")).toBe(false)
        expect(isSlide1RelsEntry("ppt/slides/slide1.xml")).toBe(false)
        expect(isSlide1RelsEntry("docProps/thumbnail.jpeg")).toBe(false)
    })
})

describe("isPptRasterMediaEntry", () => {
    it("accepts images Chromium can draw", () => {
        expect(isPptRasterMediaEntry("ppt/media/image1.jpeg")).toBe(true)
        expect(isPptRasterMediaEntry("ppt/media/image1.PNG")).toBe(true)
        expect(isPptRasterMediaEntry("ppt/media/bg.webp")).toBe(true)
    })

    it("rejects videos, fonts and EMF", () => {
        expect(isPptRasterMediaEntry("ppt/media/video1.mp4")).toBe(false)
        expect(isPptRasterMediaEntry("ppt/fonts/font1.fntdata")).toBe(false)
        expect(isPptRasterMediaEntry("ppt/media/image1.emf")).toBe(false)
        expect(isPptRasterMediaEntry("docProps/thumbnail.jpeg")).toBe(false)
    })
})

describe("parseImageRelationshipTargets / resolveSlideMediaPath", () => {
    const rels = `<?xml version="1.0"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
            <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.jpeg"/>
            <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/icon.png"/>
        </Relationships>`

    it("returns only image targets", () => {
        expect(parseImageRelationshipTargets(rels)).toEqual(["../media/image1.jpeg", "../media/icon.png"])
    })

    it("resolves slide-relative media paths", () => {
        expect(resolveSlideMediaPath("../media/image1.jpeg")).toBe("ppt/media/image1.jpeg")
        expect(resolveSlideMediaPath("ppt/media/image1.jpeg")).toBe("ppt/media/image1.jpeg")
        expect(resolveSlideMediaPath("")).toBe("")
    })
})

describe("chooseFirstSlideImage", () => {
    const rels = `<Relationships>
        <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/icon.png"/>
        <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/page.jpeg"/>
    </Relationships>`

    it("picks the largest image that actually belongs to slide 1", () => {
        expect(
            chooseFirstSlideImage(rels, [
                { name: "ppt/media/icon.png", size: 1200 },
                { name: "ppt/media/page.jpeg", size: 480000 },
                { name: "ppt/media/other-slide.png", size: 900000 }
            ])
        ).toBe("ppt/media/page.jpeg")
    })

    it("returns null when slide 1 has no picture", () => {
        expect(chooseFirstSlideImage("<Relationships/>", [{ name: "ppt/media/page.jpeg", size: 10 }])).toBeNull()
        expect(chooseFirstSlideImage("", [])).toBeNull()
    })
})
