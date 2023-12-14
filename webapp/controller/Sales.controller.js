sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("ap.materialsales.controller.App", {
    onInit: function () {},

    //routing to materials app
    onNavToMaterials: function (oEvent) {
      this.getOwnerComponent().getRouter().navTo("master");
    },
  });
});