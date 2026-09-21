# Flow 2 — Queue Recalculation

## Trigger
| Field | Value |
|---|---|
| Table | Token (`x_2126230_smartq_0_token`) |
| Trigger type | Record Updated |
| Condition | `Status` `is` `completed` |
| Run Trigger | Once |

## Action — Run Script
Calls the shared Script Include so the recalculation logic lives in exactly
one place, rather than being duplicated inside the flow.

```javascript
var utils = new x_2126230_smartq_0.SmartQQueueUtils();
utils.recalculateQueueAfterCompletion(<service_point_id_from_trigger_record>);
```

`service_point_id_from_trigger_record` is mapped from the Token Record →
Service Point pill (either directly in the script action's trigger data
reference, or via a mapped input variable depending on platform version).

## What it does
`recalculateQueueAfterCompletion()` re-saves every remaining `waiting` token
at that Service Point. Each `gr.update()` call re-triggers the
`Recalculate Full Queue` Business Rule for that token, shifting its
`position_in_queue` and `estimated_wait_minutes` down — this is what makes
the queue update system-wide, live, the instant one student is served.

## Status
Activated, tested by completing one token and confirming remaining
`waiting` tokens at the same Service Point shift position automatically.
