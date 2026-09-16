# Reasoning

## 1. Reading the problem

The paper register is not only inconvenient. It fails at the moments when the lending desk needs reliable information:

1. A student asks whether a particular item is free.
2. Two clubs expect the same popular item.
3. The desk cannot tell who has a piece of equipment.
4. A borrower keeps an item past the agreed date.
5. A returned deposit is difficult to calculate consistently.

The first version therefore focuses on inventory, borrowing, availability and returns. Those are the core operations that make the paper process dependable. Deposits, fees and transfer rules sit directly on top of those operations.

## 2. Main user

The main user is the AV room desk manager. Students and clubs are the borrowers, but the person using this screen needs to scan the room quickly and take action without editing a register by hand.

That led to an operations dashboard rather than a marketing-style home page. The overview shows the current stock situation and the loans that need attention. The navigation then separates the repeated desk tasks into a gear library, active loans and returns.

## 3. Inventory decisions

Popular gear has multiple physical units, so an equipment type needs both `total` and `available` values. Showing only “available” would hide how much stock the room owns. Showing only “total” would not answer whether a request can be accepted.

A booking reduces `available`. A return increases it. The booking form creates quantity choices from the current value and rejects a quantity above that value. This prevents the most important paper-register mistake: accepting a request for equipment that is already promised to another club.

Search and category filtering are both included because they support different desk habits. A student usually knows the item name, while a desk manager may want to see all cameras or all audio equipment together.

## 4. Loan decisions

A loan stores the borrower, group, item, quantity, due date, deposit and status. The status examples are active, due today and overdue. Seed data includes all three so the evaluator can see the workflow immediately instead of waiting for the calendar to change.

The return date is required when a booking is created. The prototype uses a fixed demo date to make the examples predictable, but the date is still selected by the desk worker for each booking.

## 5. Return and deposit rules

The problem asks for a small daily fee but does not give an exact amount. I chose `$3` per day per unit and kept it visible in the return calculation.

The return process is deliberately a confirmation step. It shows the borrower, due date and deposit before changing the loan. The calculation is:

```text
deposit - (late days x $3 x quantity) = refund
```

The refund is capped at zero. Once confirmed, the loan is removed and its units become available again. Damage and lost equipment are outside the scope of this prototype because the problem only defines the late-fee path.

## 6. The transfer twist

The twist says an active loan can move from one borrower to another. This should not behave like a new booking or a return followed by another booking.

The transfer form changes only the borrower and club or department on the existing loan. It keeps the same loan ID, item, quantity, deposit, status and original due date. It also does not update the gear inventory because the equipment is still outside the room before and after the transfer.

Keeping one loan record is important. It prevents the system from showing duplicate equipment, accidentally increasing availability, or giving the new borrower a fresh due date. The confirmation message also repeats the unchanged due date so the desk has a clear reminder that the handover does not extend the loan.

## 7. Scope and trade-offs

The app uses local React state and seeded data so the complete workflow can be demonstrated quickly in the timed environment. This keeps setup small and avoids making a database appear to work when it has not been implemented.

The trade-off is that a browser refresh resets the data. The current prototype also does not send reminders, authenticate desk staff, keep an audit history or enforce a server-side maximum number of loans per borrower. Those features belong behind an API and database in a production version.

For the current scope, the most important consistency rules are enforced in the UI:

- a booking cannot exceed available units;
- a transfer does not alter availability;
- a transfer keeps the original due date;
- a return restores inventory;
- a late fee is deducted from the refundable deposit.

## 8. Why this order

The order follows the brief. First the desk needs a trustworthy answer about what is available. Then it needs a reliable booking and loan record. After that, returns, deposits and transfers can update the same record without creating conflicts.

This gives the project a useful base for future work: persistence, reminders, borrower limits and reporting can be added without changing the basic meaning of a gear unit or an active loan.
