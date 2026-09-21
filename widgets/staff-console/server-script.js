(function() {
    data.tokens = [];
    data.servicePoints = [];
    data.error = '';

    // Load service points for the filter dropdown
    var spGr = new GlideRecord('x_2126230_smartq_0_service_point');
    spGr.addQuery('active', 'true');
    spGr.query();
    while (spGr.next()) {
        data.servicePoints.push({
            sys_id: spGr.getUniqueValue(),
            name: spGr.getValue('name')
        });
    }

    // Handle staff actions
    if (input && input.action) {

        if (input.action === 'call_next') {
            var spId = input.service_point;

            var nextGr = new GlideRecord('x_2126230_smartq_0_token');
            nextGr.addQuery('service_point', spId);
            nextGr.addQuery('status', 'waiting');
            nextGr.orderBy('sys_created_on');
            nextGr.setLimit(1);
            nextGr.query();

            if (nextGr.next()) {
                nextGr.setValue('status', 'called');
                nextGr.setValue('called_at', new GlideDateTime());
                nextGr.update();
            } else {
                data.error = 'No students waiting at this service point.';
            }
        }

        if (input.action === 'start_service') {
            var startGr = new GlideRecord('x_2126230_smartq_0_token');
            if (startGr.get(input.token_id)) {
                startGr.setValue('status', 'in_service');
                startGr.setValue('service_started_at', new GlideDateTime());
                startGr.update();
            }
        }

        if (input.action === 'complete') {
            var compGr = new GlideRecord('x_2126230_smartq_0_token');
            if (compGr.get(input.token_id)) {
                compGr.setValue('status', 'completed');
                compGr.setValue('service_completed_at', new GlideDateTime());
                compGr.update(); // triggers "Recalculate Full Queue" automatically
            }
        }

        if (input.action === 'no_show') {
            var noShowGr = new GlideRecord('x_2126230_smartq_0_token');
            if (noShowGr.get(input.token_id)) {
                noShowGr.setValue('status', 'no_show');
                noShowGr.update();
            }
        }
    }

    // Load all active tokens (waiting, called, in_service) across all service points
    var tokenGr = new GlideRecord('x_2126230_smartq_0_token');
    tokenGr.addQuery('status', 'IN', 'waiting,called,in_service');
    tokenGr.orderBy('service_point');
    tokenGr.orderBy('sys_created_on');
    tokenGr.query();

    while (tokenGr.next()) {
        data.tokens.push({
            sys_id: tokenGr.getUniqueValue(),
            number: tokenGr.getValue('number'),
            student: tokenGr.student.getDisplayValue(),
            service_point: tokenGr.service_point.getDisplayValue(),
            service_point_id: tokenGr.getValue('service_point'),
            status: tokenGr.getValue('status'),
            position: tokenGr.getValue('position_in_queue'),
            wait: tokenGr.getValue('estimated_wait_minutes'),
            entry_type: tokenGr.getValue('entry_type')
        });
    }
})();
