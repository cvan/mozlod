define(["application/EventManager"], function(event) {

    var refDiv = document.getElementById("loading_screen");

    var getElementById = function(id) {
        return document.getElementById(id);
    };


    var removeDivElement = function(div) {
        div.parentNode.removeChild(div);
    };

    var checkForStylePrefix = function(prefix) {
        if (refDiv.style[prefix] == "") return prefix;
    };

    var checkStylePrefixList = function(prefixes) {
        for (var i in prefixes) {
            var prefix = checkForStylePrefix(prefixes[i]);
            if (prefix) return prefix;
        }
    };

    var getTransformPrefix = function() {
        var prefixes = ["transform", "webkitTransform", "MozTransform", "msTransform", "OTransform"];
        return checkStylePrefixList(prefixes);
    };

    var getTransitionPrefix = function() {
        var prefixes = ["transition", "WebkitTransition", "MozTransition", "msTransition", "OTransition"];
        return checkStylePrefixList(prefixes);
    };

    var addElementClass = function(element, styleClass) {
        element.classList.add(styleClass);
    };

    var removeElementClass = function(element, styleClass) {
        element.classList.remove(styleClass);
    };

    var setElementClass = function(element, styleClass) {
    //    setTimeout(function() {
            element.className = styleClass; //  "game_base "+styleClass;
    //    }, 0);
    };

    var createDivElement = function(parentId, id, html, styleClass) {
        var parent = document.getElementById(parentId);
        var newdiv = createElement(parent, id, 'div', html, styleClass);
        return newdiv;
    };

    var createElement = function(parent, id, type, html, styleClass) {
        var index = parent.getElementsByTagName("*");
        var elem = document.createElement(type, [index]);
        elem.setAttribute('id', id);
        elem.className = styleClass; // "game_base "+styleClass;

        if (html) {
            setElementHtml(elem, html)
        }

        parent.appendChild(elem);
        return elem;
    };

    var setElementHtml = function(element, text) {
        setTimeout(function() {
            element.innerHTML = text;
        },1)
    };

    var applyElementTransform = function(element, transform, time) {
        if (!time) time = 0;
        var transformPrefix = getTransformPrefix();
        element.style[transformPrefix] = transform;
    };

    var setElementTransition = function(element, transition) {
        var transitionPrefix = getTransitionPrefix();
        element.style[transitionPrefix] = transition;
    };

    var removeElement = function(element) {
        removeElementChildren(element)
        removeDivElement(element);
    };

    var removeElementChildren = function(element) {
        if (element.childNodes )
        {
            while ( element.childNodes.length >= 1 )
            {
                element.removeChild(element.firstChild);
            }
        }
    };


    var addElementClickFunction = function(element, cFunc) {

        disableElementInteraction(element);
        element.interactionListeners = {};

        var inType = "click";
      /*
        if (touchListener.isTouch()) {
            inType = "touchClick";
            touchListener.registerClickableElement(element);
        }
      */

        element.interactionListeners[inType] = {clickFunc:cFunc, isEnabled:false};
        registerInputSoundElement(element, inType, "UI_HOVER", "UI_ACTIVE", "UI_CLICK", "UI_OUT");
        enableElementInteraction(element);
    };

    var registerInputSoundElement = function(element, inType, hover, active, click, out) {
        var hoverFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[hover]});
        };
        var pressFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[active]});
        };
        var outFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[out]});
        };

        var clickFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[click]});
        };

        var inputModels = {
            click:{
                mouseover:hoverFunc,
                mousedown:pressFunc,
                mouseout:outFunc,
                mousedown:pressFunc,
                mouseup:outFunc,
                click:clickFunc
            },
            touchClick:{
                touchstart:pressFunc,
                touchcancel:outFunc,
                touchClick:clickFunc
            }
        };

        element.soundInteractionListeners = inputModels[inType];

        element.soundInteractionListeners[inType] = clickFunc;

        for (index in element.soundInteractionListeners) {
            element.addEventListener(index, element.soundInteractionListeners[index], false)
        }
    };

    var disableElementInteraction = function(element) {

        element.style.pointerEvents = "none";
        element.style.cursor = "";

        for (index in element.soundInteractionListeners) {
            element.removeEventListener(index, element.soundInteractionListeners[index], null);
        }

        for (index in element.interactionListeners) {

            if (element.interactionListeners[index].isEnabled == true) {
                element.removeEventListener(index, element.interactionListeners[index].clickFunc, false);
                element.interactionListeners[index].isEnabled = false;
            }
        }
    };

    var enableElementInteraction = function(element) {
        element.style.pointerEvents = "";
        element.style.cursor = "pointer";

        for (index in element.soundInteractionListeners) {
            element.addEventListener(index, element.soundInteractionListeners[index], null);
        }

        for (index in element.interactionListeners) {
            if (element.interactionListeners[index].isEnabled == false) {
                element.addEventListener(index, element.interactionListeners[index].clickFunc, false);
                element.interactionListeners[index].isEnabled = true;
            }
        }
    };

    return {
        setElementTransition:setElementTransition,
        applyElementTransform:applyElementTransform,
        addElementClass:addElementClass,
        removeElementClass:removeElementClass,
        setElementClass:setElementClass,
        getElementById:getElementById,
        removeElement:removeElement,
        createDivElement:createDivElement,
        addElementClickFunction:addElementClickFunction,
        disableElementInteraction:disableElementInteraction,
        enableElementInteraction:enableElementInteraction,
        setElementHtml:setElementHtml
    }

});