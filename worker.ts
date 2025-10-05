export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Only POST allowed" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const { action, username, password } = await request.json();

      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: "Missing username or password" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (action === "signup") {
        await env.SHRINE_USERS.prepare(
          `CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT
          )`
        ).run();

        try {
          await env.SHRINE_USERS.prepare(
            "INSERT INTO users (username, password) VALUES (?, ?)"
          ).bind(username, password).run();

          return new Response(JSON.stringify({ success: true, message: "Signup successful" }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, message: "Username already exists" }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (action === "login") {
        const result = await env.SHRINE_USERS.prepare(
          "SELECT password FROM users WHERE username = ?"
        ).bind(username).first();

        if (!result) {
          return new Response(JSON.stringify({ success: false, message: "User not found" }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        if (result.password === password) {
          return new Response(JSON.stringify({ success: true, message: "Login successful" }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ success: false, message: "Incorrect password" }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ success: false, message: "Invalid action" }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: "Error processing request" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
