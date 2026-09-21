api.controller = function($interval, $scope) {
  var c = this;

  c.callNext = function(spId) {
    c.server.get({
      action: 'call_next',
      service_point: spId
    }).then(function(response) {
      c.data = response.data;
    });
  };

  c.startService = function(tokenId) {
    c.server.get({
      action: 'start_service',
      token_id: tokenId
    }).then(function(response) {
      c.data = response.data;
    });
  };

  c.completeToken = function(tokenId) {
    c.server.get({
      action: 'complete',
      token_id: tokenId
    }).then(function(response) {
      c.data = response.data;
    });
  };

  c.noShow = function(tokenId) {
    c.server.get({
      action: 'no_show',
      token_id: tokenId
    }).then(function(response) {
      c.data = response.data;
    });
  };

  var refreshInterval = $interval(function() {
    c.server.get({}).then(function(response) {
      c.data = response.data;
    });
  }, 6000);

  $scope.$on('$destroy', function() {
    $interval.cancel(refreshInterval);
  });
};
