(function () {
  const { topics, categories } = window.DeepTalkData;
  const { getTopicPool, pickRandomTopic } = window.DeepTalkEngine;

  const sessionState = {
    hasDrawnHomeCard: false,
    homeCurrentId: null,
    categoryCurrentId: null,
    activeCategory: null,
    skippedIds: new Set(),
  };

  const elements = {
    views: document.querySelectorAll("[data-view]"),
    backHomeButton: document.querySelector("#back-home-button"),
    homeCategory: document.querySelector("#home-category"),
    homeCard: document.querySelector("#home-card"),
    homeTags: document.querySelector("#home-tags"),
    homeContent: document.querySelector("#home-content"),
    homePrompt: document.querySelector("#home-prompt"),
    homeNextButton: document.querySelector("#home-next-button"),
    goCategoriesButton: document.querySelector("#go-categories-button"),
    categoryGrid: document.querySelector("#category-grid"),
    categoryDetail: document.querySelector("#category-detail"),
    detailCategoryTitle: document.querySelector("#detail-category-title"),
    detailCategory: document.querySelector("#detail-category"),
    detailTags: document.querySelector("#detail-tags"),
    detailContent: document.querySelector("#detail-content"),
    detailPrompt: document.querySelector("#detail-prompt"),
    detailNextButton: document.querySelector("#detail-next-button"),
    detailSkipButton: document.querySelector("#detail-skip-button"),
    changeCategoryButton: document.querySelector("#change-category-button"),
  };

  function createTag(label) {
    const span = document.createElement("span");
    span.className = "topic-tag";
    span.textContent = label;
    return span;
  }

  function renderTags(container, tags) {
    container.innerHTML = "";
    tags.forEach((tag) => container.appendChild(createTag(tag)));
  }

  function renderTopic(topic, target) {
    target.category.textContent = topic.category;
    target.content.textContent = topic.content;
    target.prompt.textContent = topic.prompt;
    renderTags(target.tags, topic.tags);
  }

  function showHomeTopic(topic) {
    if (!topic) return;
    sessionState.homeCurrentId = topic.id;
    sessionState.hasDrawnHomeCard = true;
    renderTopic(topic, {
      category: elements.homeCategory,
      content: elements.homeContent,
      prompt: elements.homePrompt,
      tags: elements.homeTags,
    });
    elements.homeCard.classList.remove("is-covered");
    elements.homeNextButton.textContent = "再抽一张";
  }

  function showCategoryTopic(topic) {
    if (!topic) return;
    sessionState.categoryCurrentId = topic.id;
    renderTopic(topic, {
      category: elements.detailCategory,
      content: elements.detailContent,
      prompt: elements.detailPrompt,
      tags: elements.detailTags,
    });
  }

  function nextHomeTopic() {
    const pool = getTopicPool(topics, { skippedIds: sessionState.skippedIds });
    elements.homeCard.classList.add("is-shuffling");
    window.setTimeout(() => {
      showHomeTopic(pickRandomTopic(pool, { currentId: sessionState.homeCurrentId }));
      elements.homeCard.classList.remove("is-shuffling");
    }, sessionState.hasDrawnHomeCard ? 180 : 0);
  }

  function nextCategoryTopic() {
    const pool = getTopicPool(topics, {
      category: sessionState.activeCategory,
      skippedIds: sessionState.skippedIds,
    });
    showCategoryTopic(pickRandomTopic(pool, { currentId: sessionState.categoryCurrentId }));
  }

  function skipCategoryTopic() {
    if (sessionState.categoryCurrentId) {
      sessionState.skippedIds.add(sessionState.categoryCurrentId);
    }
    nextCategoryTopic();
  }

  function setView(viewName) {
    elements.views.forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === viewName);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function activateCategory(categoryKey) {
    sessionState.activeCategory = categoryKey;
    sessionState.categoryCurrentId = null;
    elements.detailCategoryTitle.textContent = categoryKey;
    elements.categoryDetail.hidden = false;
    nextCategoryTopic();
  }

  function renderCategoryGrid() {
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-chip";
      button.type = "button";
      button.innerHTML = `
        <div>
          <strong>${category.key}</strong>
          <span>${category.description}</span>
        </div>
        <span class="category-chip-mark">›</span>
      `;
      button.addEventListener("click", () => {
        setView("categories");
        activateCategory(category.key);
      });
      elements.categoryGrid.appendChild(button);
    });
  }

  function bindEvents() {
    elements.homeNextButton.addEventListener("click", nextHomeTopic);
    elements.detailNextButton.addEventListener("click", nextCategoryTopic);
    elements.detailSkipButton.addEventListener("click", skipCategoryTopic);
    elements.goCategoriesButton.addEventListener("click", () => setView("categories"));
    elements.backHomeButton.addEventListener("click", () => setView("home"));
    elements.changeCategoryButton.addEventListener("click", () => {
      elements.categoryDetail.hidden = true;
      sessionState.activeCategory = null;
      sessionState.categoryCurrentId = null;
    });
  }

  function init() {
    renderCategoryGrid();
    bindEvents();
    setView("home");
  }

  init();
})();
