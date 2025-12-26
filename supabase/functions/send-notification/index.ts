// Supabase Edge Function para enviar notificações
// Deploy: supabase functions deploy send-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'new_post' | 'new_comment' | 'post_published';
  data: {
    title?: string;
    slug?: string;
    score?: number;
    authorName?: string;
    postSlug?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationPayload = await req.json();

    console.log('Notification request:', { type, data });

    // Aqui você pode integrar com:
    // - SendGrid / Mailgun / Resend para emails
    // - Telegram Bot API
    // - Slack Webhooks
    // - Discord Webhooks
    // - etc.

    // Exemplo: Enviar email (você precisa configurar variáveis de ambiente)
    const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL');

    if (!notificationEmail) {
      console.warn('NOTIFICATION_EMAIL não configurado');
      return new Response(
        JSON.stringify({ success: false, error: 'Email não configurado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Construir mensagem baseada no tipo
    let subject = '';
    let message = '';

    switch (type) {
      case 'new_post':
        subject = `Novo post criado: ${data.title}`;
        message = `
          <h2>Novo post gerado por IA</h2>
          <p><strong>Título:</strong> ${data.title}</p>
          <p><strong>Slug:</strong> ${data.slug}</p>
          <p><strong>Score:</strong> ${data.score}/10</p>
          <p>
            <a href="https://esper-site.vercel.app/admin">
              Ver no painel administrativo
            </a>
          </p>
        `;
        break;

      case 'new_comment':
        subject = `Novo comentário de ${data.authorName}`;
        message = `
          <h2>Novo comentário pendente de aprovação</h2>
          <p><strong>Autor:</strong> ${data.authorName}</p>
          <p><strong>Post:</strong> ${data.postSlug}</p>
          <p>
            <a href="https://esper-site.vercel.app/admin/comments">
              Moderar comentários
            </a>
          </p>
        `;
        break;

      case 'post_published':
        subject = `Post publicado: ${data.title}`;
        message = `
          <h2>Post publicado com sucesso</h2>
          <p><strong>Título:</strong> ${data.title}</p>
          <p>
            <a href="https://esper-site.vercel.app/blog/${data.slug}">
              Ver post publicado
            </a>
          </p>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Tipo de notificação inválido' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
    }

    // TODO: Implementar envio de email aqui
    // Exemplo com Resend, SendGrid, etc.
    // await sendEmail({ to: notificationEmail, subject, html: message });

    console.log('Notification sent:', { subject, to: notificationEmail, messageLength: message.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent',
        type,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
