import { NextResponse } from 'next/server';
import { purgeDatabase } from '@/lib/db';

export async function POST() {
  try {
    const cleanDb = purgeDatabase();
    return NextResponse.json({
      success: true,
      message: '🧹 All demo data, mock contacts, demo conversations, demo templates, and demo tags have been permanently purged from Vercel.',
      stats: {
        contacts: cleanDb.contacts.length,
        messages: cleanDb.messages.length,
        conversations: cleanDb.conversations.length,
        templates: cleanDb.templates.length,
        tags: cleanDb.tags.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
