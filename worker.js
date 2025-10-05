export default {
  async fetch(request, env) {
    const { action, username, password } = await request.json();

    // Create users table if not exists
    await env.SJONE_USERS.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT
      )
    `).run();

    if (action === "signup") {
      try {
        await env.SJONE_USERS.prepare(`
          INSERT INTO users (username, password) VALUES (?, ?)
        `).bind(username.toLowerCase(), password).run();

        return new Response(JSON.stringify({ success: true, message: "Account created" }), { status: 200 });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "Username already exists" }), { status: 400 });
      }
    }

    if (action === "login") {
      const result = await env.SJONE_USERS.prepare(`
        SELECT password FROM users WHERE username = ?
      `).bind(username.toLowerCase()).all();

      if (result.results.length && result.results[0].password === password) {
        return new Response(JSON.stringify({ success: true, message: "Login successful" }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ success: false, message: "Invalid username or password" }), { status: 401 });
      }
    }

    return new Response(JSON.stringify({ success: false, message: "Unknown action" }), { status: 400 });
  }
}
