"use strict";
const on = document.addEventListener;

const isId = (s) => s[0] === "#";
const id = (s) => (isId(s) ? s.slice(1) : s);

const isFunc = (v) => typeof v === "function";

const $$ = (d) => {
  const element = (...s) =>
    s.reduce(
      (acc, cur) =>
        isId(cur) ? acc?.getElementById(id(cur)) : acc?.querySelector(cur),
      d,
    );

  const addEvent =
    (event) =>
    (...args) => {
      if (args.length < 2 || !isFunc(args.at(-1))) {
        console.log(args);
        return;
      }
      const f = args.at(-1);
      const e = element(...args.slice(0, -1))?.addEventListener(event, f);
    };
  const hide = (...elements) =>
    elements.forEach((e) => {
      e.style.display = "none";
    });

  const show = (...elements) =>
    elements.forEach((e) => (e.style.display = "block"));

  const isShown = (e) => !!e.offsetParent && e.style.display !== "none";
  const toggelShow = (...elements) => {
    elements.forEach((e) => (isShown(e) ? hide(e) : show(e)));
  };

  const onClick = addEvent("click");
  const onInput = addEvent("input");
  const onEnter = (...args) => {
    const [s, f] = args;
    const a = [
      s,
      (e) => {
        if (e.key === "Enter") f(e);
      },
    ];
    addEvent("keydown")(...a);
  };
  const cssVar = (name) =>
    getComputedStyle(d.documentElement).getPropertyValue(name);

  const setColor = (color, ...elements) =>
    elements.forEach((e) => (e.style.color = color));

  const setBgColor = (color, ...elements) =>
    elements.forEach((e) => (e.style.backgroundColor = color));
  const setHeight = (height, ...elements) =>
    elements.forEach((e) => (e.style.height = height));
  const toggleHeight = (height, ...elements) =>
    elements.forEach((e) =>
      e.style.height === "" || e.style.height === "0px"
        ? setHeight(height, ...elements)
        : setHeight("0px", ...elements),
    );
  const hasClass = (clazz, e) =>
    e.className.split(" ").find((c) => c === clazz) !== undefined;

  const addClass = (clazz, ...elements) =>
    elements.forEach((e) => {
      if (!hasClass(clazz, e)) e.classList.add(clazz);
    });

  const removeClass = (clazz, ...elements) =>
    elements.forEach((e) => {
      if (hasClass(clazz, e)) e.classList.remove(clazz);
    });

  return {
    doc: d,
    element: element,
    onClick: onClick,
    onInput: onInput,
    onEnter: onEnter,
    cssVar: cssVar,
    setColor: setColor,
    setBgColor: setBgColor,
    hide: hide,
    show: show,
    toggelShow: toggelShow,
    setHeight: setHeight,
    toggleHeight: toggleHeight,
    addClass: addClass,
    removeClass: removeClass,
  };
};

const $card = ($, card) => {
  const cardId = card.id;
  const $answerInput = $.element(cardId, ".answer input");
  const $answerLine = $.element(cardId, ".answer .line");
  const $questionValue = $.element(cardId, ".question-value");
  const $result = $.element(cardId, ".result");
  const $resultValue = $.element(cardId, ".result-value");
  const $reloadBtn = $.element(cardId, ".action .reload");
  const $submitBtn = $.element(cardId, ".action .submit");
  const mainColor = $.cssVar("--main-card-color-default");

  const questionValue = () => $questonValue.textContent;

  const showResult = (result) => {
    const v = result
      .toString()
      .split("")
      .map((v) => `<span>${v}</span>`)
      .join("");
    $resultValue.innerHTML = v;
    $result.style.display = "flex";
  };

  const showError = () => {
    $.addClass("error", $answerInput, $answerLine);
  };
  const clearError = () => {
    $.removeClass("error", $answerInput, $answerLine);
  };

  const showSubmit = () => {
    $.hide($reloadBtn);
    $.show($submitBtn);
  };

  const showSuccess = () => {
    $.addClass("success", $answerInput, $answerLine);
  };
  const clearSuccess = () => {
    $.removeClass("success", $answerInput, $answerLine);
  };

  const showReload = () => {
    $.hide($submitBtn);
    $.show($reloadBtn);
  };

  const reload = (newValue) => {
    $questionValue.textContent = newValue;
    $resultValue.textContent = "";
    $result.style.display = "none";
    $answerInput.value = "";
    clearError();
    clearSuccess();
    showSubmit();
  };
  $.onInput(".answer .line", (e) => {
    clearError(e);
  });
  $.onEnter(".answer input", (e) => {
    $submitBtn.dispatchEvent(new Event("click"));
  });

  $.onClick(cardId, "footer .action .submit", (e) => {
    e.stopPropagation();
    const answer = $answerInput.value;
    if (answer === "" || !card.valid(answer)) {
      showError();
    }
    const [result, isOk] = card.check($questionValue.textContent, answer);
    if (!isOk) {
      showResult(result);
      showError();
      showReload();
      return;
    }
    showSuccess();
    showReload();
  });
  $.onClick(cardId, "footer .action .reload", (e) => {
    e.stopPropagation();
    reload(card.generate());
  });

  reload(card.generate());
};

const power = () => {
  const id = "#powerOf2";
  const check = (question, answer) => {
    const expected = 2 ** question;
    return [expected, expected === Number(answer)];
  };
  const valid = (value) => {
    const answer = Number(value);
    return !isNaN(answer);
  };
  const generate = (max = 10) => Math.floor(Math.random() * max);

  return {
    id: id,
    valid: valid,
    check: check,
    generate: generate,
  };
};

const hexToBin = () => {
  const id = "#hex";
  const check = (question, answer) => {
    const q = Number.parseInt(question, 16);
    const a = Number.parseInt(answer, 2);
    return [Number(q).toString(2).padStart(8, "0"), q === a];
  };

  const valid = (value) => {
    const answer = Number(value);
    return !isNaN(answer);
  };
  const generate = (max = 256) => {
    const num = Math.floor(Math.random() * max);
    return num.toString(16);
  };

  return {
    id: id,
    valid: valid,
    check: check,
    generate: generate,
  };
};

const binToHex = () => {
  const id = "#bin";

  const check = (question, answer) => {
    const q = Number.parseInt(question, 2);
    const a = Number.parseInt(answer, 16);
    return [Number(q).toString(16).padStart(2, 0), q === a];
  };

  const valid = (value) => {
    const answer = Number(value);
    return !isNaN(answer);
  };
  const generate = (max = 256) => {
    const num = Math.floor(Math.random() * max);
    return num.toString(2).padStart(8, 0);
  };

  return {
    id: id,
    valid: valid,
    check: check,
    generate: generate,
  };
};

const decToBin = () => {
  const id = "#dec";
  const check = (question, answer) => {
    const q = Number.parseInt(question, 10);
    const a = Number.parseInt(answer, 2);
    return [Number(q).toString(2).padStart(8, "0"), q === a];
  };

  const valid = (value) => {
    const answer = Number(value);
    return !isNaN(answer);
  };
  const generate = (max = 256) => {
    const num = Math.floor(Math.random() * max);
    return num.toString(10);
  };

  return {
    id: id,
    valid: valid,
    check: check,
    generate: generate,
  };
};

const binToDec = () => {
  const id = "#bdec";
  const check = (question, answer) => {
    const q = Number.parseInt(question, 2);
    const a = Number.parseInt(answer, 10);
    return [Number(q).toString(10), q === a];
  };

  const valid = (value) => {
    const answer = Number(value);
    return !isNaN(answer);
  };
  const generate = (max = 256) => {
    const num = Math.floor(Math.random() * max);
    return num.toString(2).padStart(8, 0);
  };

  return {
    id: id,
    valid: valid,
    check: check,
    generate: generate,
  };
};

document.addEventListener("DOMContentLoaded", () => {
  const $ = $$(document);
  const pageId = $.element("body").id;
  $.onClick(".app-menu-hamburger-icon", () =>
    $.toggleHeight("100vh", $.element(".app-menu-slider")),
  );
  if (pageId === "power") $card($, power());
  else if (pageId === "hex") $card($, hexToBin());
  else if (pageId === "bin") $card($, binToHex());
  else if (pageId === "dec") $card($, decToBin());
  else if (pageId === "bdec") $card($, binToDec());
});
