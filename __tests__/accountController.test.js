// accountController.test.js

const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const accountModel = require("../models/account_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Set up environment variable for testing
process.env.ACCESS_TOKEN_SECRET = "testsecret";
process.env.NODE_ENV = "development";

// Mock dependencies
jest.mock("../utilities/");
jest.mock("../models/account_model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// A helper to create mock req, res objects
function getMockReqRes() {
  const req = {
    body: {},
    flash: jest.fn(),
  };
  const res = {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe("Account Controller", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("buildLogin", () => {
    it("should render the login view with nav", async () => {
      // Arrange
      utilities.getNav.mockResolvedValue("navData");
      const { req, res, next } = getMockReqRes();

      // Act
      await accountController.buildLogin(req, res, next);

      // Assert
      expect(utilities.getNav).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("account/login", {
        title: "Login",
        nav: "navData",
        errors: null,
      });
    });
  });

  describe("buildLogged", () => {
    it("should render the account view with nav", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const { req, res, next } = getMockReqRes();
      await accountController.buildLogged(req, res, next);
      expect(utilities.getNav).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("account/", {
        title: "My account",
        nav: "navData",
        errors: null,
      });
    });
  });

  describe("buildRegister", () => {
    it("should render the registration view with nav", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const { req, res, next } = getMockReqRes();
      await accountController.buildRegister(req, res, next);
      expect(utilities.getNav).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("account/register", {
        title: "Register",
        nav: "navData",
        errors: null,
      });
    });
  });
  describe("accountLogin", () => {
    it("should render login view if account is not found", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const reqBody = {
        account_email: "notfound@example.com",
        account_password: "anypassword",
      };
      const { req, res } = getMockReqRes();
      req.body = reqBody;

      // Simulate no account found
      accountModel.getAccountByEmail = jest.fn().mockResolvedValue(null);

      await accountController.accountLogin(req, res);

      expect(accountModel.getAccountByEmail).toHaveBeenCalledWith("notfound@example.com");
      expect(req.flash).toHaveBeenCalledWith(
        "notice",
        "Please check your credentials and try again."
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("account/login", {
        title: "Login",
        nav: "navData",
        errors: null,
        account_email: "notfound@example.com",
      });
    });

    it("should log in the user when password matches", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const reqBody = {
        account_email: "user@example.com",
        account_password: "plaintext",
      };
      const { req, res } = getMockReqRes();
      req.body = reqBody;

      // Create fake account data with hashed password
      const fakeAccount = {
        account_id: 1,
        account_firstname: "Jane",
        account_lastname: "Doe",
        account_email: "user@example.com",
        account_password: "hashedpassword",
      };
      accountModel.getAccountByEmail = jest.fn().mockResolvedValue(fakeAccount);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("signedtoken");

      await accountController.accountLogin(req, res);

      // Verify password comparison and jwt sign
      expect(bcrypt.compare).toHaveBeenCalledWith("plaintext", "hashedpassword");
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          account_id: 1,
          account_firstname: "Jane",
          account_lastname: "Doe",
          account_email: "user@example.com",
        },
        "testsecret",
        { expiresIn: 3600 * 1000 }
      );
      // Verify cookie was set
      expect(res.cookie).toHaveBeenCalledWith("jwt", "signedtoken", { httpOnly: true, maxAge: 3600 * 1000 });
      expect(req.flash).toHaveBeenCalledWith("notice", "You are logged in");
      expect(res.redirect).toHaveBeenCalledWith("/account/");
    });

    it("should re-render login when password does not match", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const reqBody = {
        account_email: "user@example.com",
        account_password: "wrongpassword",
      };
      const { req, res } = getMockReqRes();
      req.body = reqBody;

      const fakeAccount = {
        account_id: 1,
        account_firstname: "Jane",
        account_lastname: "Doe",
        account_email: "user@example.com",
        account_password: "hashedpassword",
      };
      accountModel.getAccountByEmail = jest.fn().mockResolvedValue(fakeAccount);
      bcrypt.compare.mockResolvedValue(false);

      await accountController.accountLogin(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "hashedpassword");
      // Using flash and re-rendering login
      expect(req.flash).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("account/login", {
        title: "Login",
        nav: "navData",
        errors: null,
        account_email: "user@example.com",
      });
    });
  });

  describe("logout", () => {
    it("should clear the jwt cookie and redirect", async () => {
      const { req, res } = getMockReqRes();

      await accountController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("jwt");
      expect(req.flash).toHaveBeenCalledWith("notice", "You have been logged out.");
      expect(res.redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("renderUserInfoView", () => {
    it("should render the user information view", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const { req, res, next } = getMockReqRes();

      await accountController.renderUserInfoView(req, res, next);

      expect(utilities.getNav).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("management/user-information", {
        title: "User Information",
        nav: "navData",
        notice: req.flash("notice"),
        errors: null,
      });
    });
  });

  describe("processUpdateAccount", () => {
    it("should update account successfully and redirect to home", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const reqBody = {
        account_id: "1",
        account_firstname: "NewFirst",
        account_lastname: "NewLast",
        account_email: "new@example.com",
        account_password: "newpassword",
      };
      const { req, res, next } = getMockReqRes();
      req.body = reqBody;

      // Simulate password hashing and a successful update
      bcrypt.hash.mockResolvedValue("hashednewpassword");
      accountModel.updateAccount = jest.fn().mockResolvedValue(true);

      await accountController.processUpdateAccount(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
      expect(accountModel.updateAccount).toHaveBeenCalledWith(
        "1",
        "NewFirst",
        "NewLast",
        "new@example.com",
        "hashednewpassword"
      );
      expect(req.flash).toHaveBeenCalledWith("notice", "Your information was successfully updated.");
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should handle update failure", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const reqBody = {
        account_id: "1",
        account_firstname: "NewFirst",
        account_lastname: "NewLast",
        account_email: "new@example.com",
        account_password: "newpassword",
      };
      const { req, res, next } = getMockReqRes();
      req.body = reqBody;

      bcrypt.hash.mockResolvedValue("hashednewpassword");
      accountModel.updateAccount = jest.fn().mockResolvedValue(false);

      await accountController.processUpdateAccount(req, res, next);

      expect(req.flash).toHaveBeenCalledWith("notice", "Sorry, the update failed.");
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.render).toHaveBeenCalledWith("management/user-information", {
        title: "User Information",
        nav: "navData",
        account: reqBody,
        notice: req.flash("notice"),
        errors: null,
      });
    });

    it("should catch errors during update", async () => {
      utilities.getNav.mockResolvedValue("navData");
      const reqBody = {
        account_id: "1",
        account_firstname: "NewFirst",
        account_lastname: "NewLast",
        account_email: "new@example.com",
        account_password: "newpassword",
      };
      const { req, res, next } = getMockReqRes();
      req.body = reqBody;

      // Simulate error thrown by update
      bcrypt.hash.mockResolvedValue("hashednewpassword");
      accountModel.updateAccount = jest.fn().mockRejectedValue(new Error("update error"));

      await accountController.processUpdateAccount(req, res, next);

      expect(req.flash).toHaveBeenCalledWith("notice", "An error occurred while updating your information.");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith("management/user-information", {
        title: "User Information",
        nav: "navData",
        account: reqBody,
        notice: req.flash("notice"),
        errors: null,
      });
    });
  });
});
