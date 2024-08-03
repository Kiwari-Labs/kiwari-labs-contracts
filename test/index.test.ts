import * as ERC20EXPBase from "./ERC20EXPBase/index.test";
import * as LightWeightERC20EXPBase from "./LightWeightERC20EXPBase/index.test";
import * as ERC20EXPWhitelist from "./ERC20EXPWhitelist/index.test";
import * as LightWeightERC20EXPWhitelist from "./LightWeightERC20EXPWhitelist/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as LightWeightSortedCircularDoublyLinkedList from "./LightWeightSortedCircularDoublyLinkedList/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";
import * as SortedCircularDoublyLinkedList from "./SortedCircularDoublyLinkedList/index.test";

describe("Scenario", async function () {
  ERC20EXPBase.run();
  // LightWeightERC20EXPBase.run();

  // ERC20EXPWhitelist.run();
  // LightWeightERC20EXPWhitelist.run();

  // SlidingWindow.run();
  // LightWeightSlidingWindow.run();

  // SortedCircularDoublyLinkedList.run();
  // LightWeightSortedCircularDoublyLinkedList.run();
});
