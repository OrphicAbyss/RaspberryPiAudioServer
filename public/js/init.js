"use strict";

const AudioApp = angular.module("AudioApp", ["angular-loading-bar"]);

// Code from: https://github.com/angular/angular.js/issues/6726#issuecomment-41274206
AudioApp.directive("range", function() {
    return {
        replace: true,
        restrict: "E",
        scope: {
            value: "=ngModel",
            min: "=rangeMin",
            max: "=rangeMax",
            step: "=rangeStep"
        },
        template: "<input type=\"range\"/>",
        link: function($scope, element, attrs) {
            $scope.$watch($scope.min, function() { setValue(); });
            $scope.$watch($scope.max, function() { setValue(); });
            $scope.$watch($scope.step, function() { setValue(); });
            $scope.$watch($scope.value, function() { setValue(); });

            function setValue() {
                if (
                    angular.isDefined($scope.min) &&
                    angular.isDefined($scope.max) &&
                    angular.isDefined($scope.step) &&
                    angular.isDefined($scope.value)
                ) {
                    element.attr("min", $scope.min);
                    element.attr("max", $scope.max);
                    element.attr("step", $scope.step);
                    element.val($scope.value);
                }
            }
            function read() {
                $scope.value = element.val();
            }

            element.on("change", function() {
                $scope.$apply(read);
            });
        }
    };
});

AudioApp.directive("fileChange", ["$timeout", function fileChange($timeout) {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            fileChange: "&"
        },
        link: function link($scope, element, attrs, ctrl) {
            element.on("change", onChange);

            $scope.$on("destroy", function () {
                element.off("change", onChange);
            });

            function onChange() {
                ctrl.$setViewValue(element[0].files[0]);
                $scope.fileChange();
            }

            $timeout(function () {
                $scope.fileChange();
            }, 250);
        }
    };
}]);

AudioApp.controller("AudioController", ["$scope", "$http", "$interval", function ($scope, $http, $interval) {
    $scope.statusTime = 1000;
    $scope.statusInterval = null;
    
    $scope.volume = null;
    $scope.setVolume = function (newVolume) {
        console.log("setVolume", newVolume, $scope.volume);
        $scope.volume = newVolume;
    };
    $scope.updateVolume = function (volume) {
        console.log("updateVolume", volume, $scope.volume);
        if (angular.isDefined(volume)) {
            console.log("updateVolume", volume, $scope.volume);
            $scope.callServer("volume", volume);
        }
    };

    $scope.position = {
        value: null,
        min: 0,
        max: null,
        step: 0.1,
        text: null
    };

    $scope.seekBar = angular.element("#seek-bar");
    $scope.seekBar.attr("min", 0);
    $scope.seekBar.attr("max", 100);
    $scope.seekBar.attr("step", 0.1);

    $scope.updatePosition = function (position) {
        $scope.callServer("seek", position);
    };
    
    function checkStatus () {
        $http({
            url: "/control/status",
            method: "post",
            data: {}
        }).then(function (reply) {
            const data = reply.data;
            if ($scope.volume !== data.volume) {
                $scope.setVolume(data.volume);
            }

            $scope.position.text = data.progress + " / " + data.duration;
            if ($scope.position.max != data.duration) {
                $scope.position.max = data.duration;
                $scope.seekBar.attr("max", data.duration);
            }
            // Don't update the slider if we are seeking
            if ($scope.position.value != data.progress) {
                $scope.position.value = data.progress;
            }
        }).catch(function (error) {
            Materialize.toast("Status check failed", 2500);
            console.log(error);
            $interval.cancel($scope.statusInterval);
            $scope.statusTime *= 2;
            $scope.statusInterval = $interval(checkStatus, $scope.statusTime);
        });
    }

    // Interval to check status
    $scope.statusInterval = $interval(checkStatus, $scope.statusTime);

    $scope.callServer = function (action, data) {
        if (!data) {
            data = {};
        }
        $http({
            url: "/control/" + action,
            method: "POST",
            data: data
        }).then(function (reply) {
            Materialize.toast(action + " done", 2500);

            // check the metadata after any function in case it's changed
            checkMetadata();
        }).catch(function (err) {
            Materialize.toast(action + " failed", 2500);
            console.log(err);
        });
    };

    function checkMetadata () {
        $http({
            url: "/control/metadata",
            method: "POST",
            data: ""
        }).then(function (reply) {
            $scope.metadata = reply.data;
            console.log($scope.metadata);
        }).catch(function (err) {
            Materialize.toast("Metadata check failed", 2500);
            console.log(err);
        });
    }

    checkMetadata();

    angular.element(".tooltipped").tooltip({delay: 50});
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    angular.element(".modal-trigger").leanModal({
            dismissible: true, // Modal can be dismissed by clicking outside of the modal
            opacity: .5, // Opacity of modal background
            in_duration: 300, // Transition in duration
            out_duration: 200, // Transition out duration
            ready: function() { // Callback for Modal open
            },
            complete: function() { // Callback for Modal close
            }
        }
    );
    angular.element(".button-collapse").sideNav();
}]);

AudioApp.controller("UploadController", ["$scope", "$http", function UploadController ($scope, $http) {
    console.log("Started upload controller");

    $scope.file = null;

    $scope.updateFileDetails = function () {
        console.log($scope.file);
    };

    $scope.submit = function () {
        const form = angular.element("#file-upload-form");

        var formData = new FormData(form[0]);
        $http({
            url: "/control/upload",
            method: "POST",
            data: formData,
            transformRequest: angular.identity,
            headers: {
                "Content-Type": undefined
            }
        }).then(function (data) {
            // console.log("completeHandler", arguments);
            Materialize.toast("File upload complete.", 4000);
        }).catch(function (error) {
            // console.log("errorHandler", arguments);
            Materialize.toast("Error uploading file.", 4000);
        });

        angular.element("#uploadModal").closeModal();
    };
}]);
