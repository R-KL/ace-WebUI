//This JS script is supposed to be used for the preview function instead of the preview.html template + js in index.js
// The Idea is to eliminate the need of a separate preview.html template and make the html from pure JS, CSS and JSON files

//In future we can also do live preview with this setup...

let doc = null;
let marked = null;
//const hljs = null;
let dompurify = null;
let ask_purify = false;
let purify = true;
const STYLE_MAP = {
    // Typography
    "_line-height": "line-height",
    "_letter-spacing": "letter-spacing",
    "_size": "font-size",
    "_weight": "font-weight",
    "_font": "font-family",

    // Layout
    "_width": "max-width",
    "_pad": "padding",
    "_bg": "background-color",
    "_color": "color",

    // Accents
    "_accent": "accent-color",
    "_radius": "border-radius"
};
let styles = {};
async function init_engine() {
    const { Marked } = await import("marked");
    const { markedHighlight } = await import("marked-highlight");
    const hljs = (await import("highlight.js")).default;
    dompurify = (await import("dompurify")).default;
    marked = new Marked(
        markedHighlight({
            emptyLangClass: "hljs",
            langPrefix: "hljs language-",
            highlight: (code, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return dompurify.sanitize(hljs.highlightAuto(code).value);
            }
        })
    );
}
async function applyTheme(theme) {
    try {
        const response = await fetch("/themes.json");
        if (!response.ok) {
            throw new Error(`Failed to load theme JSON: ${response.statusText}`);
        }
        const themes = await response.json();
        if (themes[theme]) {
            const themeStyles = themes[theme];
            for (const [property, value] of Object.entries(themeStyles)) {
                try {
                    styles[STYLE_MAP[property]] = value;
                }
                catch (e) {
                    console.warn(`Failed to apply style "${property}: ${value}" from theme "${theme}", ignoring.`, e);
                }
            }
        } else {
            console.warn(`Theme "${theme}" not found in ${"/themes.json"}. Available themes: ${Object.keys(themes).join(", ")}`);
        }
    }
    catch (error) {
        console.error("Error loading theme JSON:", error);
    }
}
export function createPreview(heading = "Preview") {
    //defining the html page
    doc = window.open("", "_blank");
    const d = doc.document;
    const metaCharSet = d.createElement("meta");
    const metaViewport = d.createElement("meta");
    metaCharSet.setAttribute("charset", "UTF-8");
    metaViewport.setAttribute("name", "viewport");
    metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0");
    const title = d.createElement("title");
    title.textContent = heading;
    d.head.appendChild(title);
    d.head.appendChild(metaCharSet);
    d.head.appendChild(metaViewport);
    const div = d.createElement("div");
    div.setAttribute("id", "preview-container");
    d.body.appendChild(div);
}
// for markdown rendering
export async function renderPreviewMarkdown(content) {
    if (!doc || doc.closed) {
        createPreview();
    }
    try {
        const codeBlockCSS = await import("highlight.js/styles/atom-one-dark.min.css?inline");
        const globalCSS = await import("./preview-engine.css?inline");
        const style = doc.document.createElement("style");
        style.textContent = codeBlockCSS.default + "\n" + globalCSS.default;
        doc.document.head.appendChild(style);
    }
    catch (e) {
        console.warn("Failed to load code block CSS, code blocks may not be styled properly.", e);
    }
    if (!marked) {
        await init_engine();
    }
    styles = {};
    const tokens = marked.lexer(content);
    if (tokens.links) {
        for (const [k, v] of Object.entries(tokens.links)) {
            if (STYLE_MAP[k]) {
                const property = STYLE_MAP[k];
                const value = v.title ? v.title.replace(/[()]/g, '') : null;
                styles[property] = value;
            } else if (k == "_theme") {
                try {
                    await applyTheme(v.title.replace(/[()]/g, ''));
                } catch (e) {
                    console.warn(`Failed to apply theme "${v.title}", using default styles.`, e);
                }
            } else {
                console.warn(`Unrecognized style property "${k}" in markdown link, ignoring.`);
            }

        }
    }
    const div = doc.document.getElementById("preview-container");
    if (div.style) div.removeAttribute("style");
    for (const [property, value] of Object.entries(styles)) {
        div.style.setProperty(property, value);
    }
    div.innerHTML = dompurify.sanitize(marked.parser(tokens));
}
export async function renderPreviewHTML(content, purify_override = false) {
    if (!ask_purify) {
        ask_purify = true;
        if (!confirm("Warning: Rendering raw HTML espicially with JavaScript etc can be dangerous and may lead to XSS attacks. Click 'Cancel' to render without sanitization (if you know the code and what you're doing) or 'OK' to sanitize the HTML (for example somebody else's code). Sanitazation can sometimes remove important functionality provided by JavaScript etc, this is normally done to stop malicious code from running. If you did not intend this, make sure you konw what Javascript code is being executed and render raw HTML without sanitization. You can render raw HTML after this preview using the terminal command preview --raw=true")) {
            purify = false;
        }

    }
    if (!doc || doc.closed) {
        createPreview();
    }
    if (purify || purify_override) {
        if (!dompurify) await init_engine();
        const div = doc.document.getElementById("preview-container");
        div.innerHTML = dompurify.sanitize(content);
    } else {
        doc.document.open();
        doc.document.write(content);
        doc.document.close();
    }
}
