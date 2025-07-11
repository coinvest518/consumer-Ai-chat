"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ApiError = exports.cn = void 0;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return tailwind_merge_1.twMerge(clsx_1.clsx(inputs));
}
exports.cn = cn;
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(message, details) {
        var _this = _super.call(this, message) || this;
        _this.name = "ApiError";
        _this.details = details;
        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(_this, ApiError.prototype);
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
