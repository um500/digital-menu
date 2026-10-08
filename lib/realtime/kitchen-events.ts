// The kitchen board is just a filtered view of the same order stream the
// admin Live Orders page watches, so it rides the same channel rather than
// duplicating pub-sub plumbing.
export { publishOrderEvent as publishKitchenEvent, subscribeOrderEvents as subscribeKitchenEvents } from "./order-events";
