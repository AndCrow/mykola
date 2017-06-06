/**
 * @ngdoc directive
 * @name tomitribe-select.directive
 * @function
 *
 * @description
 * tribeActivateHover: Set option active, onmouseenter event, in ui-select
 * tribeSelectOpenOnFocus: this directive set the select active, on focus (tab)
 * tribeSelectPreventTab: this directive prevent tab selection
 *
 */
module tomitribe_select {
    let _ = require('underscore');

    angular
        .module('tomitribe-select', [])
        .directive('tribeActivateHover', ['$timeout', tribeActivateHover])
        .directive('tribeSelectOpenOnFocus', ['$timeout', tribeSelectOpenOnFocus])
        .directive('tribeSelectPreventTab', ['$timeout', tribeSelectPreventTab]);

    function tribeSelectPreventTab($timeout) {
        return {
            restrict: 'A',
            require: ['uiSelect', 'ngModel'],
            replace: false,
            link: link
        };

        function link(scope, element, attrs, crtl) {
            let uiSelectCtrl = crtl[0];

            if (crtl[0].searchInput) {
                let ngModelCtrl = crtl[1], singleSelectInitialIndex;

                crtl[0].searchInput.bindFirst('keydown', function (e) {
                    if (e.keyCode === 9) {
                        if (!scope.$select.multiple) {
                            scope.$select.activeIndex = singleSelectInitialIndex;
                        } else {
                            uiSelectCtrl.close();
                        }
                    }
                });

                scope.$on('uis:activate', ()=> {
                    $timeout(()=> {
                        if (!scope.$select.multiple) {
                            $timeout(()=> {
                                singleSelectInitialIndex = findIndex(ngModelCtrl.$viewValue, ngModelCtrl, uiSelectCtrl);
                            });
                        }
                    });
                });
            }
        }

        function findIndex (initial, ngModelCtrl, uiSelectCtrl) {
            if(!ngModelCtrl.$viewValue) {
                return -1;
            }

            if(initial.hasOwnProperty("id")) {
                return _.findIndex(uiSelectCtrl.items, {id: initial.id})
            } else {
                return _.indexOf(uiSelectCtrl.items, initial)
            }
        }
    }

    function tribeActivateHover($timeout) {
        return {
            restrict: 'A',
            replace: false,
            link: link
        };

        function link(scope, element, attrs, ctrl) {
            if (attrs.tribeActivateHover && scope.$parent[attrs.tribeActivateHover]) {
                element.on("mouseenter", ()=> {
                    $timeout(() => {
                        scope.$select.activeIndex = scope.$select.items.indexOf(scope.$parent[attrs.tribeActivateHover]);
                    });
                });
            }
        }
    }

    function tribeSelectOpenOnFocus($timeout) {
        return {
            require: 'uiSelect',
            replace: false,
            link: link
        };

        function link(scope, element, attrs, uiSelect) {
            var autoOpen = true;

            angular.element(uiSelect.focusInput).on('focus', ()=> {
                if (autoOpen) $timeout(()=> uiSelect.activate());
            });

            angular.element(uiSelect.focusInput).on('blur', ()=> {
                //On blur when we don't have element, we must force the uiSelect to close
                if (uiSelect.items && uiSelect.items.length === 0) uiSelect.close();
            });

            // Re-enable the auto open after the select element has been closed
            scope.$on('uis:close', ()=> {
                autoOpen = false;
                $timeout(()=> autoOpen = true);
            });

        }
    }

    $.fn.bindFirst = function (name, fn) {
        this.on(name, fn);
        this.each(function () {
            var handlers = $["_data"](this, 'events')[name.split('.')[0]];
            var handler = handlers.pop();
            handlers.splice(0, 0, handler);
        });
    };
}