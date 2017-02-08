angular.module('app')
    .directive('apImageViewer', ['$timeout', function ($timeout) {
        'use strict';

        return {
            restrict: 'E',
            replace: true,
            scope: {
                imageData: '=',
                currentPage: '=',
                pageCount: '=',
                loadPage: '&',
                disableFullscreen: '<?'
            },
            link: function (scope, element) {
                scope.isFullScreenMode = false;
                
                // We'll be updating the image element frequently, so let's cache it here.
                var imageElement = {
                    element: element.find('.image-display'),
                    // The initial x and y coordinates will hold the offset for the image before any drag or zoom events occur.  Once a touch event is released,
                    // these values will get updated with the new position, but during a drag, they won't be updated.
                    initialXCoordinate: 0,
                    initialYCoordinate: 0,
                    minOffsetX: 0,
                    maxOffsetX: 0,
                    minOffsetY: 0,
                    maxOffsetY: 0,
                    initScale: 1,
                    transform: {}
                };

                var fullscreenImageElement = {
                    element: element.find('.fullscreen-image-display'),
                    // The initial x and y coordinates will hold the offset for the image before any drag or zoom events occur.  Once a touch event is released,
                    // these values will get updated with the new position, but during a drag, they won't be updated.
                    initialXCoordinate: 0,
                    initialYCoordinate: 0,
                    minOffsetX: 0,
                    maxOffsetX: 0,
                    minOffsetY: 0,
                    maxOffsetY: 0,
                    initScale: 1,
                    transform: {}
                };

                scope.loadingImage = true;

                var imageDataWatch = scope.$watch('imageData', function () {
                    if (scope.imageData) {
                        scope.loadingImage = false;

                        if (scope.pageCount > 1) {
                            var footerHeight = element.find('.image-footer').height();

                            element.find('.image-container').css('padding-bottom', footerHeight);
                            element.find('.image-container').css('margin-bottom', -1 * footerHeight);
                        }

                        resetElement(imageElement);
                        resetElement(fullscreenImageElement);
                    }
                });

                function resetElement(element) {
                    element.element.className = 'animate';
                    element.initScale = 1;
                    element.initialXCoordinate = 0;
                    element.initialYCoordinate = 0;
                    element.transform = {
                        translate: { x: element.initialXCoordinate, y: element.initialYCoordinate },
                        scale: 1,
                    };
                    requestElementUpdate(element);
                }

                function updateElementTransform(element) {
                    var value = [
                        'translate3d(' + element.transform.translate.x + 'px, ' + element.transform.translate.y + 'px, 0)',
                        'scale(' + element.transform.scale + ', ' + element.transform.scale + ')'
                    ];

                    value = value.join(' ');
                    element.element.css('webkit-transform', value);
                    element.element.css('transform', value);
                    element.element.css('moz-transform', value);
                }

                function requestElementUpdate(element) {
                    updateElementTransform(element);
                }

                scope.onPinch = function (ev) {
                    pinch(imageElement, ev);
                };

                scope.onFsPinch = function (ev) {
                    pinch(fullscreenImageElement, ev);
                };

                function pinch(element, ev) {
                    element.element.className = '';

                    element.transform.scale = Math.max(element.initScale * ev.scale, 1);

                    requestElementUpdate(element);
                }

                scope.onRelease = function (ev) {
                    if (ev) {
                        release(imageElement);
                    }
                };
                
                scope.onFsRelease = function(ev){
                    if(ev){
                        release(fullscreenImageElement);
                    }
                };
                
                function release(element){
                    element.initScale = element.transform.scale;
                    element.initialXCoordinate = element.transform.translate.x;
                    element.initialYCoordinate = element.transform.translate.y;

                    element.minOffsetX = -1 * (element.element.width() * ((element.transform.scale - 1) / 2));
                    element.maxOffsetX = element.minOffsetX + (element.element.width() * (element.transform.scale - 1));
                    element.minOffsetY = -1 * (element.element.height() * ((element.transform.scale - 1) / 2));
                    element.maxOffsetY = element.minOffsetY + (element.element.height() * (element.transform.scale - 1));

                    snapToContainer(element);
                }

                function snapToContainer(element) {
                    element.transform.translate.x = element.initialXCoordinate = Math.min(Math.max(element.transform.translate.x, element.minOffsetX), element.maxOffsetX);
                    element.transform.translate.y = element.initialYCoordinate = Math.min(Math.max(element.transform.translate.y, element.minOffsetY), element.maxOffsetY);

                    requestElementUpdate(element);
                }

                scope.onTap = function () {
                    resetElement(imageElement);
                };
                
                scope.onFsTap = function(){
                    resetElement(fullscreenImageElement);
                };

                scope.moveToPage = function () {
                    scope.loadingImage = true;

                    scope.loadPage({ page: scope.currentPage });
                };

                function touchHandlerDummy(e) {
                    e.preventDefault();
                    return false;
                }

                imageElement.element.get(0).addEventListener('touchstart', touchHandlerDummy, false);
                imageElement.element.get(0).addEventListener('touchmove', touchHandlerDummy);
                imageElement.element.get(0).addEventListener('touchend', touchHandlerDummy);
                
                fullscreenImageElement.element.get(0).addEventListener('touchstart', touchHandlerDummy, false);
                fullscreenImageElement.element.get(0).addEventListener('touchmove', touchHandlerDummy);
                fullscreenImageElement.element.get(0).addEventListener('touchend', touchHandlerDummy);

                scope.onDrag = function (ev) {
                    drag(imageElement, ev);
                };
                
                scope.onFsDrag = function (ev){
                    drag(fullscreenImageElement, ev);
                };
                
                function drag(element, ev){
                    element.element.className = '';

                    var targetX = element.initialXCoordinate + ev.deltaX;
                    var targetY = element.initialYCoordinate + ev.deltaY;

                    element.transform.translate.x = targetX;
                    element.transform.translate.y = targetY;

                    requestElementUpdate(element);
                }
                
                scope.onSwipe = function(ev){
                    swipe(ev);
                };
                
                scope.onFsSwipe = function(ev){
                    swipe(ev);
                };
                
                function swipe(evt){
                    if(Math.abs(evt.deltaX) > Math.abs(evt.deltaY)){
                        if(evt.deltaX > 0 && scope.currentPage > 1){
                            scope.currentPage--;
                            scope.moveToPage();
                        }
                        else if(evt.deltaX < 0 && scope.currentPage < scope.pageCount){
                            scope.currentPage++;
                            scope.moveToPage();
                        }
                    }
                }

                scope.$on('$destroy', function () {
                    imageDataWatch();
                });
            },
            template:
'<div class="image-viewer">' +
'    <div class="row image-container" ng-cloak>' +
'        <div ng-show="!loadingImage" class="image-display-host" style="margin-bottom: -30px;">' +
'            <img class="image-display" ng-src="{{imageData}}" hm-options="{preventDefault: true, dragLockToAxis: true, dragBlockHorizontal: true}"' +
'                hm-pinch="onPinch" hm-doubletap="onTap()" hm-pinchend="onRelease" hm-panend="onRelease" hm-panmove="onDrag" hm-swipe="onSwipe" />' +
'            <div ng-show="!disableFullscreen" class="fullscreen-overlay" style="top: -30px;">' +
'                <i class="pull-right fa fa-arrows-alt" ng-click="isFullScreenMode = true;"></i>' +
'            </div>' +
'        </div>' +
'        <div ng-show="loadingImage" class="container image-loading-host">' +
'            <ap-spinner size="3"></ap-spinner>' +
'        </div>' +
'    </div>' +
'    <div class="text-center image-footer" ng-show="pageCount > 1">' +
'        <nav>' +
'            <uib-pagination total-items="pageCount"' +
'                      ng-model="currentPage"' +
'                      max-size="4"' +
'                      items-per-page="1"' +
'                      ng-change="moveToPage()"' +
'                      class="pagination-sm image-viewer-paginator"' +
'                      boundary-links="true">' +
'            </uib-pagination>' +
'        </nav>' +
'    </div>' +
'    <div ng-show="isFullScreenMode" class="fullscreen-image-viewer ng-hide">' +
'        <div class="fullscreen-overlay">' +
'            <i class="pull-right fa fa-times" ng-click="isFullScreenMode = false;"></i>' +
'        </div>' +
'        <img class="fullscreen-image-display" ng-hide="loadingImage" ng-src="{{imageData}}" hm-options="{preventDefault: true, dragLockToAxis: true, dragBlockHorizontal: true}"' +
'                hm-pinch="onFsPinch" hm-doubletap="onFsTap()" hm-pinchend="onFsRelease" hm-panend="onFsRelease" hm-panmove="onFsDrag" hm-swipe="onFsSwipe" />' +
'    </div>' +
'</div>',
        };
    }]
);
