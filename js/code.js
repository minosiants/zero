"use strict";
const on = document.addEventListener;

const isId = (s) => s[0] === "#";
const id = (s) => isId(s) ? s.slice(1) : s;

const isFunc = (v) => typeof v === "function";

const $$ = (d) => {

    const element = (...s) => {
        const res = s.reduce( 
            (acc, cur) => 
         isId(cur) ? acc?.getElementById(id(cur)) : acc?.querySelector(cur)
    , d);
        console.log("element: ", res);
        console.log("s: ", s);
        return res;
    };
    const addEvent = (event) => (...args) => {
        if (args.length < 2 || !isFunc(args.at(-1))) {
            console.log(args);
            return;
        }
        const f = args.at(-1);
        const e = element(...args.slice(0, -1))?.addEventListener(event, f);
    };

    const hide = (...elements) => elements.forEach( (e) => e.style.display = 'none');
    const show = (...elements) => elements.forEach( (e) => e.style.display = 'block');
    const onClick = addEvent('click');
    const onInput = addEvent('input');
    const cssVar = (name) => getComputedStyle(d.documentElement).getPropertyValue(name);

    const setColor = (color, ...elements) => elements.forEach( (e) => e.style.color = color);

    const setBgColor = (color, ...elements) => elements.forEach( (e) => e.style.backgroundColor = color);

    return {
        doc: d,
        element: element,
        onClick: onClick,
        onInput: onInput,
        cssVar: cssVar,
        setColor: setColor,
        setBgColor: setBgColor,
        hide:hide,
        show:show
    };
}
;

const powerOf2 = ($) => {

    const cardId = "#powerOf2"

    const $answerInput = $.element(cardId, '.answer input');
    const $answerLine = $.element(cardId, '.answer .line');
    const $power = $.element(cardId, '.question .power');
    const $result = $.element(cardId, '.result span');
    const $reloadBtn = $.element(cardId, '.action .reload');
    const $submitBtn = $.element(cardId, '.action .submit');

    const errorColor = $.cssVar("--error-color-default");
    const okColor = $.cssVar("--ok-color-default");
    const mainColor = $.cssVar("--main-card-color-default");
    
    const power = () => Number($power.textContent);
   
    const random = (max=20) => Math.floor(Math.random() * max);
    
    const check = (answer, power) => {
        const v = 2 ** power;
        return [v, v === answer];
    }
    const showResult = (result) => {
        $result.textContent=result;
        //$.show($result);
    } 
    const showError = () => $.setBgColor(errorColor, $answerLine);
    const clearError = () => $.setBgColor(mainColor, $answerLine);
    const showSubmit = () => {
        $.hide($reloadBtn);
        $.show($submitBtn);
        
    };
    const showAnswerOk = () => 
        $.setBgColor(okColor, $answerLine);
    
    const showReload = () => {
        $.hide($submitBtn);
        $.show($reloadBtn);
    }
    
    const reload = (power) => {
        $power.textContent = power;
        $result.textContent='';
        $answerInput.value = '';
        clearError();
        showSubmit();
    }
    
    
    $.onInput(cardId, '.answer .line', (e) => clearError(e));
    
    
    $.onClick(cardId, "footer .action .submit", (e) => {
         e.stopPropagation();
        const answer = Number($answerInput.value);
        if ($answerInput.value === '' || isNaN(answer)) {
            showError();
        }
        const [result,isOk] = check(answer, power());
        if(!isOk) {
            showResult(result);
            showError();
            showReload();
            return;
        }
        showAnswerOk();
        showReload();
    });
    $.onClick(cardId, "footer .action .reload", (e) => {
         e.stopPropagation();
        reload(random(10));
    });

}
;

document.addEventListener("DOMContentLoaded", () => {
    const $ = $$(document);
    const $powerOf2 = powerOf2($);
}
);
