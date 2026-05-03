const assert = require("node:assert/strict");

const { topics, categories } = require("../src/data/topics.js");
const { getTopicPool, pickRandomTopic } = require("../src/lib/topic-engine.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test("every category has topics", () => {
  categories.forEach((category) => {
    const pool = getTopicPool(topics, { category: category.key });

    assert.ok(pool.length > 0, `${category.key} should have at least one topic`);
    assert.ok(
      pool.every((topic) => topic.category === category.key),
      `${category.key} pool should only include its own topics`,
    );
  });
});

test("skipped topics are filtered while available topics remain", () => {
  const category = "共同回忆";
  const categoryTopics = topics.filter((topic) => topic.category === category);
  const skippedIds = categoryTopics.slice(0, 2).map((topic) => topic.id);
  const pool = getTopicPool(topics, { category, skippedIds });

  assert.equal(pool.length, categoryTopics.length - skippedIds.length);
  assert.ok(pool.every((topic) => !skippedIds.includes(topic.id)));
});

test("pool falls back when all matching topics were skipped", () => {
  const category = "轻松脑洞";
  const categoryTopics = topics.filter((topic) => topic.category === category);
  const skippedIds = categoryTopics.map((topic) => topic.id);
  const pool = getTopicPool(topics, { category, skippedIds });

  assert.deepEqual(
    pool.map((topic) => topic.id),
    categoryTopics.map((topic) => topic.id),
  );
});

test("pickRandomTopic avoids the current topic when possible", () => {
  const pool = [
    { id: "a" },
    { id: "b" },
  ];
  const randomValues = [0, 0, 0.9];
  const picked = pickRandomTopic(pool, {
    currentId: "a",
    random: () => randomValues.shift() ?? 0.9,
  });

  assert.equal(picked.id, "b");
});

test("topic ids are unique", () => {
  const ids = topics.map((topic) => topic.id);

  assert.equal(new Set(ids).size, ids.length);
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
