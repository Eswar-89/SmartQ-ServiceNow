api.controller = function($scope, $interval) {
  var c = this;
  c.selectedRating = 0;
  c.comments = '';
  c.submitting = false;

  c.setRating = function(star) {
    c.selectedRating = star;
  };

  c.submitFeedback = function() {
    if (!c.selectedRating) {
      alert('Please select a star rating first.');
      return;
    }
    if (c.submitting) {
      return; // guard against double-click firing two requests
    }
    c.submitting = true;

    c.server.get({
      action: 'submitFeedback',
      token_id: c.data.token.sys_id,
      rating: c.selectedRating,
      comments: c.comments
    }).then(function(response) {
      c.data = response.data;
      c.submitting = false;
      c.selectedRating = 0;
      c.comments = '';
    }, function() {
      // request failed — reset so the student can retry
      c.submitting = false;
      alert('Something went wrong submitting your feedback. Please try again.');
    });
  };

  // Poll every 10s UNCONDITIONALLY — this both picks up a newly completed
  // token to rate, AND clears the "Thanks for your feedback" message on
  // its own once there's nothing left to rate (e.g. after the student
  // joins and completes a new queue).
  var pollInterval = $interval(function() {
    c.server.get({}).then(function(response) {
      c.data = response.data;
    });
  }, 10000);

  $scope.$on('$destroy', function() {
    $interval.cancel(pollInterval);
  });
};
