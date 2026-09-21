api.controller = function($interval, $scope) {
  var c = this;
  c.selectedSp = null;

  c.selectSp = function(spId) {
    c.selectedSp = spId;
  };

  c.joinQueue = function(spId, entryType) {
    c.server.get({
      action: 'join',
      service_point: spId,
      entry_type: entryType
    }).then(function(response) {
      c.data = response.data;
      c.selectedSp = null;
    });
  };

  c.cancelToken = function() {
    if (!c.data.myToken) return;
    c.server.get({
      action: 'cancel',
      token_id: c.data.myToken.sys_id
    }).then(function(response) {
      c.data = response.data;
    });
  };

  // Live refresh every 6 seconds so position/wait updates without a manual reload.
  // Skip the refresh while the user is mid-selection (card expanded to
  // "Join Now / Cancel"), so the card list doesn't reset under their cursor.
  var refreshInterval = $interval(function() {
    if (c.selectedSp) {
      return;
    }
    c.server.get({}).then(function(response) {
      c.data = response.data;
    });
  }, 6000);

  $scope.$on('$destroy', function() {
    $interval.cancel(refreshInterval);
  });
};
