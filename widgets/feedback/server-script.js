(function() {
    data.token = null;
    data.alreadySubmitted = false;
    data.submittedRating = null;

    var userId = gs.getUserID();

    // ---- Handle feedback submission ----
    if (input && input.action === 'submitFeedback') {

        // Guard: don't insert a duplicate if feedback already exists for this token
        var existingFb = new GlideRecord('x_2126230_smartq_0_feedback');
        existingFb.addQuery('token', input.token_id);
        existingFb.query();

        if (!existingFb.hasNext()) {
            var fbGr = new GlideRecord('x_2126230_smartq_0_feedback');
            fbGr.initialize();
            fbGr.setValue('token', input.token_id);
            fbGr.setValue('student', userId);
            fbGr.setValue('rating', input.rating);
            fbGr.setValue('comments', input.comments || '');
            fbGr.insert();
        }

        // Show the thank-you screen for the token just rated, then stop —
        // never fall through to the "find next token" logic below
        var justRatedGr = new GlideRecord('x_2126230_smartq_0_token');
        if (justRatedGr.get(input.token_id)) {
            data.token = {
                sys_id: justRatedGr.getUniqueValue(),
                number: justRatedGr.getValue('number'),
                service_point: justRatedGr.service_point.getDisplayValue()
            };
            data.alreadySubmitted = true;
            data.submittedRating = input.rating;
        }
        return;
    }

    // ---- Find this student's most recently completed token with no feedback yet ----
    var tokenGr = new GlideRecord('x_2126230_smartq_0_token');
    tokenGr.addQuery('student', userId);
    tokenGr.addQuery('status', 'completed');
    tokenGr.orderByDesc('service_completed_at');
    tokenGr.query();

    while (tokenGr.next()) {
        var fbCheck = new GlideRecord('x_2126230_smartq_0_feedback');
        fbCheck.addQuery('token', tokenGr.getUniqueValue());
        fbCheck.query();

        if (!fbCheck.hasNext()) {
            data.token = {
                sys_id: tokenGr.getUniqueValue(),
                number: tokenGr.getValue('number'),
                service_point: tokenGr.service_point.getDisplayValue()
            };
            break;
        }
    }
})();
