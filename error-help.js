(function() {
  let container;
  let lastErrorKey;
  let fileLoader = Promise.resolve();
  const deferred = [];

  function createKey(args) {
    return args.map(a => (a || '').toString()).join(" ");
  }

  function createContainer() {
    if (!container) {
      container = document.createElement("div");
      Object.assign(container.style, {
        pointerEvents: "none",
        top: "0",
        left: "0",
        position: "absolute",
        zIndex: 100000,
        width: "100%"
      });
      document.body.appendChild(container);
    }
  }

  function clearContainer() {
    fileLoader = Promise.resolve();
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }
    }
  }

  function render(msg, url, line, col, err) {
    const key = createKey([...arguments]);
    if (key === lastErrorKey) return;
    lastErrorKey = key;
    clearContainer();
    createContainer();

    const file = url.split("/").pop();

    const popup = document.createElement("div");
    popup.onclick = () => clearContainer();

    const header = popup.appendChild(document.createElement("header"));
    header.textContent = "Error";
    Object.assign(header.style, {
      color: "black",
      fontSize: "12px",
      fontWeight: "bold"
    });

    const lineCol = popup.appendChild(document.createElement("div"));
    lineCol.innerHTML = `<span><em>${file}</em> Line <strong>${line}</strong> Col <strong>${col}</strong></span>`;
    Object.assign(lineCol.style, {
      fontSize: "12px",
      color: "gray"
    });

    const text = popup.appendChild(document.createElement("div"));
    text.textContent = msg;
    Object.assign(text.style, {
      marginTop: "10px"
    });

    Object.assign(popup.style, {
      pointerEvents: "initial",
      margin: "20px",
      cursor: "pointer",
      borderRadius: "2px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      boxSizing: "border-box",
      background: "#fff",
      fontSize: "14px",
      padding: "20px",
      fontWeight: "normal",
      fontFamily: "monospace",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      color: "#ff0000",
      border: "1px dashed hsla(0, 0%, 50%, 0.25)",
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)"
    });
    container.appendChild(popup);

    (async () => {
      try {
        const err = await fetchCodeError(url, line, col);
        if (err) {
          const text = popup.appendChild(document.createElement("div"));
          text.textContent = err;
          Object.assign(text.style, {
            background: "hsl(0, 0%, 95%)",
            padding: "10px",
            fontSize: "12px",
            color: "black",
            width: "100%",
            borderRadius: "2px",
            boxSizing: "border-box",
            marginTop: "10px",
            whiteSpace: "pre"
          });
        }
      } catch (err) {}
    })();
  }

  window.addEventListener('error', function(ev) {
    const args = eventToArguments(ev);
    if (document.readyState !== "complete") {
      deferred.push(args);
      return;
    }
    render(...args);
  }, { passive: true });

  function eventToArguments (ev) {
    let { message, filename, lineno, colno, error } = ev;
    message = message || 'Unknown error';
    error = error || new Error(message);
    filename = filename || null;
    return [ message, filename, lineno, colno, error ];
  }

  async function fetchCodeError(url, line, col) {
    line = line - 1;
    const resp = await window.fetch(url);
    const text = await resp.text();
    const lines = text.split("\n");
    const pad = 1;
    const hasBefore = line - pad > 0;
    const hasAfter = line + pad + 1 < lines.length;
    const frameBefore = lines.slice(Math.max(0, line - pad), line);
    const frameAfter = lines.slice(
      line + 1,
      Math.min(lines.length, line + pad + 1)
    );
    const frameCur = lines[line];
    const arrow = [...new Array(col - 1).fill(" "), "^"].join("");
    const frame = [
      hasBefore ? "..." : "",
      ...frameBefore,
      frameCur,
      arrow,
      ...frameAfter,
      hasAfter ? "..." : ""
    ];
    return frame.join("\n").trim();
  }

  let hasWarned = false;
  const origWarn = console.warn.bind(console);

  const wrapDupeLog = fn => {
    const orig = console[fn];
    let count = 0;
    const maxCount = 10;
    // Optional debug log helper
    const keyMap = {};
    const keyMapCooldown = 1500;
    const createDeleteTimeout = key => {
      return setTimeout(() => {
        delete keyMap[key];
      }, keyMapCooldown);
    };

    console[fn] = function () {
      const args = [...arguments];
      const key = createKey(args);
      if (key in keyMap) {
        const entry = keyMap[key];
        clearTimeout(entry.timeout);
        entry.timeout = createDeleteTimeout(key);
        entry.count++;
        if (entry.count > maxCount) {
          if (!hasWarned) {
            origWarn(
              `
The error-help utility has ignored some console.${fn} to reduce visual clutter. You can disable this by omitting the "dedupe-logs" attribute in the error-help script tag.
`.trim()
            );
          }
          hasWarned = true;
          return;
        }
      } else {
        keyMap[key] = {
          count: 1,
          timeout: createDeleteTimeout(key)
        };
      }
      return orig.apply(console, args);
    };
  };

  if ('currentScript' in document && document.currentScript && document.currentScript.getAttribute) {
    if (document.currentScript.hasAttribute('dedupe-logs')) {
      wrapDupeLog("log");
      wrapDupeLog("warn");
      wrapDupeLog("error");
      wrapDupeLog("info");
    }
  }

  window.addEventListener(
    "load",
    () => {
      deferred.forEach(args => render(...args));
      deferred.length = 0;
    },
    false
  );
})();
