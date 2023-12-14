sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("ap.materialsales.controller.App", {
    onInit: function () {
      let oRouter = this.getOwnerComponent().getRouter();
      oRouter
        .getRoute("master")
        .attachPatternMatched(this._onShipmentMatched, this);
      oRouter
        .getRoute("detail")
        .attachPatternMatched(this._onShipmentMatched, this);
    },
    _onShipmentMatched: function (oEvent) {
      let sMaterialID = oEvent.getParameter("arguments").material || "0";
      this.getView().bindElement({
        path: `/MaterialSet('${sMaterialID}')`,
        model: "",
      });

      this.getView()
        .byId("materialTable")
        .bindItems({
          path: `/MaterialSet('${sMaterialID}')/PLANTS`,
          template: this.getView().byId("materialTable").getBindingInfo("items")
            .template,
        });
    },

    onExit: function () {
      this.oRouter
        .getRoute("list")
        .detachPatternMatched(this._onDeliveryMatched, this);
      this.oRouter
        .getRoute("detail")
        .detachPatternMatched(this._onDeliveryMatched, this);
    },
  });
});
