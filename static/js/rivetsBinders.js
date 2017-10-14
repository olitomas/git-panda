rivets.formatters.reverse = function(value) {
    return !value;
};

rivets.binders.show = function (el, value) {
    var attr = value ? '' : 'none !important';
    el.setAttribute('style', 'display:' + attr);

};

rivets.binders.hide = function (el, value) {
    var attr = value ? 'none!important' : '';
    el.setAttribute('style', 'display:' + attr);
};