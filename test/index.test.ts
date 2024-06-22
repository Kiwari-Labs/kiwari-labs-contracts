import * as ERC20EXP from "./ERC20EXP/index.test";
import * as SortedCircularDoublyLinkedList from "./SortedCircularDoublyLinkedList/index.test";
// import * as SlidingWindow from "./SlidingWindow/index.test";

describe("Scenario", async function () {
  ERC20EXP.run();
  SortedCircularDoublyLinkedList.run();
  // SlidingWindow.run();
});
