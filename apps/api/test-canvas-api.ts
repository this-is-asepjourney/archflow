async function testApi() {
  try {
    // 1. Register/Login
    const email = `test-${Date.now()}@test.com`;
    console.log('Registering user...');
    await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123', name: 'Tester' }),
    });

    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    const authData = await loginRes.json();
    const token = authData.access_token;
    console.log('Got token:', token ? 'YES' : 'NO');

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Create workspace
    console.log('Creating workspace...');
    const wsRes = await fetch('http://localhost:4000/api/workspaces', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Test WS' }),
    });
    const workspace = await wsRes.json();

    // 3. Create project
    console.log('Creating project...');
    const projRes = await fetch('http://localhost:4000/api/projects', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Test Project', workspaceId: workspace.id }),
    });
    const project = await projRes.json();

    // 4. Create Canvas
    console.log('Creating canvas...');
    const canvasRes = await fetch(
      `http://localhost:4000/api/projects/${project.id}/canvas`,
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Test Canvas via API',
          type: 'TOPOLOGY',
        }),
      },
    );
    const canvas = await canvasRes.json();

    if (!canvasRes.ok) {
      console.error('API Error:', canvas);
    } else {
      console.log('Success! Canvas:', canvas.id);
    }
  } catch (e: any) {
    console.error('API Error:', e.message);
  }
}

testApi();
