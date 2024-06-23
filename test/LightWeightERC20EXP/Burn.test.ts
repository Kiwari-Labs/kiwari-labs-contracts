export const run = async () => {
  describe("Burn", async function () {
    it("[HAPPY] correct burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] can burn only own token", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Burn From Wholesaler", async function () {
    it("[HAPPY] correct burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] burn from non-wholesaler", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] insufficient balance to burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Burn From Retailer", async function () {
    it("[HAPPY] correct burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] burn from non-retailer", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] insufficient balance to burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });
};
