(function (root, factory) {
  const engine = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = engine;
    return;
  }

  root.DeepTalkEngine = engine;
})(globalThis, function () {
  function getTopicPool(topics, options) {
    const category = options && options.category;
    const skippedIds = new Set((options && options.skippedIds) || []);
    const basePool = category ? topics.filter((topic) => topic.category === category) : topics.slice();
    const availablePool = basePool.filter((topic) => !skippedIds.has(topic.id));

    return availablePool.length > 0 ? availablePool : basePool;
  }

  function pickRandomTopic(pool, options) {
    const currentId = options && options.currentId;
    const random = (options && options.random) || Math.random;

    if (!Array.isArray(pool) || pool.length === 0) return null;
    if (pool.length === 1) return pool[0];

    let candidate = pool[Math.floor(random() * pool.length)];
    let attempts = 0;

    while (candidate.id === currentId && attempts < 12) {
      candidate = pool[Math.floor(random() * pool.length)];
      attempts += 1;
    }

    return candidate;
  }

  return {
    getTopicPool,
    pickRandomTopic,
  };
});
