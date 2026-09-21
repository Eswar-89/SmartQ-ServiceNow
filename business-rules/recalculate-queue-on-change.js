/**
 * Business Rule: Recalculate Full Queue
 * Table: x_2126230_smartq_0_token
 * When: before insert, before update
 * Condition: current.status == 'waiting'
 *
 * Recalculates position_in_queue and estimated_wait_minutes for every
 * 'waiting' token at the same Service Point, ordered by creation time
 * (FIFO). Uses gr.setWorkflow(false) to prevent this update from
 * re-triggering itself (avoids infinite recursion).
 */
(function executeRule(current, previous) {

    var servicePointId = current.service_point.toString();
    if (!servicePointId) {
        return;
    }

    var avgServiceTime = 5;
    var spGr = new GlideRecord('x_2126230_smartq_0_service_point');
    if (spGr.get(servicePointId)) {
        avgServiceTime = spGr.getValue('avg_service_time_min') || 5;
    }

    var gr = new GlideRecord('x_2126230_smartq_0_token');
    gr.addQuery('service_point', servicePointId);
    gr.addQuery('status', 'waiting');
    gr.orderBy('sys_created_on');
    gr.query();

    var position = 1;
    while (gr.next()) {
        gr.setValue('position_in_queue', position);
        gr.setValue('estimated_wait_minutes', position * avgServiceTime);
        gr.setWorkflow(false);   // critical: prevents this update from re-triggering this same rule
        gr.autoSysFields(false); // keeps sys_updated_on from changing unnecessarily
        gr.update();
        position++;
    }

    gs.info('SmartQ DEBUG: Recalculated ' + (position - 1) + ' waiting token(s) at service_point=' + servicePointId);

})(current, previous);
