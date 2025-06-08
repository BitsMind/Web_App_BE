export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  
  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" 
         alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 15px; color: #333;">Verify Your Email Address</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">
      Hello <strong>{{userName}}</strong>,
    </p>

    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      Thank you for signing up with <strong>JennyFairy</strong>. To complete your registration, please verify your email address by clicking the button below:
    </p>

    <div style="background-color: #000; color: #fff; padding: 15px; font-size: 18px; font-weight: bold; display: block; letter-spacing: 1px; margin-top: 20px; border-radius: 5px;">
          {{verificationToken}}
    </div>

    <!-- Verification Button -->
    <a href="{{verificationLink}}" 
       style="display: inline-block; background: black; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 3px; margin-top: 20px;">
      Verify My Email
    </a>

    <p style="font-size: 14px; margin-top: 20px; color: #666;">
      If you did not request this, please ignore this email.
    </p>

  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JennyFairy</title>
</head>
<body style="font-family: 'Poppins', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">

  <!-- Header Section with Logo -->
  <div style="background: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 150px; margin-bottom: 10px;">
    <h1 style="color: #111; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Welcome to JennyFairy</h1>
  </div>

  <!-- Body Content -->
  <div style="background-color: white; padding: 25px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #555;">Hey <strong>{{userName}}</strong>,</p>
    <p style="font-size: 16px; color: #444;">You’re officially part of the <strong>JennyFairy</strong> family! It’s time to elevate your wardrobe with effortlessly chic pieces.</p>

    <p style="font-size: 16px; font-weight: 500; color: #222;">Here’s what’s waiting for you:</p>

    <!-- Stylish CTA Section -->
    <div style="margin: 20px 0; background-color: #f7f7f7; padding: 20px; border-radius: 8px; font-size: 15px;">
      <ul style="list-style: none; padding: 0; margin: 0; color: #444; font-weight: 500;">
        <li style="margin-bottom: 10px;">✨ <strong>Shop New Arrivals</strong> – Discover the latest must-haves.</li>
        <li style="margin-bottom: 10px;">💡 <strong>Get Inspired</strong> – Browse our curated lookbooks.</li>
        <li style="margin-bottom: 10px;">🎁 <strong>Exclusive Perks</strong> – Enjoy members-only discounts.</li>
      </ul>
    </div>

    <!-- Main Call to Action -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.jennyfairyfeminine.com/" 
         style="text-decoration: none; background-color: #000; color: white; padding: 14px 32px; font-size: 16px; border-radius: 50px; font-weight: bold; letter-spacing: 0.5px; display: inline-block; transition: background 0.3s ease;">
        EXPLORE NOW →
      </a>
    </div>

    <p style="font-size: 15px; color: #555;">Need assistance? Our team is always here to help. Reach out via email or follow us on social media.</p>

    <p style="font-size: 16px; font-weight: 500; color: #222;">See you soon, fashion icon. ✨</p>
    <p style="font-size: 14px; color: #777;">- The JennyFairy Team</p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>This email was sent automatically—no need to reply. But we'd love to connect! Follow us on social media.</p>
    <p style="margin-top: 10px;">&copy; 2024 JennyFairy. All rights reserved.</p>
  </div>

</body>
</html>
`;

export const RESET_PASSWORD_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  
  <!-- Header Section -->
  <div style="background: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Brand Logo -->
     <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 150px; margin-bottom: 10px;">
    <h1 style="color: #111; margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Reset Your Password</h1>
  </div>

  <!-- Body Content -->
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <p style="font-size: 16px;">Hello <strong>{{userName}}</strong>,</p>
    <p style="font-size: 16px;">We received a request to reset your password. Click the button below to regain access to <strong>JennyFairy</strong>:</p>

    <!-- Reset Link -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetLink}" 
         style="text-decoration: none; background-color: #000; color: white; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 50px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #777;">If you did not request this change, simply ignore this email.</p>

    <p style="font-size: 14px; color: #777;">Need assistance? <a href="mailto:nguyenmandat0744@gmail.com?subject=Support Request&body=Hello, I need help with..." style="color: #000; text-decoration: none; font-weight: bold; border-bottom: 2px solid #000;">Contact our support team</a>.</p>

    <p style="font-size: 14px; font-weight: bold;">Stay chic,<br>The JennyFairy Team</p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>This is an automated message, please do not reply.</p>
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  
  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px;">Password Reset Successful</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">Your password has been successfully updated. You can now log in and continue discovering our latest collections.</p>
    
    <a href="{{resetLink}}" 
       style="display: inline-block; background: black; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 3px; margin-top: 20px;">
      Log In Now
    </a>

    <p style="font-size: 14px; margin-top: 25px; color: #666;">If you didn’t request this, please contact our support team immediately.</p>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>
`;

export const ORDER_CONFIRMATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  
  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px;">Thank You for Your Order!</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      Your order <strong>#{{orderId}}</strong> has been successfully placed.
    </p>

    <!-- Order Details -->
    <div style="text-align: left; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fafafa;">
      <p><strong>Order ID:</strong> {{orderId}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Total Amount:</strong> <span style="color: #d32f2f;">{{totalAmount}} VND - (Included Shipping Fee)</span></p>
      
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Products Ordered:</h3>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Size</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{orderItems}}
        </tbody>
      </table>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Shipping Details:</h3>
      <p><strong>Name:</strong> {{fullName}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Address:</strong> {{address}}, {{city}}, {{postalCode}}, {{country}}</p>
      <p><strong>Delivery Status:</strong> <span style="color: #FFA500;">Pending</span></p>
    </div>

    <p style="font-size: 14px; margin-top: 20px; color: #666;">
      You will receive an update once your order has been shipped. You can track your order status in your account.
    </p>

    <a href="{{trackingLink}}" 
       style="display: inline-block; background: black; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 3px; margin-top: 20px;">
      Track Your Order
    </a>

    <p style="font-size: 14px; margin-top: 25px; color: #666;">If you have any questions, feel free to contact our support team.</p>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>

`;

export const ORDER_SHIPPED_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  
  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px;">Your Order Has Been Shipped!</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      We’re excited to let you know that your order <strong>#{{orderId}}</strong> has been shipped and is on its way to you!
    </p>

    <!-- Order Details -->
    <div style="text-align: left; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fafafa;">
      <p><strong>Order ID:</strong> {{orderId}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Total Amount:</strong> <span style="color: #d32f2f;">{{totalAmount}} VND - (Included Shipping Fee)</span></p>
      
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Products Shipped:</h3>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Size</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{orderItems}}
        </tbody>
      </table>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Shipping Details:</h3>
      <p><strong>Name:</strong> {{fullName}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Address:</strong> {{address}}, {{city}}, {{postalCode}}, {{country}}</p>
      <p><strong>Delivery Status:</strong> <span style="color: #28a745;">Shipped</span></p>
    </div>

    <p style="font-size: 14px; margin-top: 20px; color: #666;">
      Your package is now with our delivery partner. You can track your order status using the link below:
    </p>

    <a href="{{trackingLink}}" 
       style="display: inline-block; background: black; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 3px; margin-top: 20px;">
      Track Your Order
    </a>

    <p style="font-size: 14px; margin-top: 25px; color: #666;">If you have any questions, feel free to contact our support team.</p>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>
`;

export const CANCEL_ORDER_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px; color: #d32f2f;">Your Order Has Been Cancelled</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      Your order <strong>#{{orderId}}</strong> placed on <strong>{{orderDate}}</strong> has been cancelled successfully.
    </p>

    <!-- Order Details -->
    <div style="text-align: left; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fafafa;">
      <p><strong>Order ID:</strong> {{orderId}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Total Amount:</strong> <span style="color: #d32f2f;">{{totalAmount}} VND</span></p>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Products Cancelled:</h3>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Size</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{orderItems}}
        </tbody>
      </table>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Shipping Details:</h3>
      <p><strong>Name:</strong> {{fullName}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Address:</strong> {{address}}, {{city}}, {{postalCode}}, {{country}}</p>
      <p><strong>Delivery Status:</strong> <span style="color: #d32f2f;">Cancelled</span></p>
    </div>

    <p style="font-size: 14px; margin-top: 20px; color: #666;">
      We're sorry to see your order cancelled. If you have any concerns or need assistance, please don’t hesitate to contact our customer support.
    </p>

    <a href="{{supportLink}}" 
       style="display: inline-block; background: black; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 3px; margin-top: 20px;">
      Contact Support
    </a>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>
`;

export const RETURN_ORDER_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Return Request Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px; color: #ff6b35;">Return Request Received</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      We have received your return request for order <strong>#{{orderId}}</strong> placed on <strong>{{orderDate}}</strong>.
    </p>

    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-weight: 500;">
        📦 Your return request is being processed. We will contact you within 1-2 business days with return instructions.
      </p>
    </div>

    <!-- Order Details -->
    <div style="text-align: left; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fafafa;">
      <p><strong>Order ID:</strong> {{orderId}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Total Amount:</strong> <span style="color: #ff6b35;">{{totalAmount}} VND</span></p>
      <p><strong>Return Reason:</strong> {{returnReason}}</p>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Products to Return:</h3>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Size</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{orderItems}}
        </tbody>
      </table>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 15px;">Original Shipping Details:</h3>
      <p><strong>Name:</strong> {{fullName}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Address:</strong> {{address}}, {{city}}, {{postalCode}}, {{country}}</p>
      <p><strong>Current Status:</strong> <span style="color: #ff6b35; font-weight: 600;">Return Requested</span></p>
    </div>

    <!-- Return Process Information -->
    <div style="text-align: left; padding: 20px; border: 1px solid #e3f2fd; border-radius: 5px; background-color: #f3f9ff; margin-top: 20px;">
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 0; color: #1976d2;">What happens next?</h3>
      <ol style="padding-left: 20px; color: #444;">
        <li style="margin-bottom: 8px;">Our team will review your return request within 1-2 business days</li>
        <li style="margin-bottom: 8px;">You will receive return instructions and a prepaid shipping label via email</li>
        <li style="margin-bottom: 8px;">Package your items securely and ship them back to us</li>
        <li style="margin-bottom: 8px;">Once we receive and inspect your items, we'll process your refund</li>
        <li style="margin-bottom: 8px;">Refund will be credited to your original payment method within 5-7 business days</li>
      </ol>
    </div>

    <!-- Important Notes -->
    <div style="text-align: left; padding: 15px; border: 1px solid #ffebee; border-radius: 5px; background-color: #fff5f5; margin-top: 20px;">
      <h4 style="font-size: 16px; font-weight: 600; margin-top: 0; color: #d32f2f;">Important Notes:</h4>
      <ul style="padding-left: 20px; color: #444; font-size: 14px;">
        <li>Items must be returned in original condition with tags attached</li>
        <li>Return period is 30 days from delivery date</li>
        <li>Processing time may vary during peak seasons</li>
        <li>You will receive email updates throughout the return process</li>
      </ul>
    </div>

    <p style="font-size: 14px; margin-top: 25px; color: #666;">
      If you have any questions about your return or need assistance, please don't hesitate to contact our customer support team.
    </p>

    <a href="{{supportLink}}" 
       style="display: inline-block; background: #ff6b35; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 5px; margin-top: 20px; transition: background-color 0.3s;">
      Contact Support
    </a>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
    <p style="margin-top: 10px;">
      <a href="#" style="color: #ff6b35; text-decoration: none;">Privacy Policy</a> | 
      <a href="#" style="color: #ff6b35; text-decoration: none;">Terms of Service</a>
    </p>
  </div>

</body>
</html>
`;

export const RETURN_APPROVED_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Return Request Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px; color: #28a745;">Return Request Approved!</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      Great news! Your return request for order <strong>#{{orderId}}</strong> has been <strong style="color: #28a745;">approved</strong>.
    </p>

    <!-- Approval Notice -->
    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: left;">
      <h3 style="color: #155724; margin-top: 0; font-size: 18px;">📦 Return Instructions</h3>
      <p style="margin: 10px 0; color: #155724;">
        Please follow these steps to complete your return:
      </p>
      <ol style="color: #155724; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Pack your items securely in original packaging (if available)</li>
        <li style="margin-bottom: 8px;">Include the return form that was sent to you</li>
        <li style="margin-bottom: 8px;">Use the prepaid shipping label provided below</li>
        <li style="margin-bottom: 8px;">Drop off at any authorized shipping location</li>
      </ol>
      <p style="color: #155724; font-weight: 600; margin-bottom: 0;">
        ⏰ Please ship your return within <strong>7 days</strong> of receiving this email.
      </p>
    </div>

    <!-- Order Details -->
    <div style="text-align: left; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fafafa;">
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 0;">Order Details</h3>
      <p><strong>Order ID:</strong> {{orderId}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Return Amount:</strong> <span style="color: #28a745; font-weight: 600;">{{totalAmount}} VND</span></p>
      <p><strong>Return Reason:</strong> {{returnReason}}</p>
      
      {{#if adminNotes}}
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 15px;">
        <p style="margin: 0; color: #856404;"><strong>Admin Notes:</strong> {{adminNotes}}</p>
      </div>
      {{/if}}

      <h4 style="font-size: 16px; font-weight: 600; margin-top: 15px;">Items to Return:</h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Size</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{orderItems}}
        </tbody>
      </table>
    </div>

    <!-- Refund Information -->
    <div style="text-align: left; padding: 20px; border: 1px solid #e3f2fd; border-radius: 5px; background-color: #f3f9ff; margin-top: 20px;">
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 0; color: #1976d2;">💰 Refund Information</h3>
      <p style="color: #444; margin-bottom: 10px;">
        Once we receive and inspect your returned items:
      </p>
      <ul style="color: #444; padding-left: 20px;">
        <li style="margin-bottom: 5px;">Refund will be processed within 3-5 business days</li>
        <li style="margin-bottom: 5px;">Amount will be credited to your original payment method</li>
        <li style="margin-bottom: 5px;">You'll receive a confirmation email once refund is processed</li>
      </ul>
    </div>

    <p style="font-size: 14px; margin-top: 25px; color: #666;">
      Thank you for choosing JennyFairy. If you have any questions about your return, please contact our support team.
    </p>

    <a href="{{supportLink}}" 
       style="display: inline-block; background: #28a745; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 5px; margin-top: 20px;">
      Contact Support
    </a>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>
`;

export const RETURN_REJECTED_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Return Request Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0;">
    <img src="https://res.cloudinary.com/dmzfjdowd/image/upload/v1743621391/logoEmail_fyemfp.png" alt="JennyFairy Logo" style="max-width: 180px;">
  </div>

  <!-- Main Container -->
  <div style="background: #ffffff; padding: 40px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center;">
    
    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 15px; color: #856404;">Return Request Update</h1>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Hello <strong>{{userName}}</strong>,</p>
    
    <p style="font-size: 15px; margin-bottom: 20px; color: #444;">
      Thank you for your return request for order <strong>#{{orderId}}</strong>. After careful review, we're unable to process your return at this time.
    </p>

    <!-- Rejection Notice -->
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: left;">
      <h3 style="color: #856404; margin-top: 0; font-size: 18px;">📋 Return Status</h3>
      <p style="margin: 10px 0; color: #856404;">
        We understand this may be disappointing. Here's what happened:
      </p>
      <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404; font-weight: 600;">
          Reason: {{adminNotes}}
        </p>
      </div>
    </div>

    <!-- Order Details -->
    <div style="text-align: left; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fafafa;">
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 0;">Order Details</h3>
      <p><strong>Order ID:</strong> {{orderId}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Order Amount:</strong> {{totalAmount}} VND</p>
      <p><strong>Return Reason:</strong> {{returnReason}}</p>

      <h4 style="font-size: 16px; font-weight: 600; margin-top: 15px;">Items in Order:</h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Size</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{orderItems}}
        </tbody>
      </table>
    </div>

    <!-- Alternative Options -->
    <div style="text-align: left; padding: 20px; border: 1px solid #e3f2fd; border-radius: 5px; background-color: #f3f9ff; margin-top: 20px;">
      <h3 style="font-size: 18px; font-weight: 600; margin-top: 0; color: #1976d2;">💡 What can you do?</h3>
      <ul style="color: #444; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Contact our support team if you believe this decision was made in error</li>
        <li style="margin-bottom: 8px;">Review our return policy for future reference</li>
        <li style="margin-bottom: 8px;">Reach out if you have any questions about your order</li>
      </ul>
      <p style="color: #444; font-style: italic; margin-top: 15px; margin-bottom: 0;">
        We value your business and want to ensure you have the best possible experience with JennyFairy.
      </p>
    </div>

    <p style="font-size: 14px; margin-top: 25px; color: #666;">
      We appreciate your understanding. If you have any questions or concerns, please don't hesitate to contact our customer support team.
    </p>

    <a href="{{supportLink}}" 
       style="display: inline-block; background: #ff6b35; color: white; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 5px; margin-top: 20px;">
      Contact Support
    </a>
    
  </div>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
    <p>&copy; 2024 JennyFairy. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>

</body>
</html>
`;