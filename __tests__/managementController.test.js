const controller = require("../controllers/managementController");
const utilities = require("../utilities");
const managementModel = require("../models/management-model");
const invModel = require("../models/inventory-model");

jest.mock("../utilities");
jest.mock("../models/management-model");
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

describe("Management Controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("buildMangement should render management view", async () => {
    const { req, res } = getMockReqRes();
    utilities.getNav.mockResolvedValue("navData");
    await controller.buildMangement(req, res);
    expect(res.render).toHaveBeenCalledWith("management/management", {
      title: "Management",
      nav: "navData",
      errors: null,
    });
  });

  test("buildInventory should render inventory view with selection", async () => {
    const { req, res } = getMockReqRes();
    utilities.getNav.mockResolvedValue("navData");
    utilities.getSelectClassification.mockResolvedValue("selectHTML");
    await controller.buildInventory(req, res);
    expect(res.render).toHaveBeenCalledWith("management/inventory", {
      title: "Inventory",
      nav: "navData",
      selection: "selectHTML",
      errors: null,
    });
  });

  test("buildClassification should render classification view", async () => {
    const { req, res } = getMockReqRes();
    utilities.getNav.mockResolvedValue("navData");
    await controller.buildClassification(req, res);
    expect(res.render).toHaveBeenCalledWith("management/classification", {
      title: "Classification",
      nav: "navData",
      errors: null,
    });
  });

  test("addClassification success", async () => {
    const { req, res } = getMockReqRes();
    req.body = { classification_name: "Luxury" };
    managementModel.addClassification.mockResolvedValue({});

    utilities.getNav.mockResolvedValue("navData");

    await controller.addClassification(req, res);
    expect(req.flash).toHaveBeenCalledWith("notice", expect.stringContaining("successfully added"));
    expect(res.render).toHaveBeenCalledWith("management/management", expect.anything());
  });

  test("addClassification failure", async () => {
    const { req, res } = getMockReqRes();
    req.body = { classification_name: "Luxury" };
    managementModel.addClassification.mockResolvedValue("Error");
    utilities.getNav.mockResolvedValue("navData");

    await controller.addClassification(req, res);
    expect(res.render).toHaveBeenCalledWith("management/classification", expect.anything());
  });

  test("addInventory success", async () => {
    const { req, res } = getMockReqRes();
    req.body = {
      inv_make: "Honda",
      inv_model: "Civic",
      inv_year: "2023",
      inv_description: "Nice car",
      inv_image: "/img.jpg",
      inv_thumbnail: "/thumb.jpg",
      inv_price: "20000",
      inv_miles: "1000",
      inv_color: "Red",
      classification_id: "2",
    };
    managementModel.addVehicle.mockResolvedValue({});
    utilities.getNav.mockResolvedValue("navData");

    await controller.addInventory(req, res);
    expect(req.flash).toHaveBeenCalledWith("notice", expect.stringContaining("successfully added"));
    expect(res.render).toHaveBeenCalledWith("management/management", expect.anything());
  });

  test("addInventory failure", async () => {
    const { req, res } = getMockReqRes();
    req.body = { inv_make: "Honda", inv_model: "Civic" };
    managementModel.addVehicle.mockResolvedValue("Error");
    utilities.getNav.mockResolvedValue("navData");

    await controller.addInventory(req, res);
    expect(res.render).toHaveBeenCalledWith("management/inventory", expect.anything());
  });

  test("getInventoryJSON success", async () => {
    const { req, res, next } = getMockReqRes();
    req.params.classification_id = "1";
    invModel.getInventoryByClassificationId.mockResolvedValue([{ inv_id: 1 }]);

    await controller.getInventoryJSON(req, res, next);
    expect(res.json).toHaveBeenCalledWith([{ inv_id: 1 }]);
  });

  test("getInventoryJSON failure", async () => {
    const { req, res, next } = getMockReqRes();
    req.params.classification_id = "1";
    invModel.getInventoryByClassificationId.mockResolvedValue([]);

    await controller.getInventoryJSON(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("No data returned"));
  });

  test("editInventoryView renders edit view", async () => {
    const { req, res } = getMockReqRes();
    utilities.getNav.mockResolvedValue("navData");
    utilities.getSelectClassification.mockResolvedValue("classSelect");
    utilities.getSelectInventory.mockResolvedValue("invSelect");

    await controller.editInventoryView(req, res);
    expect(res.render).toHaveBeenCalledWith("./management/update-inventory", {
      title: "Update Inventory ",
      nav: "navData",
      classificationSelect: "classSelect",
      selectionInventory: "invSelect",
      errors: null,
    });
  });

  test("delInventoryView renders delete view", async () => {
    const { req, res } = getMockReqRes();
    utilities.getNav.mockResolvedValue("navData");
    utilities.getSelectInventory.mockResolvedValue("invSelect");

    await controller.delInventoryView(req, res);
    expect(res.render).toHaveBeenCalledWith("./management/delete-inventory", {
      title: "Delete Inventory ",
      nav: "navData",
      selectionInventory: "invSelect",
      errors: null,
    });
  });

  test("updateInventory success", async () => {
    const { req, res } = getMockReqRes();
    req.body = {
      inv_id: 1,
      inv_make: "Toyota",
      inv_model: "Corolla",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    };
    invModel.updateInventory.mockResolvedValue({ inv_make: "Toyota", inv_model: "Corolla" });
    utilities.getNav.mockResolvedValue("navData");

    await controller.updateInventory(req, res);
    expect(req.flash).toHaveBeenCalledWith("notice", expect.stringContaining("successfully updated"));
    expect(res.redirect).toHaveBeenCalledWith("/inv/management");
  });

  test("updateInventory failure", async () => {
    const { req, res } = getMockReqRes();
    req.body = {
      inv_id: 1,
      inv_make: "Toyota",
      inv_model: "Corolla",
      classification_id: "1"
    };
    invModel.updateInventory.mockResolvedValue(null);
    utilities.getNav.mockResolvedValue("navData");
    utilities.getSelectClassification.mockResolvedValue("select");

    await controller.updateInventory(req, res);
    expect(res.render).toHaveBeenCalledWith("./management/update-inventory", expect.objectContaining({
      title: expect.stringContaining("Edit Toyota Corolla")
    }));
  });

  test("processDeleteInventory success", async () => {
    const { req, res } = getMockReqRes();
    req.params.body = "1";
    invModel.deleteInventory.mockResolvedValue(true);

    await controller.processDeleteInventory(req, res);
    expect(req.flash).toHaveBeenCalledWith("notice", expect.stringContaining("successfully deleted"));
    expect(res.redirect).toHaveBeenCalledWith("/inv/management");
  });

  test("processDeleteInventory failure", async () => {
    const { req, res } = getMockReqRes();
    req.params.body = "1";
    invModel.deleteInventory.mockResolvedValue(false);

    await controller.processDeleteInventory(req, res);
    expect(req.flash).toHaveBeenCalledWith("notice", expect.stringContaining("failed"));
    expect(res.status).toHaveBeenCalledWith(501);
  });
});
