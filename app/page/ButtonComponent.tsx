// app/components/ButtonComponent.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import React, { useState } from 'react';

// const supabase = createClient('https://qiekvvwcicienqtinxmo.supabase.co/functions/v1/resend', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabase = createClient("https://qiekvvwcicienqtinxmo.supabase.co/functions/v1/resend", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ButtonComponent() {
  const [netID, setNetID] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleClick = async () => {
    const { data, error } = await supabase.functions.invoke('resend', {
      body: { netID, trackingId }
    });

    if (error) {
      console.error('Error invoking function:', error);
    } else {
      console.log('Function response data:', data);
    }
  };

  return (
    <>
    <p>Net ID:</p>
    <input type="text" name="netID" value={netID} onChange={(e) => setNetID(e.target.value)} />
    <p>Tracking ID:</p>
    <input type="text" name="tracking-id" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
    <br/>
    <button onClick={handleClick}>
      Click Me
    </button>
    </>
  );
}
