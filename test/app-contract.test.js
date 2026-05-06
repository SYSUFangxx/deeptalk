const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function getAssetPaths(attribute) {
  const pattern = new RegExp(`${attribute}="([^"]+)"`, "g");
  return Array.from(html.matchAll(pattern), (match) => match[1]).filter((assetPath) =>
    assetPath.startsWith("./"),
  );
}

test("index references existing local assets", () => {
  const localAssets = [...getAssetPaths("href"), ...getAssetPaths("src")];

  assert.ok(localAssets.length > 0);
  localAssets.forEach((assetPath) => {
    const resolved = path.join(projectRoot, assetPath.replace("./", ""));
    assert.ok(fs.existsSync(resolved), `${assetPath} should exist`);
  });
});

test("scripts load in the expected order", () => {
  const scripts = getAssetPaths("src");

  assert.deepEqual(scripts, [
    "./src/data/topics.js",
    "./src/lib/topic-engine.js",
    "./src/app.js",
  ]);
});

test("page can run from file protocol without module script loading", () => {
  assert.equal(html.includes('type="module"'), false);
});

test("required app mount points exist", () => {
  [
    'data-view="home"',
    'data-view="categories"',
    'id="home-content"',
    'id="category-grid"',
    'id="detail-content"',
    'id="back-home-button"',
  ].forEach((fragment) => {
    assert.ok(html.includes(fragment), `${fragment} should be present`);
  });
});

test("home keeps classification as a secondary path", () => {
  assert.equal(html.includes("tabbar"), false);
  assert.equal(html.includes("跳过这张"), false);
  assert.ok(html.includes("按分类筛选"));
});

let failed = 0;

tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
});

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`${tests.length} tests passed`);
}
