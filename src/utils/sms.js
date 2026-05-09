import { supabase } from '../supabase';

/**
 * Envoie un SMS via une Edge Function Supabase (Production).
 * Cette méthode est sécurisée car les clés Twilio ne sont plus exposées côté client.
 */
export async function sendSMSTour(clientPhone, clientName) {
  try {
    const { data, error } = await supabase.functions.invoke('notify', {
      body: { phone: clientPhone, name: clientName }
    });

    if (error) {
      // Si la fonction n'est pas déployée ou renvoie une erreur
      console.error('Détails de l\'erreur Edge Function:', error);
      throw new Error(error.message || 'Erreur lors de l\'envoi du SMS via Supabase');
    }

    return data;
  } catch (error) {
    console.error('Erreur Twilio (Edge Function):', error);
    throw error;
  }
}
