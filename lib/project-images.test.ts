import {
  parseStoredImage,
  projectImageList,
  projectImageUrls,
  serializeStoredImage,
  storedImageSize,
  storedImageUrl,
} from "./project-images";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(storedImageUrl("https://example.com/a.jpg") === "https://example.com/a.jpg", "plain url");
assert(
  storedImageUrl(
    '{"url":"https://example.com/a.jpg","width":852,"height":1200}',
  ) === "https://example.com/a.jpg",
  "json url",
);
assert(
  JSON.stringify(storedImageSize('{"url":"https://example.com/a.jpg","width":852,"height":1200}')) ===
    JSON.stringify({ width: 852, height: 1200 }),
  "json size",
);
assert(storedImageSize("https://example.com/a.jpg") === null, "plain url has no size");
assert(
  serializeStoredImage({
    url: "https://example.com/a.jpg",
    width: 852,
    height: 1200,
  }) === '{"url":"https://example.com/a.jpg","width":852,"height":1200}',
  "serialize with size",
);
assert(parseStoredImage({ url: "https://example.com/a.jpg", width: 10, height: 20 }).height === 20, "object input");
assert(
  storedImageUrl({ url: "https://example.com/a.jpg", width: 852, height: 1200 }) ===
    "https://example.com/a.jpg",
  "object url",
);
assert(
  JSON.stringify(
    projectImageUrls([
      "https://example.com/plain.jpg",
      { url: "https://example.com/object.jpg", width: 10, height: 20 },
      '{"url":"https://example.com/json.jpg","width":1,"height":2}',
    ]),
  ) ===
    JSON.stringify([
      "https://example.com/plain.jpg",
      "https://example.com/object.jpg",
      "https://example.com/json.jpg",
    ]),
  "mixed image list urls",
);
assert(projectImageList([{ url: "https://example.com/a.jpg" }])[0].url === "https://example.com/a.jpg", "object list");

console.log("project-images ok");
