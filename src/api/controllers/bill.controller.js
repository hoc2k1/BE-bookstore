"use strict";
const bill = require("../models/bill.model");
const book = require("../models/book.model");
const constants = require("../../contants")

const checkAvailableProducts = async (products) => {
  let check = true
  await Promise.all(
    products.map(async (item) => {
      const book_item = await book.findById(item._id);
      if (item.count > book_item.count) {
        check = false
      }
    })
  );

  return check
}

const updateCountProducts = async ({products, isCheckout}) => {
  await Promise.all(
    products.map(async (item) => {
      const book_item = await book.findById(item._id);
      book_item.count = isCheckout ? (book_item.count - item.count) : (book_item.count + item.count)
      await book_item.save()
    })
  );
}

exports.findBillById = async (req, res) => {
  if (
    typeof req.params.id === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  var billFind = null;
  try {
    billFind = await bill.findById(req.params.id);
    if (billFind) {
      res.status(200).json({ data: billFind });
      return
    }
    else {
      res.status(500).json({ msg: 'Không tìm thấy đơn hàng' });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
}

exports.findBillOrAddBill = async (req, res) => {
  if (
    typeof req.body.id_user === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  const { id_user, products, total, subtotal, discount, status } = req.body;
  var billFind = null;
  try {
    billFind = await bill.findOne({ id_user: id_user, status: constants.billStatus.pending });
    if (products) {
      const checkCanOrder = await checkAvailableProducts(products)
      if (checkCanOrder) {
        billFind.products = products;
        billFind.total = total;
        billFind.subtotal = subtotal;
        billFind.discount = discount;
        try {
          await billFind.save()
          res.status(200).json({ data: billFind });
          return
        } catch (err) {
          res.status(500).json({ msg: err });
          return;
        }
      }
      else {
        res.status(200).json({ error: 'Sản phẩm đã hết hàng' });
        return
      }
    }
    else {
      res.status(200).json({ data: billFind });
    }
  } catch (err) {
    const checkCanOrder = await checkAvailableProducts(products)
    if (checkCanOrder) {
      const new_bill = new bill({
        id_user: id_user,
        products: products,
        payment_method : constants.paymentMethod.cod,
        total: total,
        status: status,
        subtotal: subtotal,
        discount: discount
      });
      try {
        await new_bill.save()
        res.status(200).json({ data: new_bill });
        return
      } catch (err) {
        res.status(500).json({ msg: err });
        return;
      }
    }
    else {
      res.status(200).json({ error: 'Sản phẩm đã hết hàng!' });
    }
  }
}
exports.checkout = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let billFind = null;
  try {
    billFind = await bill.findById(req.params.id);
    if (billFind) {
      if (billFind.payment_method && billFind.address && billFind.phone && billFind.name) {
        const checkCanOrder = await checkAvailableProducts(billFind.products)
        if (checkCanOrder) {
          try {
            billFind.status = constants.billStatus.wait_accept
            billFind.date_create = new Date()
            await updateCountProducts({products: billFind.products});
            await billFind.save()
            res.status(200).json({data: billFind})
          }
          catch (err) {
            res.status(500).json({ msg: err });
            return;
          }
        }
        else {
          res.status(200).json({ error: "Sản phẩm đã hết hàng!" })
        }
      }
      else {
        res.status(200).json({ error: "Cần chọn đủ địa chỉ và phương thức thanh toán!" })
      }
    }
    else {
      res.status(500).json({ msg: 'Không tìm thấy đơn hàng' });
    }
  }
  catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
}

exports.updateBill = async (req, res) => {
  if (typeof req.body.id === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let billFind = null;
  const { id, payment_method, address, phone, status, name } = req.body
  try {
    billFind = await bill.findById(id);
    if (billFind) {
      try {
        if (payment_method) {
          billFind.payment_method = payment_method
        }
        if (address) {
          billFind.address = address
        }
        if (phone) {
          billFind.phone = phone
        }
        if (name) {
          billFind.name = name
        }
        if (status) {
          billFind.status = status
          if (status == constants.billStatus.cancel) {
            await updateCountProducts({products: billFind.products, isCheckout: false})
          }
        }
        await billFind.save()
        res.status(200).json({data: billFind})
      }
      catch (err) {
        res.status(500).json({ msg: err });
        return;
      }
    }
    else {
      res.status(500).json({ msg: 'Không tìm thấy đơn hàng' });
    }
  }
  catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
}

exports.getBillByIDUser = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let billFind = null;
  try {
    billFind = await bill
      .find({ 
        id_user: req.params.id_user,
        status: { $ne: constants.billStatus.pending }
      })
      .sort({ date_create: -1 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }

  res.status(200).json({ data: billFind });
};

exports.statisticalTop10 = async (req, res) => {
  let billFind = null;
  try {
    billFind = await bill.find({ issend: "1" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  let arr = [];
  let len = billFind.length;
  for (let i = 0; i < len; i++) {
    let lenP = billFind[i].products.length;
    for (let j = 0; j < lenP; j++) {
      let index = arr.findIndex(
        (element) => billFind[i].products[j]._id === element._id
      );
      if (index === -1) {
        arr.push(billFind[i].products[j]);
      } else {
        arr[index].count += Number(billFind[i].products[j].count);
      }
    }
  }
  arr.sort(function (a, b) {
    return b.count - a.count;
  });
  res.status(200).json({ data: arr.length > 10 ? arr.slice(0, 10) : arr });
};
exports.statisticaRevenueDay = async (req, res) => {
  if (
    typeof req.body.day === "undefined" ||
    typeof req.body.month === "undefined" ||
    typeof req.body.year === "undefined"
  ) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { day, month, year } = req.body;
  let billFind = null;
  try {
    billFind = await bill.find({
      date_create: {
        $gte: new Date(year, month - 1, day),
        $lt: new Date(year, month - 1, parseInt(day) + 1),
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};
exports.statisticaRevenueMonth = async (req, res) => {
  if (
    typeof req.body.year === "undefined" ||
    typeof req.body.month === "undefined"
  ) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { month, year } = req.body;
  let billFind = null;
  try {
    billFind = await bill.find({
      date_create: {
        $gte: new Date(year, parseInt(month) - 1, 1),
        $lt: new Date(year, month, 1),
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};
exports.statisticaRevenueYear = async (req, res) => {
  if (typeof req.body.year === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { year } = req.body;
  let billFind = null;
  try {
    billFind = await bill.find({
      date_create: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};
exports.statisticaRevenueQuauter = async (req, res) => {
  if (
    typeof req.body.year === "undefined" ||
    typeof req.body.quauter === "undefined"
  ) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { year, quauter } = req.body;
  if (quauter < 1 || quauter > 4) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let start = 1,
    end = 4;
  if (parseInt(quauter) === 2) {
    start = 4;
    end = 7;
  }
  if (parseInt(quauter) === 3) {
    start = 7;
    end = 10;
  }
  if (parseInt(quauter) === 3) {
    start = 10;
    end = 13;
  }
  let billFind = null;
  try {
    billFind = await bill.find({
      date_create: {
        $gte: new Date(year, start - 1, 1),
        $lt: new Date(year, end - 1, 1),
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};
exports.getProcessing = async (req, res) => {
  let count = null;
  try {
    count = await bill.countDocuments({ issend: "0" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  let totalPage = parseInt((count - 1) / 9 + 1);
  let { page } = req.params;
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).json({ data: [], msg: "Invalid page", totalPage });
    return;
  }
  try {
    const docs = await bill
      .find({ issend: "0" })
      .skip(9 * (parseInt(page) - 1))
      .limit(9)

    res.status(200).json({ data: docs, totalPage });

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }

};
