sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/f/library",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Device, Filter, Fragment, fioriLibrary) {
    "use strict";

    return Controller.extend("ap.materialsales.controller.Material", {
      onInit: function () {
        this._mViewSettingsDialogs = {};
        this.getOwnerComponent()
          .getRouter()
          .attachRouteMatched(this.onRouteMatched, this);
      },

      //routing to detail page

      //routing
      onRouteMatched: function (oEvent) {
        let oSettingsModel = this.getOwnerComponent().getModel("settings");
        oSettingsModel.setProperty("/RouteName", oEvent.getParameter("name")),
          oSettingsModel.setProperty(
            "/Material",
            oEvent.getParameter("arguments").customer
          );
      },
      onStateChanged: function (oEvent) {
        let oSettingsModel = this.getOwnerComponent().getModel("settings");
        let bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
          sLayout = oEvent.getParameter("layout");

        // Replace the URL with the new layout if a navigation arrow was used
        if (bIsNavigationArrow) {
          this.oRouter.navTo(
            oSettingsModel.getProperty("/RouteName"),
            {
              layout: sLayout,
              customer: oSettingsModel.getProperty("/Material"),
            },
            true
          );
        }
      },
      onExit: function () {
        this.getOwnerComponent()
          .getRouter()
          .detachRouteMatched(this.onRouteMatched, this);
      },
      onListItemPress: function (oEvent) {
        let sMaterialPath = oEvent.getSource().getBindingContext().getPath(),
          oSelectedMaterial = sMaterialPath.split("'")[1];
        this.getOwnerComponent().getRouter().navTo("detail", {
          layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
          material: oSelectedMaterial,
        });
      },

      //filtering
      handleFilterButtonPressed: function () {
        this.getViewSettingsDialog(
          "ap.materialsales.fragments.materialFilter"
        ).then(function (oViewSettingsDialog) {
          oViewSettingsDialog.open();
        });
      },
      handleFilterDialogConfirm: function (oEvent) {
        var oTable = this.byId("materialTable"),
          mParams = oEvent.getParameters(),
          oBinding = oTable.getBinding("items"),
          aFilters = [];

        mParams.filterItems.forEach(function (oItem) {
          let sPath = oItem.getParent().getKey(),
            sOperator = "EQ",
            sValue1 = oItem.getKey(),
            oFilter = new Filter(sPath, sOperator, sValue1);

          aFilters.push(oFilter);
        });

        // apply filter settings
        oBinding.filter(aFilters);
      },
      getViewSettingsDialog: function (sDialogFragmentName) {
        var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

        if (!pDialog) {
          pDialog = Fragment.load({
            id: this.getView().getId(),
            name: sDialogFragmentName,
            controller: this,
          }).then(function (oDialog) {
            if (Device.system.desktop) {
              oDialog.addStyleClass("sapUiSizeCompact");
            }
            return oDialog;
          });
          this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
        }
        return pDialog;
      },
    });
  }
);
