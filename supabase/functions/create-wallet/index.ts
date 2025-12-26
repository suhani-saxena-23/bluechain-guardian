import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function generateWalletAddress(): string {
  const chars = '0123456789ABCDEF';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: existingWallet } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingWallet) {
      return new Response(
        JSON.stringify({ wallet: existingWallet }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const walletAddress = generateWalletAddress();

    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .insert({
        user_id: user.id,
        address: walletAddress,
        balance_inr: 0,
      })
      .select()
      .single();

    if (walletError) {
      throw walletError;
    }

    const defaultAssets = [
      { name: 'Blue Carbon Credits', symbol: 'BCC', balance: 0, inr_value: 0, icon: '🌊' },
      { name: 'USD Coin', symbol: 'USDC', balance: 0, inr_value: 0, icon: '💵' },
      { name: 'Ethereum', symbol: 'ETH', balance: 0, inr_value: 0, icon: '⟠' },
      { name: 'Polygon', symbol: 'MATIC', balance: 0, inr_value: 0, icon: '🟣' },
    ];

    await supabaseClient
      .from('assets')
      .insert(
        defaultAssets.map(asset => ({
          wallet_id: wallet.id,
          ...asset,
        }))
      );

    return new Response(
      JSON.stringify({ success: true, wallet }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});