import { NextRequest, NextResponse } from 'next/server';
import { testMySQLConnection, getMySQLConfig } from '@/lib/db/mysql';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDB();
  const config = getMySQLConfig();
  let mysqlTest = { success: false, message: 'MySQL credentials not provided in environment variables.' };

  if (config) {
    mysqlTest = await testMySQLConnection(config);
  }

  return NextResponse.json({
    activeEngine: mysqlTest.success ? 'MySQL Database (Connected)' : 'Persistent Dual-Layer Storage (Active)',
    mysqlConnected: mysqlTest.success,
    mysqlMessage: mysqlTest.message,
    mysqlConfig: config ? { host: config.host, port: config.port, user: config.user, database: config.database } : null,
    dbStats: {
      contacts: db.contacts.length,
      campaigns: db.campaigns.length,
      templates: db.templates.length,
      whatsappAccounts: db.whatsappAccounts.length,
      socialAccounts: db.socialAccounts.length
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host, port, user, password, database } = body;

    const testResult = await testMySQLConnection({
      host,
      port: parseInt(port || '3306', 10),
      user,
      password,
      database
    });

    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
