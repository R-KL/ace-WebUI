//This JS script is supposed to be used for the preview function instead of the preview.html template + js in index.js
// The Idea is to eliminate the need of a separate preview.html template and make the html from pure JS, CSS and JSON files
//In future we can also do live preview with this setup...

let doc = null;
let marked = null;
//const hljs = null;
let dompurify = null;
let temml = null;
let ask_purify = false;
let purify = false;
const STYLE_MAP = {
    // Typography
    "_line-height": "line-height",
    "_letter-spacing": "letter-spacing",
    "_size": "font-size",
    "_weight": "font-weight",
    "_font": "font-family",

    // Layout
    "_width": "width",
    "_max-width": "max-width",
    "_pad": "padding",
    "_bg": "background-color",
    "_color": "color",

    // Accents
    "_accent": "accent-color",
    "_radius": "border-radius",

    //Styles for body
    "_body-bg": "background-color"
};
let styles = {};
let body_styles = {};
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
    const TEMML = {
        name: "math",
        level: "inline",
        start(src) { return src.indexOf("$"); },
        tokenizer(src) {
            const rule = /^(\$\$?)([^\$]+)\1/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: "math",
                    raw: match[0],
                    text: match[2].trim()
                };
            }
            return false;
        },
        renderer(token) {
            return renderMath(token);
        }
    };
    marked.use({ extensions: [TEMML] });
}
async function applyTheme(theme) {
    try {
        const response = await fetch("themes.json");
        if (!response.ok) {
            throw new Error(`Failed to load theme JSON: ${response.statusText}`);
        }
        const themes = await response.json();
        if (themes[theme]) {
            const themeStyles = themes[theme];
            for (const [property, value] of Object.entries(themeStyles)) {
                try {
                    if (property.startsWith("_body")) {
                        body_styles[STYLE_MAP[property]] = value;
                    } else {
                        styles[STYLE_MAP[property]] = value;
                    }
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

function checkbox_integration(d, immutable) {
    const checkmarks = d.querySelectorAll('input[type="checkbox"]');
    if (checkmarks.length === 0) return;
    const svg = d.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = d.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M18.9,8.1L9,18L4.05,13.05L4.76,12.34L9,16.59L18.19,7.39L18.9,8.1Z");
    svg.appendChild(path);
    svg.style.cursor = 'pointer';
    svg.style.transition = 'opacity 0.2s ease';
    const grandParent = d.querySelector('body');
    checkmarks.forEach(checkbox => {
        const customCheckbox = d.createElement('div');
        customCheckbox.classList.add('custom-checkbox');
        const cloneSvg = d.importNode(svg, true);
        customCheckbox.appendChild(cloneSvg);
        if (checkbox.checked) {
            cloneSvg.style.opacity = '1';
        } else {
            cloneSvg.style.opacity = '0';
        }
        checkbox.parentNode.replaceChild(customCheckbox, checkbox);
    });
    if (immutable) return;
    if (!grandParent.dataset.listenerAttached) {
        grandParent.dataset.listenerAttached = true;
        grandParent.addEventListener('click', (e) => {
            if (e.target.closest('.custom-checkbox')) {
                const checkbox = e.target.closest('.custom-checkbox').firstElementChild;
                if (checkbox.style.opacity === '1') {
                    checkbox.style.opacity = '0';
                } else {
                    checkbox.style.opacity = '1';
                }
            }
        });
    }
}

export function createPreview(heading = "Preview",sameWindow = null) {
    //defining the html page
    doc = window.open("", sameWindow ? "_self": "_blank");
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
// For math rendering using TeMML
function renderMath(token) {
    if (!temml) return token.text; // Fallback to raw text 
    // console.log(`Rendering math: ${token.text} >> ${temml.renderToString(token.text)}`);
    return temml.renderToString(token.text,{displayMode: token.raw.startsWith("$$")});
}
// for markdown rendering
export async function renderPreviewMarkdown(content, sameWindow = null) {
    let checkbox_immutable = false;
    if (!doc || doc.closed) {
        createPreview();
    }
    const containsMath = /\$[^$]+\$|\$\$[\s\S]+?\$\$/.test(content);
    if (containsMath && !temml) {
        console.log("The preview content contains math. Lazy-loading TeMML...");
        try {
            temml = (await import("temml")).default;

            // Only inject the CSS if we actually needed to load TeMML
            if (!doc.document.getElementById("temml-styles")) {
                const style = doc.document.createElement("style");
                style.id = "temml-styles";
                const temmlCSS = await import("temml/dist/Temml-Local.css?inline");
                style.textContent = temmlCSS.default;
                doc.document.head.appendChild(style);
            }
        } catch (e) {
            console.warn("Failed to load TeMML for math rendering.", e);
        }
    }
    try {
        // Check if the style is already injected
        if (!doc.document.getElementById("preview-styles")) {
            const codeBlockCSS = await import("highlight.js/styles/atom-one-dark.min.css?inline");
            const globalCSS = await import("./preview-engine.css?inline");
            const style = doc.document.createElement("style");
            style.id = "preview-styles";
            style.textContent = codeBlockCSS.default + "\n" + globalCSS.default;
            doc.document.head.appendChild(style);
        }
    } catch (e) {
        console.warn("Failed to load CSS.", e);
    }
    if (!marked) {
        await init_engine();
    }
    styles = {};
    body_styles = {};
    const tokens = marked.lexer(content);
    if (tokens.links) {
        for (const [k, v] of Object.entries(tokens.links)) {
            if (!k.startsWith("_")) continue; // Only process links that start with "_"
            if (k.startsWith("_body")) {
                const property = STYLE_MAP[k];
                const value = v.title ? v.title.replace(/[()]/g, '') : null;
                body_styles[property] = value;
                console.log(`Applied body style from markdown link: ${property}: ${body_styles[property]}`);
            } else if (STYLE_MAP[k]) {
                const property = STYLE_MAP[k];
                const value = v.title ? v.title.replace(/[()]/g, '') : null;
                styles[property] = value;
                console.log(`Applied style from markdown link: ${property}: ${styles[property]}`);
            } else if (k == "_theme") {
                try {
                    await applyTheme(v.title.replace(/[()]/g, ''));
                } catch (e) {
                    console.warn(`Failed to apply theme "${v.title}", using default styles.`, e);
                }
            } else if (k == "_immutable") {
                checkbox_immutable = v.title ? v.title.toLowerCase() === "true" : false;
            }
            else {
                console.warn(`Unrecognized style property "${k}" in markdown link, ignoring.`);
            }

        }
    }
    const div = doc.document.getElementById("preview-container");
    if (div.style) div.removeAttribute("style");
    for (const [property, value] of Object.entries(styles)) {
        div.style.setProperty(property, value);
    }
    // Apply body styles
    for (const [property, value] of Object.entries(body_styles)) {
        doc.document.body.style.setProperty(property, value);
    }
    div.innerHTML = dompurify.sanitize(marked.parser(tokens), { USE_PROFILES: { html: true, mathMl: true } });
    checkbox_integration(doc.document, checkbox_immutable);

}
export async function renderPreviewHTML(content, purify_override = false) {
    if (!ask_purify) {
        // window.dispatchEvent(new CustomEvent('update-msg', { detail: { msg: "Warning: Rendering raw HTML espicially with JavaScript etc can be dangerous and may lead to XSS attacks. Sanitazation can sometimes remove important functionality provided by JavaScript etc, this is normally done to stop malicious code from running. If you did not intend this, make sure you konw what Javascript code is being executed and render raw HTML without sanitization. You can render raw HTML after this preview using the terminal command preview --raw=true" } }));
        ask_purify = true;
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
