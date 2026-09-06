export interface MetaMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}

export async function sendMetaCloudApiMessage(
  phoneNumberId: string,
  accessToken: string,
  payload: MetaMessagePayload
) {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Meta WhatsApp API request failed');
  }

  return data;
}

export function verifyMetaWebhookToken(
  mode: string | null,
  token: string | null,
  expectedToken: string,
  challenge: string | null
) {
  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return challenge;
  }
  return null;
}
