import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'users.json');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier');

    const data = await fs.readFile(dbPath, 'utf8');
    const users = JSON.parse(data);

    if (identifier) {
      const user = users.find((u: any) => u.email === identifier || u.phone === identifier);
      if (user) {
        return NextResponse.json({ success: true, user });
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to access database' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    let users = [];
    
    try {
      const existing = await fs.readFile(dbPath, 'utf8');
      users = JSON.parse(existing);
    } catch(e) {} 
    
    // Check if exists
    if (users.find((u: any) => u.email === json.email)) {
       return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const newUser = { id: Date.now().toString(), ...json, createdAt: new Date().toISOString() };
    users.push(newUser);
    
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2));
    
    return NextResponse.json({ success: true, user: newUser });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to register account.' }, { status: 500 });
  }
}
