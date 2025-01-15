"use strict";
const cart = require("../models/cart.model");
const book = require("../models/book.model")

exports.addNewCart = async (req, res) => {
  const id_user = req.body.id_user
  const cart_new = new cart({
    id_user: id_user,
    products: []
  });
  let cartsave;
  try {
    cartsave = await cart_new.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ data: cartsave });
}
exports.addToCart = async (req, res) => {
  if (
    (typeof req.body.id_user === "undefined" && typeof req.body.id === "undefined" ) ||
    typeof req.body.products === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user, products, id } = req.body;
  var cartFind;

  const availableProductsCanAddToCart = async (oldProducts, newProducts) => {
    let isChange = false
    const productChecked = []
    let availableProducts = await Promise.all(
      newProducts.map(async (item) => {
        const itemInOldProduct = oldProducts.find(item1 => item1._id === item._id && item1.is_package == item.is_package);
        let newCount = item.count
        if (itemInOldProduct) {
          newCount += itemInOldProduct.count
          productChecked.push(item._id + item.is_package.toString())
        }
        const book_item = await book.findById(item._id);
        if (newCount <= book_item.count) {
          isChange = true
          item.count = newCount;
          return item;
        }
        else if (itemInOldProduct) {
          return itemInOldProduct
        }
        return null;
      })
    );

    const remainingOldProducts = oldProducts
      .filter((item) => !productChecked.includes(item._id + item.is_package.toString()))
      .map((item) => item);

    availableProducts = [...availableProducts, ...remainingOldProducts].filter((item) => item !== null);
  
    return {products: availableProducts, isChange: isChange};
  };

  if (id_user) {
    try {
      cartFind = await cart.findOne({ id_user: id_user });
      const availableProducts = await availableProductsCanAddToCart(cartFind.products, products)
      cartFind.products = availableProducts.products
      try {
        await cartFind.save();
        res.status(200).json({ data: cartFind });
      } catch (err) {
        res.status(500).json({ msg: err });
        return;
      }
    } catch (err) {
      const availableProducts = await availableProductsCanAddToCart([], products)
      const cart_new = new cart({
        id_user: id_user,
        products: availableProducts.products
      });
      let cartsave;
      try {
        cartsave = await cart_new.save();
        res.status(200).json({ data: cartsave });
      } catch (err) {
        res.status(500).json({ msg: err });
        return;
      }
      return;
    }
  }
  else {
    try {
      cartFind = await cart.findById(id);
      const availableProducts = await availableProductsCanAddToCart(cartFind.products, products)
      if (!availableProducts.isChange) {
        res.status(200).json({ error: "Sản phẩm đã hết hàng!" })
      }
      else {
        cartFind.products = availableProducts.products
        try {
          await cartFind.save();
          res.status(200).json({ data: cartFind });
        } catch (err) {
          res.status(500).json({ msg: err });
          return;
        }
      }
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: err })
      return;
    }
  }
};
exports.getCartById = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  let result
  try {
    result = await cart.findById(req.params.id);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
    return;
  }
  if (result === null) {
    res.status(200).json({ error: "Không tìm thấy giỏ hàng!" })
    return;
  }
  res.status(200).json({ data: result })
};
exports.update = async (req, res) => {
  if (
    typeof req.body.id === "undefined" ||
    typeof req.body.product === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id, product } = req.body;
  var cartFind = null;
  try {
    cartFind = await cart.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).json({ msg: "not found" });
    return;
  }
  let index = cartFind.products.findIndex(
    element => element._id === product._id
  );
  if (index === -1) {
    res.status(404).json({ msg: "product not found in list" });
    return;
  }
  const book_item = await book.findById(product._id);
  if (product.count <= book_item.count) {
    cartFind.products[index].count = Number(product.count);
    try {
      await cartFind.save();
      res.status(200).json({ data: cartFind });
    } catch (err) {
      res.status(500).json({ msg: err });
      return;
    }
  }
  else {
    res.status(200).json({ error: "Sản phẩm đã hết hàng" });
  }
};
exports.delete = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  try {
    await cart.findByIdAndDelete(req.params.id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "success" });
};
exports.deleteProduct = async (req, res) => {
  if (
    typeof req.body.id === "undefined" ||
    typeof req.body.id_product === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id, id_product } = req.body;
  var cartFind = null;
  try {
    cartFind = await cart.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).json({ msg: "not found" });
    return;
  }
  let index = cartFind.products.findIndex(
    element => element._id === id_product
  );
  if (index === -1) {
    res.status(404).json({ msg: "product not found in list" });
    return;
  }
  cartFind.products.splice(index, 1)
  try {
    await cartFind.save();
    res.status(200).json({ data: cartFind });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
};