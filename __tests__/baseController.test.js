// baseController.test.js

const baseController = require("../controllers/baseController");
const utilities = require("../utilities/");

// Mock the utilities module
jest.mock("../utilities");

function getMockReqRes() {
  const req = {};
  const res = {
    render: jest.fn(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe("baseController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("buildHome", () => {
    it("should render the index view with nav and title", async () => {
      // Arrange
      utilities.getNav.mockResolvedValue("mockNav");
      const { req, res } = getMockReqRes();

      // Act
      await baseController.buildHome(req, res);

      // Assert
      expect(utilities.getNav).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("index", {
        title: "Home",
        nav: "mockNav",
        errors: null,
      });
    });
  });

  describe("buildErrorCase", () => {
    it("should render the caseissues view with nav and title", async () => {
      // Arrange
      utilities.getNav.mockResolvedValue("mockNav");
      const { req, res, next } = getMockReqRes();

      // Act
      await baseController.buildErrorCase(req, res, next);

      // Assert
      expect(utilities.getNav).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("./caseissues", {
        title: "New Case",
        nav: "mockNav",
      });
    });
  });
});
