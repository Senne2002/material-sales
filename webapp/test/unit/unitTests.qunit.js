/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ap/material_sales/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
