import {TagReference} from "./tags.service";

export class TagsController {
    static $inject = ['$scope', 'TribeTagsService', 'TribeTagsConfigurer'];

    allLoaded: boolean = false;

    constructor(private $scope, private tagService, private tagConfigurer) {
        let _ = require('underscore');

        $scope.self = $scope; // this is weird right but then we reference with a dot and binding works cause angular doesn't copy it all
        $scope.availableTags = [];

        $scope.validationErrorMessage = tagConfigurer.validation.default.errorMessage();

        $scope.stringToTagReference = name => {
            const found = _.findWhere($scope.availableTags, {name: name});
            return found ? $scope.applyTaggingValidation(found) : this.createTag(name);
        };

        $scope.$on('tribe-tags:refresh', () => $scope.loadTagsProposals(''));

        $scope.loadTagsProposals = (query) => {
            if ($scope.$$pagingBusy) return;

            if (query !== $scope.$$pagingQuery) {
                $scope.$$pagingQuery = query;
                $scope.$$pagingState = undefined;
                this.allLoaded = false;
            }

            // we started our request (busy)
            $scope.$$pagingBusy = true;

            let params = {
                "pagingState": $scope.$$pagingState || undefined,
                "query": query || undefined,
                "size": 20
            };

            tagService.findTags(params).then((data) => {
                // total without excluded (filtred)
                const filtredTotal = data.total - ($scope.excludedNumber ? $scope.excludedNumber : 0);
                // change collection if data changed
                if (!this.allLoaded || $scope.$$total !== filtredTotal) {
                    let tagsFromServer = data.items.map(t => {
                        return new TagReference(t.id, t.name, {});
                    });

                    const previousArray = (($scope.availableTags && $scope.$$pagingState) || !tagsFromServer.length) ? $scope.availableTags : [];

                    // remove previous (new), union and sort
                    $scope.availableTags = tagConfigurer.sortFn(
                        _.union(previousArray, tagsFromServer)
                        .filter(tag => !!tag.id)
                    );

                    //Add tag if we didn't find it
                    const found = _.findWhere($scope.availableTags, {name: query});
                    if(query && !found) {
                        const newTag = this.createTag(query);
                        $scope.availableTags.unshift(newTag);
                    }

                    $scope.$$total = data.total;

                    // check if we already loaded all
                    this.allLoaded = this.isAllLoaded($scope.availableTags, data.total);
                    // count total for footer
                    $scope.$$total = filtredTotal;
                    // pagination
                    $scope.$$pagingState = data.pagingState || undefined;
                    // finish request
                    $scope.$$pagingBusy = false;
                }
            });
        }

        $scope.refreshDuplicateValidation = (selected) => {
            selected.forEach( tag => $scope.applyTaggingValidation(tag) )
        }
    }

    private createTag(name: string): TagReference {
        let tag:any = new TagReference(null, name, {});
        tag.isTag = true;
         // ui-select not allows duplicates, so we make tags unique
        this.makeTagUnique(tag);
        this.$scope.applyTaggingValidation(tag);

        return tag;
    }

    private makeTagUnique(tag: TagReference) {
        // as ui-select use angular.equals we have to add real field
        tag['uniqueField'] = Math.random() * Math.random();
        return tag;
    }

    private isAllLoaded(items: Array<any>, total: number): boolean {
      const loadedTags: number = items.reduce( (acc, item) => {
        return item['isTag'] ? acc : acc + 1;
      }, 0)

      return total === loadedTags;
    }
}
