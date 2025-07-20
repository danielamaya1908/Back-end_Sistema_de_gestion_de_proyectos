import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gestiondeproyectos07@gmail.com",
    pass: "dqqhmhfrydhsqfbd",
  },
});

export const sendWelcomeVerificationEmail = async ({
  to,
  name,
  verificationCode,
}) => {
  const subject = "Bienvenido a Gestión de Proyectos - Verifica tu cuenta";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Hola ${name},</h2>
      <p>Gracias por registrarte en <strong>Gestión de Proyectos</strong>.</p>
      <p>Tu código de verificación es:</p>
      <h3 style="background-color: #f2f2f2; padding: 10px; display: inline-block;">${verificationCode}</h3>
      <p>Por favor, ingresa este código en la plataforma para verificar tu cuenta.</p>
      <br/>
      <p>Saludos,<br/>Equipo de Gestión de Proyectos</p>
    </div>
  `;

  const mailOptions = {
    from: `"Verificación de Email" <gestiondeproyectos07@gmail.com>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      "❌ Error enviando el correo de verificación:",
      error.message
    );
  }
};

export const sendPasswordResetEmail = async ({ to, name, resetCode }) => {
  const subject = "Recuperación de Contraseña - Gestión de Proyectos";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Hola ${name},</h2>
      <p>Recibiste este correo porque solicitaste restablecer tu contraseña en <strong>Gestión de Proyectos</strong>.</p>
      <p>Tu código de recuperación es:</p>
      <h3 style="background-color: #f2f2f2; padding: 10px; display: inline-block;">${resetCode}</h3>
      <p><strong>⚠️ Este código expirará en 1 hora.</strong></p>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      <br/>
      <p>Saludos,<br/>Equipo de Gestión de Proyectos</p>
    </div>
  `;

  const mailOptions = {
    from: `"Recuperación de Contraseña" <gestiondeproyectos07@gmail.com>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      "❌ Error enviando el correo de recuperación:",
      error.message
    );
    throw error;
  }
};
