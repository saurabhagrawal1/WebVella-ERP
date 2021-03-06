/* some-name.module.js */

/**
* @desc just a sample controller code
*/

(function () {
    'use strict';

    angular
        .module('somePlugInOrModuleName', ['ui.router'])
        .config(config)
        .run(run)
        .controller('SomeNameController', controller);

    // Configuration ///////////////////////////////////
    config.$inject = ['$stateProvider'];

    /* @ngInject */
    function config($stateProvider) {
        $stateProvider.state('stateName', {
            url: '/',
            views: {
                "namedView": {
                    controller: 'SomeNameController',
                    templateUrl: 'module/name.view.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                resolvedSiteMeta: resolvingFunction
            }
        });
    };


    // Run //////////////////////////////////////
    run.$inject = ['$log'];

    /* @ngInject */
    function run($log) {
    	$log.debug('pluginName>moduleName> BEGIN module.run ' + moment().format('HH:mm:ss SSSS'));

    	$log.debug('pluginName>moduleName> END module.run ' + moment().format('HH:mm:ss SSSS'));
    };


    // Resolve Function /////////////////////////
    resolvingFunction.$inject = ['$q'];

    /* @ngInject */
    function resolvingFunction($q) {
    	$log.debug('pluginName>moduleName> BEGIN state.resolved ' + moment().format('HH:mm:ss SSSS'));
        // Initialize
        var defer = $q.defer();

        // Process
        function successCallback(response) {
            defer.resolve(response);
        }

        function errorCallback(response) {
        	defer.reject(response.message);
        }

        siteMetaService.getUpdateSiteMeta(successCallback, errorCallback);

        // Return
        $log.debug('pluginName>moduleName> END state.resolved ' + moment().format('HH:mm:ss SSSS'));
        return defer.promise;

    }


    // Controller ///////////////////////////////
    controller.$inject = ['$rootScope'];

    /* @ngInject */
    function controller($rootScope) {
    	$log.debug('pluginName>moduleName> BEGIN controller.exec ' + moment().format('HH:mm:ss SSSS'));
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'controller';

        activate();
        $log.debug('pluginName>moduleName> END controller.exec ' + moment().format('HH:mm:ss SSSS'));

        ///////////
        function activate() { }
    }

})();
