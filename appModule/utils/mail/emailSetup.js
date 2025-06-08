import { PASSWORD_RESET_SUCCESS_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, ORDER_CONFIRMATION_EMAIL_TEMPLATE, ORDER_SHIPPED_EMAIL_TEMPLATE, CANCEL_ORDER_EMAIL_TEMPLATE, RETURN_ORDER_EMAIL_TEMPLATE, RETURN_APPROVED_EMAIL_TEMPLATE, RETURN_REJECTED_EMAIL_TEMPLATE } from "./emailTemplate.js";
import {transporter} from "./email.Config.js";

import dotenv from "dotenv";
import Order from "../../Order/model/order.model.js";


dotenv.config();

export const sendVerificationEmail = async (userEmail, userName , verificationToken) => {
    try {
      // Generate verification link
      const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace("{{verificationToken}}", verificationToken)
                                                     .replace("{{userName}}", userName)
                                                     .replace("{{verificationLink}}", `${process.env.CLIENT_URL}/verify-email`)
      // Send email using the configured transporter
      const info = await transporter.sendMail({
        from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
        to: userEmail,
        subject: "Verify Your Email Address",
        text: `Use the following verification token to verify your email: ${verificationToken}`, // Plain text fallback
        html: htmlContent, // Rich HTML content
      });
    } catch (error) {
      console.error("Error sending verification email:", error.message);
      // Throw an error to be handled by the calling function
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const emailContent = WELCOME_EMAIL_TEMPLATE.replace("{{userName}}", userName)
                                             .replace("{{ShoppingLink}}", `${process.env.CLIENT_URL}`)
  try {
    const info = await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: "Welcome to Our Platform!",
      html: emailContent,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
    throw new Error("Failed to send welcome email.");
  }
};


export const sendResetPasswordEmail = async (userEmail, userName, resetToken) => {
  const emailContent = RESET_PASSWORD_EMAIL_TEMPLATE.replace("{{userName}}", userName)
                                                            .replace("{resetLink}", `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
  try {
    const info = await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: "Password Reset",
      html: emailContent,
    });
  } catch (error) {
    console.error("Error sending password reset success email:", error.message);
    throw new Error("Failed to send password reset success email.");
  }
};

export const sendResetPasswordSuccessEmail = async (userEmail, userName) => {
  const emailContent = PASSWORD_RESET_SUCCESS_EMAIL_TEMPLATE.replace("{{userName}}", userName)
                                                            .replace("{{resetLink}}", `${process.env.CLIENT_URL}/login`);
  try {
    const info = await transporter.sendMail({
      from: '"Jenny Fairy" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: "Password Reset Successful",
      html: emailContent,
    });
    console.log("Password reset successful email sent successfully!", info);
  } catch (error) {
    console.error("Error sending password reset success email:", error.message);
    throw new Error("Failed to send password reset success email.");
  }
};

export const sendOrderDetailSuccessEmail = async (userEmail, username, order) => {

  const populatedOrder = await Order.findById(order._id).populate("products.product");
  const formattedTotalAmount = populatedOrder.totalAmount.toLocaleString('en-US');
  const orderItems = populatedOrder.products
  .map((p) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <img src="${p.product?.img[0]|| null}" 
             alt="${p.product?.name || 'Product Image'}" 
             style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
        ${p.product?.name || "Product Not Found"}
      </td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.size || "-"}</td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${p.discountPrice > 0 ? p.discountPrice.toLocaleString('en-US') : p.price.toLocaleString('en-US')} VND</td>
    </tr>
  `)
  .join("");
  
  const emailContent = ORDER_CONFIRMATION_EMAIL_TEMPLATE
    .replace("{{userName}}", username)
    .replace("{{orderId}}", populatedOrder._id)
    .replace("{{orderId}}", populatedOrder._id)    
    .replace("{{orderDate}}", new Date(populatedOrder.createdAt).toLocaleDateString())
    .replace("{{totalAmount}}", formattedTotalAmount)
    .replace("{{orderItems}}", orderItems)
    .replace("{{fullName}}", populatedOrder.shippingDetails.fullName)
    .replace("{{phone}}", populatedOrder.shippingDetails.phone)
    .replace("{{address}}", populatedOrder.shippingDetails.address)
    .replace("{{city}}", populatedOrder.shippingDetails.city || "")
    .replace("{{postalCode}}", populatedOrder.shippingDetails.postalCode || "")
    .replace("{{country}}", populatedOrder.shippingDetails.country || "")
    .replace("{{trackingLink}}", `${process.env.CLIENT_URL}/profile`);

  try {
    const info = await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: "Your Order Confirmation",
      html: emailContent,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error.message);
    throw new Error("Failed to send order confirmation email.");
  }
};

export const sendOrderStatusUpdateEmail = async (userEmail, username, order) => {
  const populatedOrder = await Order.findById(order._id).populate("products.product");
  const formattedTotalAmount = populatedOrder.totalAmount.toLocaleString('en-US');

  const orderItems = populatedOrder.products
    .map((p) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <img src="${p.product?.img[0] || ''}" 
               alt="${p.product?.name || 'Product Image'}" 
               style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
          ${p.product?.name || "N/A"}
        </td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.size || "-"}</td>
        <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.quantity}</td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">
          ${p.discountPrice > 0 ? p.discountPrice.toLocaleString('en-US') : p.price.toLocaleString('en-US')} VND
        </td>
      </tr>
    `).join("");

  const emailContent = ORDER_SHIPPED_EMAIL_TEMPLATE
    .replace("{{userName}}", username)
    .replace("{{orderId}}", populatedOrder._id)
    .replace("{{orderDate}}", new Date(populatedOrder.createdAt).toLocaleDateString())
    .replace("{{totalAmount}}", formattedTotalAmount)
    .replace("{{orderItems}}", orderItems)
    .replace("{{fullName}}", populatedOrder.shippingDetails.fullName)
    .replace("{{phone}}", populatedOrder.shippingDetails.phone)
    .replace("{{address}}", populatedOrder.shippingDetails.address)
    .replace("{{city}}", populatedOrder.shippingDetails.city || "")
    .replace("{{postalCode}}", populatedOrder.shippingDetails.postalCode || "")
    .replace("{{country}}", populatedOrder.shippingDetails.country || "")
    .replace("{{trackingLink}}", `${process.env.CLIENT_URL}/profile`);

  try {
    await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: "Your Order Has Been Shipped!",
      html: emailContent,
    });
  } catch (error) {
    console.error("Error sending order update email:", error.message);
    throw new Error("Failed to send order update email.");
  }
};

export const sendOrderCancellationEmail = async (userEmail, username, order) => {
  const populatedOrder = await Order.findById(order._id).populate("products.product");
  console.log(populatedOrder);
  const formattedTotalAmount = populatedOrder.totalAmount.toLocaleString('en-US');

  const orderItems = populatedOrder.products.map((p) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <img src="${p.product?.img[0] || ''}" 
             alt="${p.product?.name || 'Product Image'}" 
             style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
        ${p.product?.name || "N/A"}
      </td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.size || "-"}</td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">
        ${p.discountPrice > 0 ? p.discountPrice.toLocaleString('en-US') : p.price.toLocaleString('en-US')} VND
      </td>
    </tr>
  `).join("");

  const emailContent = CANCEL_ORDER_EMAIL_TEMPLATE
  .replace("{{userName}}", username)
  .replace("{{orderId}}", populatedOrder._id)
  .replace("{{orderDate}}", new Date(populatedOrder.createdAt).toLocaleDateString())
  .replace("{{orderId}}", populatedOrder._id)
  .replace("{{orderDate}}", new Date(populatedOrder.createdAt).toLocaleDateString())
  .replace("{{totalAmount}}", formattedTotalAmount)
  .replace("{{orderItems}}", orderItems)
  .replace("{{fullName}}", populatedOrder.shippingDetails.fullName)
  .replace("{{phone}}", populatedOrder.shippingDetails.phone)
  .replace("{{address}}", populatedOrder.shippingDetails.address)
  .replace("{{city}}", populatedOrder.shippingDetails.city || "")
  .replace("{{postalCode}}", populatedOrder.shippingDetails.postalCode || "")
  .replace("{{country}}", populatedOrder.shippingDetails.country || "")
  .replace("{{supportLink}}", `mailto:jennyfairyfeminine@gmail.com?subject=Support%20Request&body=Hi%20JennyFairy%2C%0AI%20need%20help%20with%20my%20order%20%23${populatedOrder._id}.`);

  try {
    await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: "Your Order Has Been Cancelled",
      html: emailContent,
    });
  } catch (error) {
    console.error("Error sending cancellation email:", error.message);
    throw new Error("Failed to send cancellation email.");
  }
};

export const sendOrderReturnEmail = async (userEmail, username, order, returnReason = "") => {
  const populatedOrder = await Order.findById(order._id).populate("products.product");
  console.log(populatedOrder);
  const formattedTotalAmount = populatedOrder.totalAmount.toLocaleString('en-US');

  const orderItems = populatedOrder.products.map((p) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <img src="${p.product?.img[0] || ''}" 
             alt="${p.product?.name || 'Product Image'}" 
             style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px; vertical-align: middle;">
        ${p.product?.name || "N/A"}
      </td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.size || "-"}</td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">
        ${p.discountPrice > 0 ? p.discountPrice.toLocaleString('en-US') : p.price.toLocaleString('en-US')} VND
      </td>
    </tr>
  `).join("");

  const emailContent = RETURN_ORDER_EMAIL_TEMPLATE
    .replace(/{{userName}}/g, username)
    .replace(/{{orderId}}/g, populatedOrder._id)
    .replace(/{{orderDate}}/g, new Date(populatedOrder.createdAt).toLocaleDateString())
    .replace("{{totalAmount}}", formattedTotalAmount)
    .replace("{{returnReason}}", returnReason || "No reason provided")
    .replace("{{orderItems}}", orderItems)
    .replace("{{fullName}}", populatedOrder.shippingDetails.fullName)
    .replace("{{phone}}", populatedOrder.shippingDetails.phone)
    .replace("{{address}}", populatedOrder.shippingDetails.address)
    .replace("{{city}}", populatedOrder.shippingDetails.city || "")
    .replace("{{postalCode}}", populatedOrder.shippingDetails.postalCode || "")
    .replace("{{country}}", populatedOrder.shippingDetails.country || "")
    .replace("{{supportLink}}", `mailto:jennyfairyfeminine@gmail.com?subject=Return%20Support%20Request&body=Hi%20JennyFairy%2C%0AI%20need%20help%20with%20my%20return%20request%20for%20order%20%23${populatedOrder._id}.`);

  try {
    await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: `Return Request Received - Order #${populatedOrder._id}`,
      html: emailContent,
    });
    console.log(`Return request email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("Error sending Order Return email:", error.message);
    throw new Error("Failed to send Order Return email.");
  }
};

export const sendReturnDecisionEmail = async (userEmail, username, order, action, adminNotes = "") => {
  const populatedOrder = await Order.findById(order._id).populate("products.product");
  const formattedTotalAmount = populatedOrder.totalAmount.toLocaleString('en-US');
  
  // Determine which template to use based on action
  const isApproved = action === 'approve' || action === 'approved';
  const template = isApproved ? RETURN_APPROVED_EMAIL_TEMPLATE : RETURN_REJECTED_EMAIL_TEMPLATE;
  
  // Generate order items HTML
  const orderItems = populatedOrder.products.map((p) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <img src="${p.product?.img[0] || ''}" 
             alt="${p.product?.name || 'Product Image'}" 
             style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px; vertical-align: middle;">
        ${p.product?.name || "N/A"}
      </td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.size || "-"}</td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">
        ${p.discountPrice > 0 ? p.discountPrice.toLocaleString('en-US') : p.price.toLocaleString('en-US')} VND
      </td>
    </tr>
  `).join("");

  // Replace template variables
  let emailContent = template
    .replace(/{{userName}}/g, username)
    .replace(/{{orderId}}/g, populatedOrder._id)
    .replace(/{{orderDate}}/g, new Date(populatedOrder.createdAt).toLocaleDateString())
    .replace(/{{totalAmount}}/g, formattedTotalAmount)
    .replace(/{{returnReason}}/g, populatedOrder.shippingDetails.returnReason || "No reason provided")
    .replace(/{{orderItems}}/g, orderItems)
    .replace(/{{supportLink}}/g, `mailto:jennyfairyfeminine@gmail.com?subject=Return%20Inquiry%20-%20Order%20${populatedOrder._id}&body=Hi%20JennyFairy%2C%0AI%20have%20a%20question%20about%20my%20return%20request%20for%20order%20%23${populatedOrder._id}.`);

  // Handle admin notes - simple replacement since we're not using a template engine
  if (adminNotes) {
    emailContent = emailContent.replace(/{{adminNotes}}/g, adminNotes);
    // Remove the conditional logic since we can't use Handlebars
    emailContent = emailContent.replace(/{{#if adminNotes}}/g, '').replace(/{{\/if}}/g, '');
  } else {
    // Remove the admin notes section if no notes provided
    emailContent = emailContent.replace(/{{#if adminNotes}}[\s\S]*?{{\/if}}/g, '');
    emailContent = emailContent.replace(/{{adminNotes}}/g, '');
  }

  // Set email subject based on action
  const subject = isApproved 
    ? `Return Approved - Order #${populatedOrder._id}` 
    : `Return Request Update - Order #${populatedOrder._id}`;

  try {
    await transporter.sendMail({
      from: '"JennyFairy Feminine" <nguyenmandat0744@gmail.com>',
      to: userEmail,
      subject: subject,
      html: emailContent,
    });
    
    console.log(`Return decision email sent successfully to ${userEmail} - Action: ${action}`);
  } catch (error) {
    console.error("Error sending return decision email:", error.message);
    throw new Error("Failed to send return decision email.");
  }
};