# Flow 1 — Token Status Change Notification

Flow Designer flows are visual/configuration objects, not plain script — this
file documents the exact configuration so it can be rebuilt from scratch.

## Trigger
| Field | Value |
|---|---|
| Table | Token (`x_2126230_smartq_0_token`) |
| Trigger type | Record Updated |
| Condition | `Status` `is` `called` |
| Run Trigger | Once |

## Action — Send Email
| Field | Value |
|---|---|
| Target Record | Token Record (from trigger pill) |
| Table | Token (auto-populated from Target Record) |
| To | Trigger → Token Record → Student (resolves to the user's email) |
| Subject | `Your turn is coming up — SmartQ` |
| Body | `Hi,` <br> `Your token {Token Record → Number} for {Token Record → Service Point} has been called.` <br> `Please proceed to the counter now.` <br> `- SmartQ` |

`{Token Record → Number}` and `{Token Record → Service Point}` are live data
pills dragged into the body, not static text — they resolve to the actual
token's values at send time.

## Status
Activated (Draft → Active toggle set), tested end-to-end by manually
transitioning a token to `called` and confirming email generation via the
`sys_email` log.
