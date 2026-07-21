const { neon } = require('@neondatabase/serverless');

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta la variable de entorno DATABASE_URL');
  }
  return neon(process.env.DATABASE_URL);
}

function rowToGame(row) {
  return {
    id: row.id,
    teamA: { name: row.team_a_name, score: row.team_a_score },
    teamB: { name: row.team_b_name, score: row.team_b_score },
    status: row.status,
    clock: row.clock,
    period: row.period,
    stadium: row.stadium,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    updatedAt: row.updated_at,
  };
}

function checkAdmin(event) {
  const username = event.headers['x-admin-username'] || event.headers['X-Admin-Username'] || '';
  const password = event.headers['x-admin-password'] || event.headers['X-Admin-Password'] || '';
  return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

module.exports = { getSql, rowToGame, checkAdmin, json };
