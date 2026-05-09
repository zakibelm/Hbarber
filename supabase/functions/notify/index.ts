import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, name } = await req.json()

    // Récupération des secrets depuis l'environnement Supabase
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Variables d\'environnement Twilio manquantes dans Supabase')
    }

    // Préparation du message
    const cleanPhone = phone.replace(/\s+/g, '');
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;
    const message = `Bonjour${name ? ` ${name}` : ''} ! C'est à votre tour chez H Barber. Nous vous attendons ! ✂️`;
    
    // Authentification Twilio
    const auth = btoa(`${accountSid}:${authToken}`)
    
    // Appel à l'API Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: fromNumber,
          Body: message,
        }).toString(),
      }
    )

    const result = await response.json()
    if (!response.ok) throw new Error(result.message)

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
