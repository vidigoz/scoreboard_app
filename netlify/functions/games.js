const { getSql, rowToGame, checkAdmin, json } = require('./_db');

exports.handler = async (event) => {
  const sql = getSql();

  if (event.httpMethod === 'GET') {
    const rows = await sql`SELECT * FROM games ORDER BY updated_at DESC`;
    return json(200, rows.map(rowToGame));
  }

  if (event.httpMethod === 'POST') {
    if (!checkAdmin(event)) return json(401, { error: 'Password de encargado incorrecto' });
    const b = JSON.parse(event.body || '{}');
    const id = b.id || 'g' + Date.now();
    await sql`
      INSERT INTO games (id, team_a_name, team_b_name, stadium, city, lat, lng)
      VALUES (${id}, ${b.teamAName || 'Equipo A'}, ${b.teamBName || 'Equipo B'}, ${b.stadium || ''}, ${b.city || ''}, ${b.lat || null}, ${b.lng || null})
    `;
    const rows = await sql`SELECT * FROM games WHERE id = ${id}`;
    return json(201, rowToGame(rows[0]));
  }

  return json(405, { error: 'Método no permitido' });
};
