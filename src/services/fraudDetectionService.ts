
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface TicketTransaction {
  ticketId: string;
  timestamp?: string;
  station: string;
  amount: number;
}

export interface FraudDetectionResult {
  ticketId: string;
  timestamp: string;
  station: string;
  amount: number;
  fraudScore: number;
  status: 'pending' | 'flagged' | 'cleared';
  processedAt: string;
}

export const fraudDetectionService = {
  /**
   * Analyze a ticket transaction for potential fraud
   */
  async analyzeTransaction(transaction: TicketTransaction): Promise<FraudDetectionResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('detect-fraud', {
        body: transaction
      });

      if (error) {
        console.error("Error calling fraud detection API:", error);
        toast({
          title: "Error",
          description: "Failed to analyze transaction. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      return data as FraudDetectionResult;
    } catch (error) {
      console.error("Exception in fraud detection:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  },

  /**
   * Get recent transactions from the database
   */
  async getTransactions(limit = 100): Promise<FraudDetectionResult[]> {
    try {
      const { data, error } = await supabase
        .from('ticket_transactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        });
        return [];
      }

      // Convert database format to frontend format
      return data.map(item => ({
        ticketId: item.ticket_id,
        timestamp: item.timestamp,
        station: item.station,
        amount: Number(item.amount),
        fraudScore: item.fraud_score || 0,
        status: item.status as 'pending' | 'flagged' | 'cleared',
        processedAt: item.created_at
      }));
    } catch (error) {
      console.error("Exception fetching transactions:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading transactions.",
        variant: "destructive",
      });
      return [];
    }
  },

  /**
   * Update the status of a transaction
   */
  async updateTransactionStatus(id: string, status: 'pending' | 'flagged' | 'cleared'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ticket_transactions')
        .update({ status })
        .eq('ticket_id', id);

      if (error) {
        console.error("Error updating transaction:", error);
        toast({
          title: "Error",
          description: "Failed to update transaction status.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: `Transaction ${id} marked as ${status}.`,
      });
      return true;
    } catch (error) {
      console.error("Exception updating transaction:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the transaction.",
        variant: "destructive",
      });
      return false;
    }
  }
};
