const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('🚀 Incepem popularea bazei de date MindFind...');
  
  // Cream 5 clienti si 5 meserias
  const users = [
    { email: 'client1@email.com', full_name: 'Maria Popescu', phone: '0722111222', city: 'Bucuresti', role: 'client' },
    { email: 'client2@email.com', full_name: 'Ion Ionescu', phone: '0733222333', city: 'Cluj-Napoca', role: 'client' },
    { email: 'worker1@email.com', full_name: 'Gheorghe Vasile', phone: '0744333444', city: 'Timisoara', role: 'worker' },
    { email: 'worker2@email.com', full_name: 'Alexandru Marin', phone: '0755444555', city: 'Iasi', role: 'worker' },
    { email: 'worker3@email.com', full_name: 'Elena Dumitrescu', phone: '0766555666', city: 'Constanta', role: 'worker' }
  ];
  
  const passwordHash = await bcrypt.hash('parola123', 10);
  
  for (const u of users) {
    const result = await pool.query(`
      INSERT INTO users (id, email, password_hash, role, full_name, phone, city, is_banned, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3::user_role, $4, $5, $6, false, NOW())
      RETURNING id
    `, [u.email, passwordHash, u.role, u.full_name, u.phone, u.city]);
    
    const userId = result.rows[0].id;
    console.log(`✅ Creat user: ${u.full_name} (${u.role})`);
    
    // Daca e meserias, cream profilul
    if (u.role === 'worker') {
      await pool.query(`
        INSERT INTO worker_profiles (user_id, headline, bio, photo_url, verified, avg_rating, review_count, updated_at)
        VALUES ($1, $2, $3, $4, true, $5, $6, NOW())
      `, [userId, 'Meserias cu experienta', 'Lucrez in domeniu de peste 10 ani. Seriozitate si profesionalism.', 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70), (4.5 + Math.random()).toFixed(1), Math.floor(Math.random() * 50) + 10]);
      
      // Asocem meseriasul cu 2 categorii
      await pool.query('INSERT INTO worker_categories (worker_id, category_id) VALUES ($1, 1), ($1, 2)', [userId]);
    }
  }
  
  // Cream 10 cereri de servicii (requests)
  const requests = [
    { title: 'Reparatie instalatie sanitara', description: 'Am o scurgere la chiuveta din bucatarie. As dori o reparatie rapida.', city: 'Bucuresti', category_id: 1 },
    { title: 'Montaj prize si intrerupatoare', description: 'Am nevoie de montarea a 5 prize si 3 intrerupatoare in apartament.', city: 'Cluj-Napoca', category_id: 2 },
    { title: 'Zugravire apartament 3 camere', description: 'Apartament de 70mp, necesita zugravire completa. Materiale asigurate.', city: 'Timisoara', category_id: 3 },
    { title: 'Curatenie generala casa', description: 'Casa cu 4 camere, 2 bai. Curatenie profunda dupa renovare.', city: 'Iasi', category_id: 4 },
    { title: 'Configurare retea WiFi', description: 'Casa cu 3 etaje, nevoie de acoperire WiFi completa.', city: 'Constanta', category_id: 5 }
  ];
  
  const clients = await pool.query("SELECT id FROM users WHERE role = 'client'");
  
  for (const r of requests) {
    const clientId = clients.rows[Math.floor(Math.random() * clients.rows.length)].id;
    await pool.query(`
      INSERT INTO requests (id, client_id, category_id, title, description, city, status, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'open'::request_status, NOW())
    `, [clientId, r.category_id, r.title, r.description, r.city]);
  }
  
  console.log('🎉 Seeding MindFind complet! 5 utilizatori + 3 profiluri meserias + 5 cereri create.');
  await pool.end();
}

seed().catch(err => {
  console.error('❌ Eroare:', err);
  pool.end();
});
