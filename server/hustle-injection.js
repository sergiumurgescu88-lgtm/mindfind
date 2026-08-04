const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function injectHustle() {
  console.log('🧹 1. Curatam piata de oferte si mesaje vechi...');
  // Stergem in ordine inversa pentru a respecta cheile straine (foreign keys)
  await pool.query('DELETE FROM messages');
  await pool.query('DELETE FROM conversations');
  await pool.query('DELETE FROM offers');
  console.log('✅ Piata curata! Incepem injectarea...\n');
  
  // Luam toate cererile si toti meseriasii
  const requestsRes = await pool.query("SELECT id, client_id FROM requests");
  const workersRes = await pool.query("SELECT id, full_name FROM users WHERE role = 'worker'");
  
  if (requestsRes.rows.length === 0 || workersRes.rows.length === 0) {
    console.log('❌ Nu avem suficiente cereri sau meseriasi. Oprim.');
    return;
  }

  const offerMessages = [
    "Salut! Am vazut cererea ta. Am experienta in asa ceva si pot incepe de maine.",
    "Buna ziua! Ma ocup de astfel de lucrari. Pretul include si materialele.",
    "Salut, sunt disponibil in zona ta. Pot trece pe la tine pentru o evaluare gratuita.",
    "Buna! Am echipamentul necesar si pot finaliza treaba in aceeasi zi."
  ];

  const chatReplies = [
    "Da, maine la 10:00 e perfect. Va astept.",
    "Super, multumesc pentru oferta. O analizez si revin.",
    "Ok, dar aveti recenziile la profil? Vreau sa fiu sigur.",
    "Pretul e bun, dar cat dureaza exact lucrarea?"
  ];

  let totalOffers = 0;
  let totalMessages = 0;

  for (const req of requestsRes.rows) {
    const shuffled = [...workersRes.rows].sort(() => 0.5 - Math.random());
    // Alegem 2 meseriasi random pentru fiecare cerere
    const selectedWorkers = shuffled.slice(0, 2);

    for (const worker of selectedWorkers) {
      const price = Math.floor(Math.random() * 800) + 250; 
      const msg = offerMessages[Math.floor(Math.random() * offerMessages.length)];
      
      // 1. Cream Oferta
      await pool.query(
        `INSERT INTO offers (id, request_id, worker_id, message, price, status, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending'::offer_status, NOW())`,
        [req.id, worker.id, msg, price]
      );
      totalOffers++;

      // 2. Cream Conversatia
      const convRes = await pool.query(
        `INSERT INTO conversations (id, request_id, client_id, worker_id, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id`,
        [req.id, req.client_id, worker.id]
      );
      const convId = convRes.rows[0].id;

      // 3. Generam Mesajele (ping-pong real)
      await pool.query(
        `INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
         VALUES (gen_random_uuid(), $1, $2, 'Buna ziua, am vazut ca ati postat o cerere. Sunt interesat si v-am trimis o oferta.', NOW())`,
        [convId, worker.id]
      );
      
      const clientReply = chatReplies[Math.floor(Math.random() * chatReplies.length)];
      await pool.query(
        `INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW() + interval '5 minutes')`,
        [convId, req.client_id, clientReply]
      );
      
      await pool.query(
        `INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
         VALUES (gen_random_uuid(), $1, $2, 'Va multumesc. Ramanem asa atunci. O zi buna!', NOW() + interval '12 minutes')`,
        [convId, worker.id]
      );
      
      totalMessages += 3;
    }
  }
  
  console.log(`🎉 Hustle Injection complet!`);
  console.log(`✅ ${totalOffers} Oferte noi trimise de meseriasi.`);
  console.log(`✅ ${totalMessages} Mesaje noi in conversatii.`);
  
  await pool.end();
}

injectHustle().catch(err => {
  console.error('❌ Eroare la injectare:', err.message);
  pool.end();
});
