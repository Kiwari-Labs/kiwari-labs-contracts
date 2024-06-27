import * as ERC20EXP from "./ERC20EXP/index.test";
import * as LightWeightERC20EXP from "./LightWeightERC20EXP/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as LightWeightSortedCircularDoublyLinkedList from "./LightWeightSortedCircularDoublyLinkedList/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";
import * as SortedCircularDoublyLinkedList from "./SortedCircularDoublyLinkedList/index.test";

describe("Scenario", async function () {
  ERC20EXP.run();
  LightWeightERC20EXP.run();

  SlidingWindow.run();
  LightWeightSlidingWindow.run();

  SortedCircularDoublyLinkedList.run();
  LightWeightSortedCircularDoublyLinkedList.run();
});
