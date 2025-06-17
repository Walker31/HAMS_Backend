import nodemailer from 'nodemailer';
(async () => {
  let testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);
  process.exit(0);
})();