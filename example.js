angular.module('webrtc+ajs', ['ui.bootstrap']);
var ProgressDemoCtrl = function ($scope) {
  
  $scope.max = 200;

  $scope.random = function() {
    var value = Math.floor((Math.random() * 100) + 1);
    var type;

    if (value < 25) {
      type = 'CHEEEEEESE';
    } else if (value < 50) {
      type = 'EEEEEEEEEEEEEEEEEEEEEEEEEEEE';
    } else if (value < 75) {
      type = 'Awwwwwwwwwwwwwwwwwwwwwwwwwwww';
    } else {
      type = 'Olalalalalalalalalalalalal!';
    }

   

    $scope.dynamic = value;
    $scope.type = type;
  };
  $scope.random();
  
  $scope.randomStacked = function() {
    $scope.stacked = [];
    var types = ['sad', 'info', 'warning', 'danger'];
    
    for (var i = 0, n = Math.floor((Math.random() * 4) + 1); i < n; i++) {
        var index = Math.floor((Math.random() * 4));
        $scope.stacked.push({
          value: Math.floor((Math.random() * 30) + 1),
          type: types[index]
        });
    }
  };
  $scope.randomStacked();
};