import nodemailer from 'nodemailer';

interface EmailConfig {
  enabled: boolean;
  to: string;
  from: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

// Configuração via env vars
const EMAIL_CONFIG: EmailConfig = {
  enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
  to: process.env.NOTIFICATION_EMAIL || '',
  from: process.env.EMAIL_FROM || 'blog@ricardoesper.com.br',
  smtp: process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  } : undefined
};

export async function sendPostGeneratedNotification(post: {
  title: string;
  slug: string;
  score: number;
  filepath: string;
  category: string;
}) {
  if (!EMAIL_CONFIG.enabled || !EMAIL_CONFIG.to) {
    console.log('📧 Email notifications disabled');
    return;
  }

  try {
    const smtpConfig = EMAIL_CONFIG.smtp || {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };
    const transporter = nodemailer.createTransport(smtpConfig);

    const subject = `Novo Post Gerado: ${post.title}`;
    const html = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #262626;">🤖 Novo Post Gerado</h1>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0;">${post.title}</h2>
    
    <p><strong>Categoria:</strong> ${post.category}</p>
    <p><strong>Score:</strong> ${post.score}/10</p>
    <p><strong>Slug:</strong> <code>${post.slug}</code></p>
  </div>
  
  <div style="margin: 20px 0;">
    <h3>📝 Ação Necessária</h3>
    <p>O post foi salvo como draft e precisa de revisão:</p>
    <p><code>${post.filepath}</code></p>
  </div>
  
  <div style="background: ${post.score >= 8.5 ? '#e5f5e5' : '#fff5e5'}; padding: 15px; border-radius: 8px;">
    <strong>Recomendação:</strong>
    ${post.score >= 8.5 
      ? '✅ Score alto! Pode publicar após revisão rápida.' 
      : '⚠️ Score moderado. Revise com atenção antes de publicar.'}
  </div>
  
  <p style="color: #737373; font-size: 14px; margin-top: 30px;">
    Gerado automaticamente pelo sistema de auto-publicação.<br>
    Para desabilitar notificações, configure EMAIL_NOTIFICATIONS=false
  </p>
</div>
    `;

    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.to,
      subject,
      html
    });

    console.log(`✅ Email enviado para ${EMAIL_CONFIG.to}`);
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
  }
}

export async function sendErrorNotification(error: Error, context: string) {
  if (!EMAIL_CONFIG.enabled || !EMAIL_CONFIG.to) return;

  try {
    const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp || {});

    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.to,
      subject: `❌ Erro no Sistema de Auto-Publicação`,
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #dc2626;">❌ Erro Detectado</h1>
  
  <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
    <p><strong>Contexto:</strong> ${context}</p>
    <p><strong>Erro:</strong> ${error.message}</p>
    <pre style="background: white; padding: 10px; overflow: auto;">${error.stack}</pre>
  </div>
  
  <p style="color: #737373;">
    Verifique os logs do sistema para mais detalhes.
  </p>
</div>
      `
    });

    console.log('✅ Notificação de erro enviada');
  } catch (e) {
    console.error('❌ Erro ao enviar notificação de erro:', e);
  }
}
