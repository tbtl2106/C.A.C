import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
      // SQL Server connection configuration
      const config = {
        user: 'sa',
        password: '123',
        server: 'LAPTOP-8UQVA0FU\\SQLEXPRESS02',
        database: 'QLSV',
        options: {
          encrypt: true, // Use encryption if required
          trustServerCertificate: true, // For self-signed certificates
        },
      };

      // Connect to the database
      const pool = await sql.connect(config);

      // Insert the email into the Information_users table
      await pool.request()
        .input('email', sql.NVarChar, email)
        .query('INSERT INTO Information_users (Email) VALUES (@email)');

      res.status(200).json({ message: 'Email registered successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      // Close the database connection
      sql.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}