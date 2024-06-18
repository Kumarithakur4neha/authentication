const nodemailer = require("nodemailer");

const sendmail = async (res, email, User) => {
    try {
        const url = `http://localhost:3000/forget-password/${User._id}`;

    //by which we are sending  transporting the mail

        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",


            auth: {
                user: "nehakumari0673949@gmail.com",
                pass: "frbhdrnrcndtauer",
            },
        });

        const mailOptions = {
            from: "Social Media Private Ltd. <social@media.pvt.ltd>",
            to: email,
            subject: "Password Reset Link",
            text: "Do not share this link to anyone",
            html: `<a href="${url}">Reset Password Link</a>`,
        };

        transport.sendMail(mailOptions, async (err, info) => {
            if (err){ 
                console.log(err);
                return res.send(err);}
            console.log(info);

            User.resetPasswordToken = 1;
            await User.save();

            res.send(
                `<h1 class="text-5xl text-center mt-5 bg-red-300">Check your inbox/spam.</h1>`
            );
        });
        
    } catch (error) {
        console.log(error);
        res.send(error);
    }
};

 module.exports = sendmail;