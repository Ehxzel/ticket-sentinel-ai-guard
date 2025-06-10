
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ticketId, timestamp, station, amount } = await req.json()
    
    console.log("Running fraud detection on:", {
      ticketId,
      timestamp,
      station,
      amount
    });

    // Simple fraud detection algorithm
    let fraudScore = 0;
    
    // Base risk factors
    if (amount > 100) fraudScore += 0.3;
    if (amount < 1) fraudScore += 0.4;
    
    // Station-based risk
    if (station === 'East Station' || station === 'Central Station') {
      fraudScore += 0.2;
    }
    
    // Time-based risk (if it's very late or very early)
    const hour = new Date(timestamp || Date.now()).getHours();
    if (hour < 5 || hour > 23) {
      fraudScore += 0.15;
    }
    
    // Add some randomness to simulate ML model
    fraudScore += Math.random() * 0.3;
    
    // Cap at 1.0
    fraudScore = Math.min(fraudScore, 1.0);
    
    // Determine status based on fraud score
    let status = 'pending';
    if (fraudScore > 0.7) {
      status = 'flagged';
    } else if (fraudScore < 0.3) {
      status = 'cleared';
    }

    const result = {
      ticketId,
      timestamp: timestamp || new Date().toISOString(),
      station,
      amount: Number(amount),
      fraudScore: Number(fraudScore.toFixed(3)),
      status,
      processedAt: new Date().toISOString()
    };

    console.log("Fraud detection result:", { fraudScore: result.fraudScore, status: result.status });

    // Store the transaction in the database
    const { data: insertData, error: insertError } = await supabase
      .from('ticket_transactions')
      .insert({
        ticket_id: result.ticketId,
        timestamp: result.timestamp,
        station: result.station,
        amount: result.amount,
        fraud_score: result.fraudScore,
        status: result.status
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting transaction:", insertError);
      throw insertError;
    }

    console.log("Transaction stored successfully:", insertData);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Error in fraud detection:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
