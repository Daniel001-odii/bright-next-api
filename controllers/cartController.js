
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const jwt = require('jsonwebtoken');


// Create
// Read
// Update
// Delete...


/*
**
USER CART CONTROLLERS
**
*/

exports.getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOneAndUpdate(
      { user: req.userId }, // Find cart for the user
      {}, // Empty update - we only want to find or create the cart
      { new: true, upsert: true } // Return the updated cart, and create if not found
    ).populate('courses');

    res.status(200).json({ cart });
  } catch (error) {
    console.log("Error getting user cart: ", error);
    res.status(500).json({ message: "Error fetching user cart" });
  }
}



exports.addCourseToCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    const courses = req.body.courses;

    cart.courses.push(...courses); // Spread operator to push individual courses
    await cart.save();

    res.status(200).json({ message: "Courses added to cart successfully!" });
  } catch (error) {
    console.log("Error adding to cart: ", error);
    res.status(500).json({ message: "Error adding to cart: ", error });
  }
}

exports.removeCourseFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    const courseIdToRemove = req.params.course_id;

    // Find the index of the course with the specified ID
    const index = cart.courses.indexOf(courseIdToRemove);
    
    // Remove the course from the cart's courses array
    if (index !== -1) {
      cart.courses.splice(index, 1);
    } else {
      return res.status(404).json({ message: "Course not found in cart" });
    }
    
    // Save the updated cart
    await cart.save();

    console.log("Your courses after the operation: ", cart);

    res.status(200).json({ message: "Course removed from cart successfully!" });
  } catch (error) {
    console.log("Error removing course from cart: ", error);
    res.status(500).json({ message: "Error removing course from cart: ", error });
  }
};



exports.checkoutCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    const checkedOutCourses = req.body.courses;

    // Assuming you have the necessary models and methods to handle checkout

    // Example: Process cart items, calculate total amount, charge the user, etc.
    // Here you may implement the logic for your specific checkout process
    // Filter out checked out courses from the cart

     cart.courses = cart.courses.filter(courseId => coursesToRemove.includes(courseId));
    await cart.save()

    res.status(200).json({ message: "Checkout successful!" });
  } catch (error) {
    console.log("Error during checkout: ", error);
    res.status(500).json({ message: "Error during checkout: ", error });
  }
}

  