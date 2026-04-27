const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "span",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "mark",
]);

const ALLOWED_STYLE_PROPERTIES = ["color", "background-color", "font-family"];
const ALLOWED_CLASS_NAMES = new Set([
  "marker-yellow",
  "marker-green",
  "marker-pink",
  "marker-blue",
]);

function copySafeStyles(sourceNode, targetNode) {
  ALLOWED_STYLE_PROPERTIES.forEach((property) => {
    const value = sourceNode.style?.getPropertyValue(property)?.trim();
    if (value) {
      targetNode.style.setProperty(property, value);
    }
  });
}

function copySafeClasses(sourceNode, targetNode) {
  const classNames = (sourceNode.getAttribute("class") || "")
    .split(/\s+/)
    .map((className) => className.trim())
    .filter((className) => ALLOWED_CLASS_NAMES.has(className));

  if (classNames.length > 0) {
    targetNode.setAttribute("class", classNames.join(" "));
  }
}

function sanitizeNode(node, documentRef) {
  if (node.nodeType === Node.TEXT_NODE) {
    return documentRef.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.tagName.toLowerCase();
  const fragment = documentRef.createDocumentFragment();

  if (!ALLOWED_TAGS.has(tag)) {
    node.childNodes.forEach((childNode) => {
      const child = sanitizeNode(childNode, documentRef);
      if (child) fragment.appendChild(child);
    });
    return fragment;
  }

  const element = documentRef.createElement(tag);

  if (tag === "a") {
    const href = node.getAttribute("href") || "";
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(href)) {
      element.setAttribute("href", href);
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  }

  if (tag === "span" || tag === "mark") {
    copySafeStyles(node, element);
    copySafeClasses(node, element);
  }

  node.childNodes.forEach((childNode) => {
    const child = sanitizeNode(childNode, documentRef);
    if (child) element.appendChild(child);
  });

  return element;
}

export function sanitizeRichText(html) {
  if (!html || typeof window === "undefined") return html || "";

  const parser = new window.DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const wrapper = parsed.createElement("div");

  parsed.body.childNodes.forEach((childNode) => {
    const child = sanitizeNode(childNode, parsed);
    if (child) wrapper.appendChild(child);
  });

  return wrapper.innerHTML.trim();
}
