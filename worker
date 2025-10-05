export default {
  async fetch(request: Request, env: any) {
    try {
      if (request.method !== "POST") {
        return new Response("Only POST requests are allowed", { status: 405 });
      }

      const { action, username, password } = await request.json();

      if (!username || !password) {
        return Response.json({ success: false, message: "Username and password required" });
      }

      // Ensure users table exists
      await env.SJONE_USERS.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          username TEXT PRIMARY KEY,
          password TEXT
        )
      `).run();

      if (action === "signup") {
        try {
          await env.SJONE_USERS.prepare(
            "INSERT INTO users (username, password) VALUES (?, ?)"
          ).bind(username, password).run();

          return Response.json({ success: true, message: "Account created successfully" });
        } catch {
          return Response.json({ success: false, message: "Username already exists" });
        }
      }

      if (action === "login") {
        const result = await env.SJONE_USERS
          .prepare("SELECT password FROM users WHERE username = ?")
          .bind(username)
          .all();

        if (result.results.length === 0) {
          return Response.json({ success: false, message: "User not found" });
        }

        const storedPassword = result.results[0].password;
        if (storedPassword === password) {
          return Response.json({ success: true, message: "Login successful" });
        } else {
          return Response.json({ success: false, message: "Incorrect password" });
        }
      }

      return Response.json({ success: false, message: "Invalid action" });

    } catch (err: any) {
      return Response.json({ success: false, message: "Server error: " + err.message });
    }
  }
};
