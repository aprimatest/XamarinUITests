angular.module('app', [
    'hmTouchEvents',
    'ui.router',
]).config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state({
        name: 'landing',
        url: '/',
        template: '<h3 id="landingHeader">Landing</h3>',
    }).state({
        name: 'pinchtozoom',
        url: '/pinchtozoom',
        template: '<h3 id="pinchToZoomHeader">Pinch To Zoom</h3>' +
                  '<ap-attachment-viewer id="ptzviewer" data-attachment-id="\'ptz\'"></ap-attachment-viewer>',
    });
}).run(function($rootScope) {
    $rootScope.addHttpError = angular.noop;
    $rootScope.removeHttpError = angular.noop;
});