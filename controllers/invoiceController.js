// invoice controller...
const Invoice = require("../models/invoiceModel");

// Create a new invoice
exports.createInvoice = async (req, res) => {
    try {
        const user = req.userId;
        const purchase = req.body;
        const invoice = new Invoice({ user, purchase });
        await invoice.save();
        res.status(201).json({ message: "Invoice created successfully", invoice });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all invoices
exports.getAllUserInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.userId }).populate('courses');
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get a single invoice by ID
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update an existing invoice
exports.updateInvoice = async (req, res) => {
    try {
        const { user, purchase } = req.body;
        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, { user, purchase }, { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.status(200).json({ message: "Invoice updated successfully", invoice: updatedInvoice });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete an invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!deletedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};