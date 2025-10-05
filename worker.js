export default {
  async fetch(request, env, ctx) {
    try {
      const data = await request.json();
      const { action, username, password } = data;

      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: 'Username and password required.' }), { status: 400 });
      }

      // ------------------
      // D1 Database logic
      // ------------------
      await env.SJONE_USERS.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          username TEXT PRIMARY KEY,
          password TEXT
        )
      `).run();

      if (action === 'signup') {
        const exists = await env.SJONE_USERS.prepare(`SELECT username FROM users WHERE username = ?`).bind(username).all();
        if (exists.results.length > 0) {
          return new Response(JSON.stringify({ success: false, message: 'Username already exists.' }));
        }

        await env.SJONE_USERS.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`).bind(username, password).run();

        // KV storage
        await env.SHRINE_USERS.put(username, password);

        return new Response(JSON.stringify({ success: true, message: 'Signup successful.' }));
      }

      if (action === 'login') {
        const result = await env.SJONE_USERS.prepare(`SELECT password FROM users WHERE username = ?`).bind(username).all();
        if (result.results.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'User not found.' }));
        }
        const storedPassword = result.results[0].password;
        if (storedPassword === password) {
          return new Response(JSON.stringify({ success: true, message: 'Login successful.' }));
        } else {
          return new Response(JSON.stringify({ success: false, message: 'Incorrect password.' }));
        }
      }

      return new Response(JSON.stringify({ success: false, message: 'Invalid action.' }), { status: 400 });

    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ success: false, message: 'Error processing request.' }), { status: 500 });
    }
  }
};
