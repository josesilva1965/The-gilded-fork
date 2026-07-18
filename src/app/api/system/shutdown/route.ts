import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req: Request) {
  // Use trim to avoid Windows .bat trailing space issues
  if (process.env.NEXT_PUBLIC_IS_LOCAL_KIOSK?.trim() !== 'true') {
    return NextResponse.json({ error: 'Shutdown not permitted in this environment.' }, { status: 403 });
  }

  console.log('Attempting to gracefully close the kiosk browser window...');
  
  // Send WM_CLOSE to the specific Chrome/Edge window by matching its title.
  // We omit /F so it's a graceful close (like clicking the X), avoiding killing the whole browser.
  exec('taskkill /FI "WINDOWTITLE eq The Gilded Fork*" /IM chrome.exe');
  exec('taskkill /FI "WINDOWTITLE eq The Gilded Fork*" /IM msedge.exe');

  // Schedule a clean shutdown of the Node.js server after sending the response
  setTimeout(() => {
    console.log('--- LOCAL KIOSK SHUTDOWN INITIATED ---');
    process.exit(0);
  }, 1000);

  return NextResponse.json({ success: true, message: 'Server is shutting down.' });
}
