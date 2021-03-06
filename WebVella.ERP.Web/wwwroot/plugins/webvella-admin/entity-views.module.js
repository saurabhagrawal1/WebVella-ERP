﻿/* entity-views.module.js */

/**
* @desc this module manages the entity views in the admin screen
*/

(function () {
    'use strict';

    angular
        .module('webvellaAdmin') //only gets the module, already initialized in the base.module of the plugin. The lack of dependency [] makes the difference.
        .config(config)
        .controller('WebVellaAdminEntityViewsController', controller)
	    .controller('CreateViewModalController', createViewModalController);

    // Configuration ///////////////////////////////////
    config.$inject = ['$stateProvider'];

    /* @ngInject */
    function config($stateProvider) {
        $stateProvider.state('webvella-admin-entity-views', {
            parent: 'webvella-admin-base',
            url: '/entities/:entityName/views', //  /desktop/areas after the parent state is prepended
            views: {
                "topnavView": {
                    controller: 'WebVellaAdminTopnavController',
                    templateUrl: '/plugins/webvella-admin/topnav.view.html?v=' + htmlCacheBreaker,
                    controllerAs: 'topnavData'
                },
                "sidebarView": {
                    controller: 'WebVellaAdminSidebarController',
                    templateUrl: '/plugins/webvella-admin/sidebar.view.html?v=' + htmlCacheBreaker,
                    controllerAs: 'sidebarData'
                },
                "contentView": {
                    controller: 'WebVellaAdminEntityViewsController',
                    templateUrl: '/plugins/webvella-admin/entity-views.view.html?v=' + htmlCacheBreaker,
                    controllerAs: 'contentData'
                }
            },
            resolve: {
            	checkedAccessPermission: checkAccessPermission,
                resolvedCurrentEntityMeta: resolveCurrentEntityMeta
            },
            data: {

            }
        });
    };


	// Resolve Function /////////////////////////
    checkAccessPermission.$inject = ['$q', '$log', 'resolvedCurrentUser', 'ngToast'];
	/* @ngInject */
    function checkAccessPermission($q, $log, resolvedCurrentUser, ngToast) {
    	$log.debug('webvellaAreas>entities> BEGIN check access permission ' + moment().format('HH:mm:ss SSSS'));
    	var defer = $q.defer();
    	var messageContent = '<span class="go-red">No access:</span> You do not have access to the <span class="go-red">Admin</span> area';
    	var accessPermission = false;
    	for (var i = 0; i < resolvedCurrentUser.roles.length; i++) {
    		if (resolvedCurrentUser.roles[i] == "bdc56420-caf0-4030-8a0e-d264938e0cda") {
    			accessPermission = true;
    		}
    	}

    	if (accessPermission) {
    		defer.resolve();
    	}
    	else {

    		ngToast.create({
    			className: 'error',
    			content: messageContent,
    			timeout: 7000
    		});
    		defer.reject("No access");
    	}

    	$log.debug('webvellaAreas>entities> BEGIN check access permission ' + moment().format('HH:mm:ss SSSS'));
    	return defer.promise;
    }

    resolveCurrentEntityMeta.$inject = ['$q', '$log', 'webvellaAdminService', '$stateParams', '$state', '$timeout'];
    /* @ngInject */
    function resolveCurrentEntityMeta($q, $log, webvellaAdminService, $stateParams, $state, $timeout) {
    	$log.debug('webvellaAdmin>entity-details> BEGIN state.resolved ' + moment().format('HH:mm:ss SSSS'));
        // Initialize
        var defer = $q.defer();

        // Process
        function successCallback(response) {
            if (response.object == null) {
                $timeout(function () {
                    alert("error in response!")
                }, 0);
            }
            else {
                defer.resolve(response.object);
            }
        }

        function errorCallback(response) {
            if (response.object == null) {
                $timeout(function () {
                    alert("error in response!")
                }, 0);
            }
            else {
            	defer.reject(response.message);
            }
        }

        webvellaAdminService.getEntityMeta($stateParams.entityName, successCallback, errorCallback);

        // Return
        $log.debug('webvellaAdmin>entity-details> END state.resolved ' + moment().format('HH:mm:ss SSSS'));
        return defer.promise;
    }
 
    // Controller ///////////////////////////////
    controller.$inject = ['$scope', '$log', '$rootScope', '$state', 'pageTitle', 'resolvedCurrentEntityMeta', '$uibModal'];

    /* @ngInject */
    function controller($scope, $log, $rootScope, $state, pageTitle, resolvedCurrentEntityMeta, $uibModal) {
    	$log.debug('webvellaAdmin>entity-details> START controller.exec ' + moment().format('HH:mm:ss SSSS'));
        /* jshint validthis:true */
        var contentData = this;
        contentData.entity = fastCopy(resolvedCurrentEntityMeta);
        contentData.views = fastCopy(resolvedCurrentEntityMeta.recordViews);
        if (contentData.views === null) {
        	contentData.views = [];
        }
        contentData.views.sort(function (a, b) {
        	if (a.name < b.name) return -1;
        	if (a.name > b.name) return 1;
        	return 0;
        });

        //Update page title
        contentData.pageTitle = "Entity Views | " + pageTitle;
        $rootScope.$emit("application-pageTitle-update", contentData.pageTitle);
        //Hide Sidemenu
        $rootScope.$emit("application-body-sidebar-menu-isVisible-update", false);
        $log.debug('rootScope>events> "application-body-sidebar-menu-isVisible-update" emitted ' + moment().format('HH:mm:ss SSSS'));
        $scope.$on("$destroy", function () {
            $rootScope.$emit("application-body-sidebar-menu-isVisible-update", true);
            $log.debug('rootScope>events> "application-body-sidebar-menu-isVisible-update" emitted ' + moment().format('HH:mm:ss SSSS'));
        });

    	//Create new view modal
        contentData.createView = function () {

        	var modalInstance = $uibModal.open({
        		animation: false,
        		templateUrl: 'createViewModal.html',
        		controller: 'CreateViewModalController',
        		controllerAs: "popupData",
        		size: "",
        		resolve: {
        			contentData: function () {
        				return contentData;
        			}
        		}
        	});

        }


        $log.debug('webvellaAdmin>entity-details> END controller.exec ' + moment().format('HH:mm:ss SSSS'));
    }


	//// Modal Controllers
    createViewModalController.$inject = ['$modalInstance', '$log', 'ngToast', '$timeout', '$state', '$location', 'contentData', 'webvellaAdminService', 'webvellaRootService'];

	/* @ngInject */
    function createViewModalController($modalInstance, $log, ngToast, $timeout, $state, $location, contentData, webvellaAdminService, webvellaRootService) {
    	$log.debug('webvellaAdmin>entities>createViewModalController> START controller.exec ' + moment().format('HH:mm:ss SSSS'));
    	/* jshint validthis:true */
    	var popupData = this;
    	popupData.modalInstance = $modalInstance;
    	popupData.view = webvellaAdminService.initView();
    	popupData.currentEntity = fastCopy(contentData.entity);

    	popupData.ok = function () {
    		webvellaAdminService.createEntityView(popupData.view, popupData.currentEntity.name, successCallback, errorCallback);
    	};

    	popupData.cancel = function () {
    		$modalInstance.dismiss('cancel');
    	};

    	/// Aux
    	function successCallback(response) {
    		ngToast.create({
    			className: 'success',
    			content: '<span class="go-green">Success:</span> '+ 'The view was successfully saved'
    		});
    		$modalInstance.close('success');
    		webvellaRootService.GoToState($state, $state.current.name, {});
    	}

    	function errorCallback(response) {
    		var location = $location;
    		//Process the response and generate the validation Messages
    		webvellaRootService.generateValidationMessages(response, popupData, popupData.entity, location);
    	}

    	$log.debug('webvellaAdmin>entities>createViewModalController> END controller.exec ' + moment().format('HH:mm:ss SSSS'));
    };




})();


