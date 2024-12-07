'use strict'
const bill = require('../models/bill.model');
const book = require("../models/book.model");

exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bills = await bill.find({});
    const productSales = {};
    bills.forEach((bill) => {
      bill.products.forEach((product) => {
        if (!productSales[product._id]) {
          productSales[product._id] = {
            name: product.name,
            totalSold: 0,
            price: product.price,
            id_category: product.id_category,
            img: product.img,
          };
        }
        productSales[product._id].totalSold += product.count;
      });
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    res.status(200).json({ bestSellers });
  } catch (error) {
    console.error("Error fetching best-seller products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getNewBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const newBooks = await book.find({})
      .sort({ release_date: -1 })
      .limit(limit);
    if (!newBooks.length) {
      return res.status(404).json({ message: "No new products found." });
    }

    res.status(200).json({ newBooks });
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};