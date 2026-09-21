/**
 * Script Include: SmartQQueueUtils
 * Glide AJAX enabled: true
 * Client callable role restriction: x_2126230_smartq_0.student
 * Accessible from: This application scope only
 *
 * Centralized server-side queue utilities. getQueuePosition() and
 * getEstimatedWait() are called from portal widgets via GlideAjax for
 * live client-side lookups. recalculateQueueAfterCompletion() is
 * server-only, called from Flow 2 when a token is marked completed.
 */
var SmartQQueueUtils = Class.create();
SmartQQueueUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    // Callable from client via GlideAjax: returns this token's current queue position
    getQueuePosition: function() {
        var tokenId = this.getParameter('sysparm_token_id');
        var tokenGr = new GlideRecord('x_2126230_smartq_0_token');
        if (!tokenGr.get(tokenId)) {
            return '-1';
        }
        return tokenGr.getValue('position_in_queue') || '0';
    },

    // Callable from client: returns this token's current estimated wait in minutes
    getEstimatedWait: function() {
        var tokenId = this.getParameter('sysparm_token_id');
        var tokenGr = new GlideRecord('x_2126230_smartq_0_token');
        if (!tokenGr.get(tokenId)) {
            return '-1';
        }
        return tokenGr.getValue('estimated_wait_minutes') || '0';
    },

    // Server-side only — recalculates position/wait for every remaining
    // 'waiting' token at a service point, e.g. after one completes
    recalculateQueueAfterCompletion: function(servicePointId) {
        var gr = new GlideRecord('x_2126230_smartq_0_token');
        gr.addQuery('service_point', servicePointId);
        gr.addQuery('status', 'waiting');
        gr.orderBy('sys_created_on');
        gr.query();

        while (gr.next()) {
            gr.update(); // re-triggers the before-update Business Rule, which recalculates position/wait
        }
    },

    type: 'SmartQQueueUtils'
});
