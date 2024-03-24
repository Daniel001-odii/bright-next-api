const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const invoiceController = require("../controllers/invoiceController");

// get all user inoices...
router.get("/invoices", authMiddleware, invoiceController.getAllUserInvoices);

// create invoice...
// MIGHT NOT BE NEEDED THO...

// get invoice by id....
router.get("/invoices/:invoice_id", authMiddleware, invoiceController.getInvoiceById);

// delete invoice....
// might not be needed too..



module.exports = router;