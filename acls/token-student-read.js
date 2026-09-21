/**
 * ACL: Read
 * Table: x_2126230_smartq_0_token
 * Role: x_2126230_smartq_0.student
 * Type: Advanced (scripted)
 *
 * Row-level restriction — students can only read their own token records,
 * never another student's queue position, status, or timestamps.
 */
answer = (current.student == gs.getUserID());
