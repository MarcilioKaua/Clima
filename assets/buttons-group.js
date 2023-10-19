function ButtonsGroup(t){this.buttons={},this._callbacks=[],this._setup(t),this._bindEvents(t),this.unselect=this.unselect.bind(this),this.onSelect=this.onSelect.bind(this)}ButtonsGroup.prototype._bindEvents=function(t){t.addEventListener("click",function(t){t.preventDefault();var s=t.target;s.classList.contains("tt-buttons-group__button")&&(s.disabled||(this.unselect(),s.classList.add("-active"),this._callbacks.forEach((function(t){t(s)}))))}.bind(this))},ButtonsGroup.prototype._setup=function(t){for(var s=t.children,o=0;o<s.length;o++){var n=s[o].getAttribute("data-id");this.buttons[n]=s[o]}},ButtonsGroup.prototype.unselect=function(){for(var t in this.buttons)this.buttons[t].classList.remove("-active")},ButtonsGroup.prototype.onSelect=function(t){var s=!0;this._callbacks.forEach((function(o){o===t&&(s=!1)})),s&&this._callbacks.push(t)},ButtonsGroup.prototype.disable=function(t){this.buttons[t].disabled=!0},ButtonsGroup.prototype.enable=function(t){this.buttons[t].disabled=!1},ButtonsGroup.prototype.select=function(t){this.buttons[t].classList.add("-active"),this.buttons[t].click()},ButtonsGroup.prototype.getActive=function(){for(var t in this.buttons){var s=this.buttons[t];if(s.classList.contains("-active"))return s}},window.ButtonsGroup=window.ButtonsGroup||ButtonsGroup;