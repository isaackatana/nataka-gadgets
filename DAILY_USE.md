# Running the site: first week checklist

Log in at your site address followed by `/#/admin`. Everything below happens in the staff area.

## Every morning (5 minutes)
1. Open **Today**. It shows what needs you now: jobs ready for pickup, new quotes and call-back requests, jobs not updated in 3 days, reviews waiting for approval, and products running low on stock.
2. Reply to new quotes. Open **Quote requests**, message the customer on WhatsApp, then set the status to *quoted*, *in progress* or *done*.
3. Message customers whose jobs are stuck. Update the job in **Repair jobs** so their tracking page stays honest.

## When a device comes in
1. **Repair jobs**: fill in name, phone, device and issue, then press **Book in repair and get job code**.
2. Print the receipt or send the WhatsApp message with the job code. The customer can follow progress under "Track repair" on the site using the code and their phone number.
3. Change the status as work moves along. When it is *ready for pickup*, press the WhatsApp button to tell the customer. When it is *collected*, the message asks for a review.
4. Add a short note the customer will see (for example "waiting for the screen to arrive").

## When someone orders a product
1. The customer taps **Order on WhatsApp** on a product page, so the order arrives in your WhatsApp with the product name and price.
2. Confirm the part fits their device, agree collection, and take payment as you normally do.
3. In **Products**, press **Sold 1** next to the product (or type the new number in Qty). At 0 the site shows it as out of stock, and when 3 or fewer are left it appears under Low stock on the Today tab. Products with no Qty use the **In stock / Out of stock** button as before.

## Products (set aside an hour in week one)
1. **Products**: correct every price. Edit the KSh box and click away to save.
2. Press **Photos and details** on each product. Add 2 to 4 clear photos (front, back, in hand), choose the main one, write a short description, and fill in **Compatible with** (the phone or laptop models it fits). Customers can search the shop by model.
3. Use **Hide** for anything you do not stock. Hidden products do not show on the site.
4. Add new stock with the form at the top.

## Once a week
- **Reviews**: approve genuine reviews so they show on the site.
- **Gallery**: add one or two photos of recent work or products.
- **Price guide**: keep your "from KSh" prices current.
- **Stock check** (monthly is plenty): in **Products** press **Print stock list** or **Download stock list**, count the shelves, write the numbers in the last column, then fix any Qty that is wrong.
- **Summary**: scroll to "Backup your data" and download the spreadsheet files. Keep them somewhere safe.

## When things change
- Closed today or a holiday? Open **Shop details** and write a notice. It appears at the top of every page. Clear it when you reopen.
- Changed your WhatsApp number? Update `VITE_WHATSAPP` in Vercel (Settings, Environment Variables) and redeploy.
- Added many products? Redeploy once so Google gets the new product pages in the sitemap.

## If something looks wrong
- Open your site address followed by `/#/status`. It shows whether the site has its database settings and can read products, and says what to fix.
- Shop empty: check the product is not hidden, then hard-refresh (Ctrl+Shift+R).
- Cannot log in: use the staff email and password set up in Supabase (Authentication, Users).
- Photo will not upload: check you are logged in, and try a smaller photo.
