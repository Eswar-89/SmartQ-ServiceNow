(function() {
    data.servicePoints = [];
    data.myToken = null;
    data.hasActiveToken = false;
    data.error = '';

    var userId = gs.getUserID();

    // Handle actions posted from the client (join queue / cancel token)
    if (input && input.action) {

        if (input.action === 'join') {
            var spId = input.service_point;
            var entryType = input.entry_type || 'walkin';

            // Prevent a student from holding two ACTIVE tokens at once
            var existing = new GlideRecord('x_2126230_smartq_0_token');
            existing.addQuery('student', userId);
            existing.addQuery('status', 'IN', 'waiting,called,in_service');
            existing.query();

            if (existing.next()) {
                data.error = 'You already have an active token.';
            } else {
                var tokenGr = new GlideRecord('x_2126230_smartq_0_token');
                tokenGr.initialize();
                tokenGr.setValue('student', userId);
                tokenGr.setValue('service_point', spId);
                tokenGr.setValue('entry_type', entryType);
                tokenGr.setValue('status', 'waiting');
                if (entryType === 'reserved' && input.reserved_time) {
                    tokenGr.setValue('reserved_time', input.reserved_time);
                }
                tokenGr.insert();
            }
        }

        if (input.action === 'cancel') {
            var cancelGr = new GlideRecord('x_2126230_smartq_0_token');
            if (cancelGr.get(input.token_id) && cancelGr.getValue('student') == userId) {
                cancelGr.setValue('status', 'cancelled');
                cancelGr.update();
            }
        }
    }

    // Load active service points with live waiting counts
    var spGr = new GlideRecord('x_2126230_smartq_0_service_point');
    spGr.addQuery('active', 'true');
    spGr.query();
    while (spGr.next()) {
        var waitingCount = new GlideAggregate('x_2126230_smartq_0_token');
        waitingCount.addQuery('service_point', spGr.getUniqueValue());
        waitingCount.addQuery('status', 'waiting');
        waitingCount.addAggregate('COUNT');
        waitingCount.query();
        var count = 0;
        if (waitingCount.next()) {
            count = waitingCount.getAggregate('COUNT');
        }

        data.servicePoints.push({
            sys_id: spGr.getUniqueValue(),
            name: spGr.getValue('name'),
            location: spGr.getValue('location_building'),
            description: spGr.getValue('description'),
            hours_start: spGr.getValue('operating_hours_start'),
            hours_end: spGr.getValue('operating_hours_end'),
            waiting_count: count,
            avg_service_time: spGr.getValue('avg_service_time_min')
        });
    }

    // Check for an ACTIVE token first (this is what actually blocks joining)
    var activeGr = new GlideRecord('x_2126230_smartq_0_token');
    activeGr.addQuery('student', userId);
    activeGr.addQuery('status', 'IN', 'waiting,called,in_service');
    activeGr.orderByDesc('sys_created_on');
    activeGr.setLimit(1);
    activeGr.query();

    if (activeGr.next()) {
        data.hasActiveToken = true;
        data.myToken = {
            sys_id: activeGr.getUniqueValue(),
            number: activeGr.getValue('number'),
            status: activeGr.getValue('status'),
            position: activeGr.getValue('position_in_queue'),
            wait: activeGr.getValue('estimated_wait_minutes'),
            service_point: activeGr.service_point.getDisplayValue()
        };
    } else {
        // No active token — check for a completed-but-unrated one to show
        // as an informational banner only (does NOT block the grid)
        var completedGr = new GlideRecord('x_2126230_smartq_0_token');
        completedGr.addQuery('student', userId);
        completedGr.addQuery('status', 'completed');
        completedGr.orderByDesc('sys_created_on');
        completedGr.setLimit(1);
        completedGr.query();

        if (completedGr.next()) {
            var fbCheck = new GlideRecord('x_2126230_smartq_0_feedback');
            fbCheck.addQuery('token', completedGr.getUniqueValue());
            fbCheck.query();

            if (!fbCheck.hasNext()) {
                data.myToken = {
                    sys_id: completedGr.getUniqueValue(),
                    number: completedGr.getValue('number'),
                    status: 'completed',
                    position: 0,
                    wait: 0,
                    service_point: completedGr.service_point.getDisplayValue()
                };
            }
        }
    }
})();
