sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/f/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "../util/SortAndFilterHelper",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    Device,
    Filter,
    Fragment,
    fioriLibrary,
    Spreadsheet,
    exportLibrary,
    SortAndFilterHelper
  ) {
    "use strict";

    return Controller.extend("ap.materialsales.controller.Material", {
      onInit: function () {
        this._mViewSettingsDialogs = {};
        this.getOwnerComponent()
          .getRouter()
          .attachRouteMatched(this.onRouteMatched, this);
      },

      //routing to second app
      onNavToSales: function (oEvent) {
        this.getOwnerComponent().getRouter().navTo("sales");
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

      //export to csv
      onExport: function (oEvent) {
        let aCols, oRowBinding, oSettings, oSheet, oTable;

        oTable = this.getView().byId("materialTable");
        oRowBinding = oTable.getBinding("items");
        aCols = this.createColumnConfig();

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: oRowBinding,
          fileName: "Materials.xlsx",
          worker: false, // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      createColumnConfig: function () {
        let aCols = [];
        let EdmType = exportLibrary.EdmType;

        aCols.push({
          label: "Material number",
          property: ["Matnr"],
          type: EdmType.String,
        });

        aCols.push({
          label: "Description",
          type: EdmType.String,
          property: "Maktx",
          scale: 0,
        });

        aCols.push({
          label: "Group",
          type: EdmType.String,
          property: "Matkl",
          scale: 0,
        });

        aCols.push({
          label: "Type",
          type: EdmType.String,
          property: "Mtart",
          scale: 0,
        });

        aCols.push({
          label: "Industry",
          type: EdmType.String,
          property: "Mbrsh",
          scale: 0,
        });

        aCols.push({
          label: "Base UoM",
          type: EdmType.String,
          property: "Meins",
          scale: 0,
        });

        aCols.push({
          label: "Purchase UoM",
          type: EdmType.String,
          property: "Bstme",
          scale: 0,
        });

        return aCols;
      },

      //filtering V2
      handleFilterGo: function (oEvent) {
        SortAndFilterHelper.handleFilterBarGo(this, "materialTable");
      },
    });
  }
);
