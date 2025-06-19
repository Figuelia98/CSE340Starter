// inventoryController.test.js

const invCont = require("../controllers/invController");
const utilities = require("../utilities/");
const invModel = require("../models/inventory-model");

jest.mock("../utilities");
jest.mock("../models/inventory-model");

function getMockReqRes() {
  const req = {
    params: {},
    body: {},
    flash: jest.fn(),
  };
  const res = {
    render: jest.fn(),
    redirect: jest.fn(),
    json: jest.fn(),
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe("Inventory Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("buildByClassificationId", () => {
    it("renders inventory by classification", async () => {
      const { req, res } = getMockReqRes();
      req.params.classificationId = "1";

      const mockData = [{ classification_name: "SUV" }];
      invModel.getInventoryByClassificationId.mockResolvedValue(mockData);
      utilities.buildClassificationGrid.mockResolvedValue("gridContent");
      utilities.getNav.mockResolvedValue("navContent");

      await invCont.buildByClassificationId(req, res);

      expect(invModel.getInventoryByClassificationId).toHaveBeenCalledWith("1");
      expect(utilities.buildClassificationGrid).toHaveBeenCalledWith(mockData);
      expect(res.render).toHaveBeenCalledWith("./inventory/classification", {
        title: "SUV vehicles",
        nav: "navContent",
        grid: "gridContent",
        errors: null,
      });
    });
  });

  describe("buildItemById", () => {
    it("renders inventory item details", async () => {
      const { req, res } = getMockReqRes();
      req.params.invId = "101";

      const mockItem = [{
        inv_year: 2022,
        inv_make: "Toyota",
        inv_model: "Rav4",
      }];
      invModel.getInventoryById.mockResolvedValue(mockItem);
      utilities.buildItem.mockResolvedValue("sectionContent");
      utilities.getNav.mockResolvedValue("navContent");

      await invCont.buildItemById(req, res);

      expect(invModel.getInventoryById).toHaveBeenCalledWith("101");
      expect(utilities.buildItem).toHaveBeenCalledWith(mockItem);
      expect(res.render).toHaveBeenCalledWith("./inventory/detail", {
        title: "2022 Toyota Rav4 vehicles",
        nav: "navContent",
        section: "sectionContent",
        errors: null,
      });
    });
  });

  describe("buildManagementView", () => {
    it("renders inventory management view", async () => {
      utilities.getNav.mockResolvedValue("navData");
      utilities.getSelectClassification.mockResolvedValue("classificationSelect");
      utilities.getInventoryManagementScript.mockReturnValue("scriptCode");

      const { req, res } = getMockReqRes();
      await invCont.buildManagementView(req, res);

      expect(res.render).toHaveBeenCalledWith("./management/management", {
        title: "Inventory Management",
        nav: "navData",
        classificationSelect: "classificationSelect",
        inventoryScript: "<script>scriptCode</script>",
        errors: null,
      });
    });
  });

  describe("getInventoryJSON", () => {
    it("returns inventory data as JSON", async () => {
      const { req, res, next } = getMockReqRes();
      req.params.classification_id = "2";

      const mockInvData = [{ inv_id: 10 }];
      invModel.getInventoryByClassificationId.mockResolvedValue(mockInvData);

      await invCont.getInventoryJSON(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockInvData);
    });

    it("calls next with error if no data", async () => {
      const { req, res, next } = getMockReqRes();
      req.params.classification_id = "3";

      invModel.getInventoryByClassificationId.mockResolvedValue([]);

      await invCont.getInventoryJSON(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error("No data returned"));
    });
  });

  describe("editInventoryView", () => {
    it("renders edit view with item data", async () => {
      const { req, res } = getMockReqRes();
      req.params.inv_id = "100";

      const itemData = {
        inv_id: 100,
        inv_make: "Ford",
        inv_model: "Escape",
        inv_year: 2021,
        inv_description: "Compact SUV",
        inv_image: "/images/ford-escape.jpg",
        inv_thumbnail: "/images/thumb-ford-escape.jpg",
        inv_price: 25000,
        inv_miles: 10000,
        inv_color: "Blue",
        classification_id: 2
      };

      invModel.getInventoryById.mockResolvedValue([itemData]);
      utilities.getNav.mockResolvedValue("navData");
      utilities.getSelectClassification.mockResolvedValue("classificationSelect");

      await invCont.editInventoryView(req, res);

      expect(res.render).toHaveBeenCalledWith("./inventory/update-inventory", expect.objectContaining({
        title: "Edit Ford Escape",
        nav: "navData",
        classificationSelect: "classificationSelect",
        inv_make: "Ford",
        inv_model: "Escape",
        inv_price: 25000,
      }));
    });
  });

  describe("updateInventory", () => {
    it("updates inventory and redirects on success", async () => {
      const { req, res } = getMockReqRes();
      req.body = {
        inv_id: 100,
        inv_make: "Ford",
        inv_model: "Escape",
        inv_description: "Updated Description",
        inv_image: "/img.jpg",
        inv_thumbnail: "/thumb.jpg",
        inv_price: 27000,
        inv_year: 2022,
        inv_miles: 12000,
        inv_color: "Black",
        classification_id: 3
      };

      const updatedResult = {
        inv_make: "Ford",
        inv_model: "Escape"
      };

      utilities.getNav.mockResolvedValue("navData");
      invModel.updateInventory.mockResolvedValue(updatedResult);

      await invCont.updateInventory(req, res);

      expect(invModel.updateInventory).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith("notice", "The Ford Escape was successfully updated.");
      expect(res.redirect).toHaveBeenCalledWith("/inv/management");
    });

    it("renders form with error if update fails", async () => {
      const { req, res } = getMockReqRes();
      req.body = {
        inv_id: 100,
        inv_make: "Ford",
        inv_model: "Escape",
        inv_description: "Updated Description",
        inv_image: "/img.jpg",
        inv_thumbnail: "/thumb.jpg",
        inv_price: 27000,
        inv_year: 2022,
        inv_miles: 12000,
        inv_color: "Black",
        classification_id: 3
      };

      invModel.updateInventory.mockResolvedValue(null);
      utilities.getNav.mockResolvedValue("navData");
      utilities.getSelectClassification.mockResolvedValue("classificationSelect");

      await invCont.updateInventory(req, res);

      expect(req.flash).toHaveBeenCalledWith("notice", "Sorry, the update failed.");
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.render).toHaveBeenCalledWith("./management/update-inventory", expect.objectContaining({
        title: "Edit Ford Escape",
        nav: "navData",
        classificationSelect: "classificationSelect",
        inv_make: "Ford",
        inv_model: "Escape",
      }));
    });
  });
});
