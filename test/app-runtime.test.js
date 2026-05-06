const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");

function createElement(selector) {
  const listeners = {};

  return {
    selector,
    children: [],
    dataset: {},
    hidden: false,
    innerHTML: "",
    textContent: "",
    className: "",
    classList: {
      states: new Set(),
      add(name) {
        this.states.add(name);
      },
      remove(name) {
        this.states.delete(name);
      },
      toggle(name, active) {
        if (active) {
          this.states.add(name);
        } else {
          this.states.delete(name);
        }
      },
    },
    addEventListener(event, handler) {
      listeners[event] = handler;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    click() {
      if (listeners.click) listeners.click();
    },
  };
}

function createDocument() {
  const ids = [
    "back-home-button",
    "home-category",
    "home-card",
    "home-tags",
    "home-content",
    "home-prompt",
    "home-next-button",
    "go-categories-button",
    "category-grid",
    "category-detail",
    "detail-category-title",
    "detail-category",
    "detail-tags",
    "detail-content",
    "detail-prompt",
    "detail-next-button",
    "detail-skip-button",
    "change-category-button",
  ];
  const bySelector = new Map(ids.map((id) => [`#${id}`, createElement(`#${id}`)]));
  bySelector.get("#home-card").classList.states.add("is-covered");
  const views = ["home", "categories"].map((viewName) => {
    const view = createElement(`[data-view=${viewName}]`);
    view.dataset.view = viewName;
    return view;
  });

  return {
    bySelector,
    views,
    createElement,
    querySelector(selector) {
      return bySelector.get(selector) || null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-view]") return views;
      return [];
    },
  };
}

function runScript(context, relativePath) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  vm.runInContext(source, context, { filename: relativePath });
}

const document = createDocument();
const context = vm.createContext({
  console,
  document,
  setTimeout(callback) {
    callback();
  },
  scrollTo() {},
});
context.globalThis = context;
context.window = context;

runScript(context, "src/data/topics.js");
runScript(context, "src/lib/topic-engine.js");
runScript(context, "src/app.js");

assert.equal(document.bySelector.get("#home-content").textContent.length, 0);
assert.ok(document.bySelector.get("#home-card").classList.states.has("is-covered"));

document.bySelector.get("#home-next-button").click();

assert.ok(document.bySelector.get("#home-content").textContent.length > 0);
assert.equal(document.bySelector.get("#home-card").classList.states.has("is-covered"), false);
assert.equal(document.bySelector.get("#category-grid").children.length, 6);

document.bySelector.get("#category-grid").children[0].click();

assert.equal(document.bySelector.get("#category-detail").hidden, false);
assert.equal(document.bySelector.get("#detail-category-title").textContent, "共同回忆");
assert.ok(document.bySelector.get("#detail-content").textContent.length > 0);

console.log("ok - app initializes, draws a card, and category interaction works");
