const { getSql, rowToGame, checkAdmin, json } = require('./_db');

function getId(event) {
  const parts = event.path.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1]);
}

exports.handler = async (event) => {
  const sql = getSql();
  const id = getId(event);

  if (event.httpMethod === 'GET') {
    const rows = await sql`SELECT * FROM games WHERE id = ${id}`;
    if (!rows.length) return json(404, { error: 'Juego no encontrado' });
    return json(200, rowToGame(rows[0]));
  }

  if (event.httpMethod === 'PUT') {
    if (!checkAdmin(event)) return json(401, { error: 'Password de encargado incorrecto' });
    const existingRows = await sql`SELECT * FROM games WHERE id = ${id}`;
    if (!existingRows.length) return json(404, { error: 'Juego no encontrado' });
    const existing = existingRows[0];
    const b = JSON.parse(event.body || '{}');

    const next = {
      team_a_name: b.teamAName ?? existing.team_a_name,
      team_a_score: b.teamAScore ?? existing.team_a_score,
      team_b_name: b.teamBName ?? existing.team_b_name,
      team_b_score: b.teamBScore ?? existing.team_b_score,
      status: b.status ?? existing.status,
      clock: b.clock ?? existing.clock,
      period: b.period ?? existing.period,
      stadium: b.stadium ?? existing.stadium,
      city: b.city ?? existing.city,
      lat: b.lat ?? existing.lat,
      lng: b.lng ?? existing.lng,
    };

    await sql`
      UPDATE games SET
        team_a_name = ${next.team_a_name},
        team_a_score = ${next.team_a_score},
        team_b_name = ${next.team_b_name},
        team_b_score = ${next.team_b_score},
        status = ${next.status},
        clock = ${next.clock},
        period = ${next.period},
        stadium = ${next.stadium},
        city = ${next.city},
        lat = ${next.lat},
        lng = ${next.lng},
        updated_at = now()
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM games WHERE id = ${id}`;
    return json(200, rowToGame(rows[0]));
  }

  if (event.httpMethod === 'DELETE') {
    if (!checkAdmin(event)) return json(401, { error: 'Password de encargado incorrecto' });
    await sql`DELETE FROM games WHERE id = ${id}`;
    return { statusCode: 204, body: '' };
  }

  return json(405, { error: 'Método no permitido' });
};
