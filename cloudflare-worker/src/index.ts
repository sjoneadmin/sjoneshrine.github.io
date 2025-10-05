export default {
  async fetch(request: Request, env: any) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const { action, username, password } = await request.json();
    if (!username || !password) return new Response(JSON.stringify({ success:false, error:'Missing username or password' }), { status:400 });

    const userKey = username.toLowerCase();

    if(action==='signup'){
      if(await env.SJONE_USERS.get(userKey)) return new Response(JSON.stringify({ success:false, error:'Username exists' }), { status:400 });
      await env.SJONE_USERS.put(userKey,password);
      return new Response(JSON.stringify({ success:true, message:'Account created successfully' }));
    }

    if(action==='login'){
      const stored = await env.SJONE_USERS.get(userKey);
      if(!stored) return new Response(JSON.stringify({ success:false, error:'User not found' }), { status:400 });
      if(stored===password) return new Response(JSON.stringify({ success:true, message:'Login successful' }));
      return new Response(JSON.stringify({ success:false, error:'Incorrect password' }), { status:400 });
    }

    return new Response(JSON.stringify({ success:false, error:'Invalid action' }), { status:400 });
  }
};
