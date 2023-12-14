sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/f/library",
  ],
  function (BaseController, Device, Filter, Fragment, fioriLibrary) {
    "use strict";

    return BaseController.extend("ap.materialsales.controller.App", {
      onInit: function () {
        this._mViewSettingsDialogs = {};
        this.getOwnerComponent()
          .getRouter()
          .attachRouteMatched(this.onRouteMatched, this);
      },

      //routing to materials app
      onNavToMaterials: function (oEvent) {
        this.getOwnerComponent().getRouter().navTo("master");
      },

      formatTime: function (timeValue) {
        var timeInMilliseconds = timeValue.ms;
        var date = new Date(timeInMilliseconds);

        var formattedTimeUTC = date.toUTCString().split(" ")[4];

        return formattedTimeUTC;
      },

      //filtering
      handleFilterButtonPressed: function () {
        this.getViewSettingsDialog(
          "ap.materialsales.fragments.salesFilter"
        ).then(function (oViewSettingsDialog) {
          oViewSettingsDialog.open();
        });
      },
      handleFilterDialogConfirm: function (oEvent) {
        var oTable = this.byId("salesTable"),
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
      //routing to detail page

      //routing
      onRouteMatched: function (oEvent) {
        let oSettingsModel = this.getOwnerComponent().getModel("settings");
        oSettingsModel.setProperty("/RouteName", oEvent.getParameter("name")),
          oSettingsModel.setProperty(
            "/Sale",
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
              customer: oSettingsModel.getProperty("/Sale"),
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

        this.getOwnerComponent().getRouter().navTo("salesdetail", {
          layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
          sale: oSelectedMaterial,
        });
      },
    });
  }
);
