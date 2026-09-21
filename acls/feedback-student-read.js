/**
 * ACL: Read
 * Table: x_2126230_smartq_0_feedback
 * Role: x_2126230_smartq_0.student
 * Type: Advanced (scripted)
 *
 * Row-level restriction — students can only read their own feedback
 * records, never another student's ratings or comments.
 */
answer = (current.student == gs.getUserID());
