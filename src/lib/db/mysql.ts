import mysql from 'mysql2/promise';

export interface MySQLConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

let pool: mysql.Pool | null = null;

export function getMySQLConfig(): MySQLConfig | null {
  const host = process.env.MYSQL_HOST || process.env.MYSQLHOST;
  const user = process.env.MYSQL_USER || process.env.MYSQLUSER;
  const password = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD;
  const database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.MYSQL_DB;
  const port = parseInt(process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306', 10);

  if (host && user && database) {
    return { host, port, user, password, database };
  }
  return null;
}

export function getMySQLPool(): mysql.Pool | null {
  if (pool) return pool;

  const config = getMySQLConfig();
  if (!config) return null;

  try {
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000
    });
    return pool;
  } catch (err) {
    console.error('Failed creating MySQL connection pool:', err);
    return null;
  }
}

export async function testMySQLConnection(customConfig?: MySQLConfig): Promise<{ success: boolean; message: string }> {
  const config = customConfig || getMySQLConfig();
  if (!config || !config.host) {
    return { success: false, message: 'No MySQL host or connection credentials configured.' };
  }

  try {
    const conn = await mysql.createConnection({
      host: config.host,
      port: config.port || 3306,
      user: config.user,
      password: config.password,
      database: config.database,
      connectTimeout: 5000
    });

    await conn.ping();
    await conn.end();
    return { success: true, message: `Successfully connected to MySQL database "${config.database}" at ${config.host}:${config.port}` };
  } catch (err: any) {
    return { success: false, message: `MySQL Connection Failed: ${err.message}` };
  }
}

export async function initializeMySQLTables(pool: mysql.Pool): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        whatsapp_number VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        company VARCHAR(255),
        country VARCHAR(255),
        city VARCHAR(255),
        source VARCHAR(255),
        opt_in_status TINYINT(1) DEFAULT 1,
        opt_in_date DATETIME,
        opt_out_status TINYINT(1) DEFAULT 0,
        tags JSON,
        custom_fields JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_org (organization_id),
        INDEX idx_phone (whatsapp_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'DRAFT',
        target_audience_type VARCHAR(50),
        target_audience_name VARCHAR(255),
        template_id VARCHAR(255),
        template_name VARCHAR(255),
        variable_mapping JSON,
        total_recipients INT DEFAULT 0,
        sent_count INT DEFAULT 0,
        delivered_count INT DEFAULT 0,
        read_count INT DEFAULT 0,
        reply_count INT DEFAULT 0,
        failed_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_org_camp (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    console.error('Error initializing MySQL tables:', e);
  }
}
