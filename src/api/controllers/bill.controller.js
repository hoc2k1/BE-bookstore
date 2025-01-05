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
            await updateCountProducts({products: billFind.products, isCheckout: true});
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
          if(billFind.status == constants.billStatus.complete && billFind.status != status) {
            billFind.date_complete = new Date()
          }
          if(billFind.status == constants.billStatus.cancel && billFind.status != status) {
            billFind.status = status
            await updateCountProducts({products: billFind.products, isCheckout: true})
          }
          else {
            billFind.status = status
            if (status == constants.billStatus.cancel) {
              await updateCountProducts({products: billFind.products, isCheckout: false})
            }
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
