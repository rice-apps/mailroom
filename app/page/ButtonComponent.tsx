// app/components/ButtonComponent.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import React, { useState } from 'react';

const supabase = createClient('http://127.0.0.1:54321/functions/v1/resend', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ButtonComponent() {
  const [name, setName] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleClick = async () => {
    const { data, error } = await supabase.functions.invoke('resend', {
      body: { name, trackingId }
    });

    if (error) {
      console.error('Error invoking function:', error);
    } else {
      console.log('Function response data:', data);
    }
  };

  return (
    <>
    <p>Name:</p>
    <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
    <p>Tracking ID:</p>
    <input type="text" name="tracking-id" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
    <br/>
    <button onClick={handleClick}>
      Click Me
    </button>
    </>
  );
}
