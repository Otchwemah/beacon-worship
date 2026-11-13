import { describe, expect, it } from "vitest"
import { normalizePowerpointPath, resolvePowerpointMediaPath, resolvePowerpointTarget } from "./powerpointMedia"

describe("normalizePowerpointPath", () => {
    it("normalizes backslashes, leading slashes and duplicate separators", () => {
        expect(normalizePowerpointPath("\\ppt\\media\\image1.png")).toBe("ppt/media/image1.png")
        expect(normalizePowerpointPath("/ppt//media/image1.png")).toBe("ppt/media/image1.png")
    })
})

describe("resolvePowerpointTarget", () => {
    it("resolves relative targets against the referencing part", () => {
        expect(resolvePowerpointTarget("ppt/slides/slide1.xml", "../media/image1.png")).toBe("ppt/media/image1.png")
        expect(resolvePowerpointTarget("ppt/slideLayouts/slideLayout1.xml", "../media/image2.jpeg")).toBe("ppt/media/image2.jpeg")
    })

    it("keeps package-absolute targets and handles missing fromPath", () => {
        expect(resolvePowerpointTarget("ppt/slides/slide1.xml", "/ppt/media/image1.png")).toBe("ppt/media/image1.png")
        expect(resolvePowerpointTarget(null, "../media/image1.png")).toBe("../media/image1.png")
    })
})

describe("resolvePowerpointMediaPath", () => {
    const contentPaths = {
        "ppt/media/image1.png": "/data/imports/PowerPoint/PHB 108/image1.png",
        "ppt/media/image2.jpeg": "/data/imports/PowerPoint/PHB 108/image2.jpeg",
        "ppt/media/Image3.PNG": "/data/imports/PowerPoint/PHB 108/Image3.PNG",
        "ppt/media/image%204.png": "/data/imports/PowerPoint/PHB 108/image 4.png"
    }

    it("resolves an exact package path", () => {
        expect(resolvePowerpointMediaPath("ppt/media/image1.png", contentPaths)).toBe(contentPaths["ppt/media/image1.png"])
    })

    it("resolves a relative slide target when given the referencing part", () => {
        expect(resolvePowerpointMediaPath("../media/image1.png", contentPaths, "ppt/slides/slide1.xml")).toBe(contentPaths["ppt/media/image1.png"])
    })

    it("resolves a bare media target by basename fallback", () => {
        expect(resolvePowerpointMediaPath("media/image2.jpeg", contentPaths)).toBe(contentPaths["ppt/media/image2.jpeg"])
        expect(resolvePowerpointMediaPath("image2.jpeg", contentPaths)).toBe(contentPaths["ppt/media/image2.jpeg"])
    })

    it("resolves backslashes and leading slashes", () => {
        expect(resolvePowerpointMediaPath("\\ppt\\media\\image1.png", contentPaths)).toBe(contentPaths["ppt/media/image1.png"])
        expect(resolvePowerpointMediaPath("/ppt/media/image1.png", contentPaths)).toBe(contentPaths["ppt/media/image1.png"])
    })

    it("resolves case-insensitively", () => {
        expect(resolvePowerpointMediaPath("ppt/media/image3.png", contentPaths)).toBe(contentPaths["ppt/media/Image3.PNG"])
    })

    it("resolves URL-encoded names in either direction", () => {
        expect(resolvePowerpointMediaPath("ppt/media/image 4.png", contentPaths)).toBe(contentPaths["ppt/media/image%204.png"])
        expect(resolvePowerpointMediaPath("ppt/media/image%204.png", contentPaths)).toBe(contentPaths["ppt/media/image%204.png"])
    })

    it("returns external / already-usable URLs unchanged", () => {
        expect(resolvePowerpointMediaPath("https://example.com/a.png", contentPaths)).toBe("https://example.com/a.png")
        expect(resolvePowerpointMediaPath("data:image/png;base64,abc", contentPaths)).toBe("data:image/png;base64,abc")
        expect(resolvePowerpointMediaPath("file:///tmp/a.png", contentPaths)).toBe("file:///tmp/a.png")
    })

    it("returns null for missing / empty targets or unknown media", () => {
        expect(resolvePowerpointMediaPath(null, contentPaths)).toBeNull()
        expect(resolvePowerpointMediaPath(undefined, contentPaths)).toBeNull()
        expect(resolvePowerpointMediaPath("", contentPaths)).toBeNull()
        expect(resolvePowerpointMediaPath("ppt/media/missing.png", contentPaths)).toBeNull()
        expect(resolvePowerpointMediaPath("ppt/media/image1.png", {})).toBeNull()
    })
})
