/**
 * ACL: Write
 * Table: x_2126230_smartq_0_token
 * Role: x_2126230_smartq_0.student
 * Type: Advanced (scripted)
 *
 * Scoped write permission enabling the student-facing Cancel button.
 * A student may only cancel their OWN token, and only while it is still
 * 'waiting' — not once it has been called or is in service. Enforced at
 * the ACL/data layer, not just in widget JavaScript, so it can't be
 * bypassed by calling the server API directly.
 */
answer = (current.student == gs.getUserID() && current.status == 'waiting');
