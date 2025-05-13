
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ML model placeholder - would be replaced with actual ML inference code
function runFraudDetection(transactionData) {
  console.log("Running fraud detection on:", transactionData);
  
  // Placeholder logic to simulate ML model
  // In a real implementation, this would call an ML model API or run inference logic
  const ticketId = transactionData.ticketId || "";
  const amount = transactionData.amount || 0;
  const station = transactionData.station || "";
  
  // Simplified fraud scoring logic - would be replaced with actual ML model
  let fraudScore = 0.1; // Base score
  
  // Add some randomness but ensure consistent results for the same ticket
  const ticketSeed = ticketId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (Math.sin(ticketSeed) + 1) / 2;
  
  // Fake detection rules for the demo
  if (amount > 7) fraudScore += 0.2;
  if (station.includes("Central") || station.includes("East")) fraudScore += 0.15;
  if (ticketId.endsWith("7") || ticketId.endsWith("1")) fraudScore += 0.4;
  
  // Add controlled randomness
  fraudScore += pseudoRandom * 0.3;
  
  // Ensure score is between 0 and 1
  fraudScore = Math.min(0.99, Math.max(0.01, fraudScore));
  
  // Round to 3 decimal places
  fraudScore = Math.round(fraudScore * 1000) / 1000;
  
  return {
    fraudScore: fraudScore,
    status: fraudScore > 0.7 ? "flagged" : (fraudScore > 0.4 ? "pending" : "cleared")
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Get request body
    const body = await req.json();
    const { ticketId, timestamp, station, amount } = body;
    
    if (!ticketId || !station || amount === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
    
    // Run fraud detection model
    const fraudResult = runFraudDetection({
      ticketId,
      timestamp: timestamp || new Date().toISOString(),
      station,
      amount
    });
    
    console.log("Fraud detection result:", fraudResult);
    
    // Create response with fraud detection results
    const response = {
      ticketId,
      timestamp: timestamp || new Date().toISOString(),
      station,
      amount,
      fraudScore: fraudResult.fraudScore,
      status: fraudResult.status,
      processedAt: new Date().toISOString()
    };
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Store the transaction with fraud analysis results
    const { data, error } = await supabaseClient
      .from('ticket_transactions')
      .insert([{
        ticket_id: ticketId,
        timestamp: timestamp || new Date().toISOString(),
        station,
        amount,
        fraud_score: fraudResult.fraudScore,
        status: fraudResult.status
      }]);
      
    if (error) {
      console.error("Error storing transaction:", error);
    }
    
    // Return the result to the client
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
});
