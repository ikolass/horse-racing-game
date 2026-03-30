# 05-02 Summary

## Outcome

The Vuex layer and race-engine fairness logic now have deterministic Vitest coverage.

## What Changed

- Added `tests/unit/store/horses.spec.js`
- Added `tests/unit/store/schedule.spec.js`
- Added `tests/unit/store/results.spec.js`
- Added `tests/unit/store/race.spec.js`
- Added `tests/unit/utils/raceEngine.spec.js`

## Verification

- `npm run test -- tests/unit/store` passed
- `npm run test -- tests/unit/utils/raceEngine.spec.js` passed
- `npm run test` passed

## Notes

- The fairness spec uses the real weighted-random implementation and a wider synthetic condition spread to avoid threshold flakiness while still validating `TEST-02`.
