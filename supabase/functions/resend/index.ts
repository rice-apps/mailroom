const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const name = url.searchParams.get('name');
  const trackingId = url.searchParams.get('trackingId');

  if (!name || !trackingId) {
    return new Response(JSON.stringify({ error: 'Missing name or trackingId' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'Package Delivered',
      html: `<strong>Package Delivered</strong><br>Name: ${name}<br>Tracking ID: ${trackingId}`,
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(handler);
