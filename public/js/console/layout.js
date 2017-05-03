$(function() {
    toastr.options = {
        closeButton: true,
        // progressBar: true,
        showMethod: 'slideDown',
        positionClass: "toast-top-full-width",
        timeOut: 2000
    };
});

/**
 * 是否只选中一个
 * @return {Boolean} [description]
 */
function isCheckOne(selector) {
    var checkedElems = $(selector + ':checked');
    if (checkedElems.length > 1) {
        toastr.error('', '只能选中一项');
        return false;
    } else if (checkedElems.length === 0) {
        toastr.error('', '应至少选中一项');
        return false;
    }
    return true;
}

/**
 * 是否选中至少一个
 * @param  {[type]}  selector [description]
 * @return {Boolean}          [description]
 */
function hasCheckOne(selector) {
    var checkedElems = $(selector + ':checked');
    if (checkedElems.length < 1) {
        toastr.error('', '至少需要选中一项');
        return false;
    }
    return true;
}

/**
 * 是否有data-id值
 * @param  {[type]}  element [description]
 * @return {Boolean}         [description]
 */
function hasDataId(element) {
    var id = $(element).data('id');
    if (!id) {
        toastr.error('此元素data-id不存在');
        return false;
    }
    return true;
}

/**
 * 获得data-id值
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
function getDataId(element) {
    var id = $(element).data('id');
    var $ele = $(element);
    if (hasDataId(element)) {
        return id;
    }
    return '';
}