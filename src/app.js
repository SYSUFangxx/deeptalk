(function () {
  const { topics, categories } = window.DeepTalkData;
  const { getTopicPool, pickRandomTopic } = window.DeepTalkEngine;

  const sessionState = {
    homeCurrentId: null,
    categoryCurrentId: null,
    activeCategory: null,
    skippedIds: new Set(),
  };

  const elements = {
    views: document.querySelectorAll("[data-view]"),
    navButtons: document.querySelectorAll("[data-nav]"),
    homeCategory: document.querySelector("#home-category"),
    homeTags: document.querySelector("#home-tags"),
    homeContent: document.querySelector("#home-content"),
    homePrompt: document.querySelector("#home-prompt"),
    homeNextButton: document.querySelector("#home-next-button"),
    homeSkipButton: document.querySelector("#home-skip-button"),
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
    renderTopic(topic, {
      category: elements.homeCategory,
      content: elements.homeContent,
      prompt: elements.homePrompt,
      tags: elements.homeTags,
    });
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
    showHomeTopic(pickRandomTopic(pool, { currentId: sessionState.homeCurrentId }));
  }

  function skipHomeTopic() {
    if (sessionState.homeCurrentId) {
      sessionState.skippedIds.add(sessionState.homeCurrentId);
    }
    nextHomeTopic();
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
    elements.navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.nav === viewName);
    });
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
        <span class="category-chip-mark">+</span>
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
    elements.homeSkipButton.addEventListener("click", skipHomeTopic);
    elements.detailNextButton.addEventListener("click", nextCategoryTopic);
    elements.detailSkipButton.addEventListener("click", skipCategoryTopic);
    elements.goCategoriesButton.addEventListener("click", () => setView("categories"));
    elements.changeCategoryButton.addEventListener("click", () => {
      elements.categoryDetail.hidden = true;
      sessionState.activeCategory = null;
      sessionState.categoryCurrentId = null;
    });

    elements.navButtons.forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.nav));
    });
  }

  function init() {
    renderCategoryGrid();
    bindEvents();
    nextHomeTopic();
    setView("home");
  }

  init();
})();
