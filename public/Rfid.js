var rfidApp = angular.module('rfidApp', []);

rfidApp.controller('Ctrl', function($scope, $http) {
    $scope.rfidKey = '';
    $scope.users = [];
    $scope.usersAtWork = [];
    $scope.history = [];
    $scope.username = '';
    $scope.view = 'main';

    $scope.focusInput = function(event) {
        $('.readInput').focus();
    };
    $scope.focusInput();

    $scope.getAllUsers = function() {
        $http.get('/users').success(function(data) {
            $scope.users = data;
        });
    };

    $scope.getUsersAtWork = function() {
        $http.get('/users/in').success(function(data) {
            $scope.usersAtWork = data;
        });
    };

    $scope.getHistory = function() {
        $http.get('/history').success(function(data) {
            $scope.history = data;
        });
    };

    var timeout;
    $scope.listen = function(rfidKey) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(function() {
            $http.get('/checkId/' + rfidKey).success(function(data) {
                if (data == 'No user') {
                    $scope.view = 'newUser';
                    $('.usernameInput').focus();
                }
                else {
                    $scope.rfidKey = '';
                    $scope.getHistory();
                    $scope.getUsersAtWork();
                }
            });
        },500);
    };

    $scope.saveUser = function(username, rfidKey) {
        var obj = {
            rfidKey: rfidKey,
            username: username
        };

        $http.post('/newUser', angular.toJson(obj)).success(function(data) {
            $scope.view = 'main';
            $scope.rfidKey = '';
            $scope.username = '';
            $scope.getAllUsers();
        });
    };

    $scope.getAllUsers();
    $scope.getUsersAtWork();
    $scope.getHistory();
});
