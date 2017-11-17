/**
 * @ngdoc directive
 * @name tomitribe-tags.directive:tribeTags
 * @function
 *
 * @description
 * Represent an input allowing to bind multiple values.
 * If the directive has a form parent, will use the validation rules described in tags.validator.ts file
 *
 */
export class TagsDirective {
    restrict = 'E';
    replace = false;
    require = '?^form';
    template = require('./tags.view.pug');
    controller = 'TribeTagsController';
    scope = {
        ngModel: '=',
        position: '@?',
        fieldName: '@?'
    };
    link: ng.IDirectiveLinkFn = (scope: any, el: any, attrs: any, ctrl: any): void => {
        scope.form = ctrl;
        scope.fieldName = scope.fieldName || 'tags';
        scope.position = attrs.position || 'auto';
    };
}
