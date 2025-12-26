import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

    const { credits, price_per_credit } = await req.json();

    if (!credits || !price_per_credit || credits <= 0 || price_per_credit <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid purchase amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const inr_amount = credits * price_per_credit;

    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('id, address')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      throw walletError;
    }

    if (!wallet) {
      return new Response(
        JSON.stringify({ error: 'Wallet not found. Please create a wallet first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        credits,
        price_per_credit,
        inr_amount,
        wallet_hash: wallet.address,
        status: 'completed',
      })
      .select()
      .single();

    if (purchaseError) {
      throw purchaseError;
    }

    const { data: bccAsset, error: assetError } = await supabaseClient
      .from('assets')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('symbol', 'BCC')
      .maybeSingle();

    if (assetError) {
      throw assetError;
    }

    if (bccAsset) {
      await supabaseClient
        .from('assets')
        .update({
          balance: Number(bccAsset.balance) + Number(credits),
          inr_value: Number(bccAsset.inr_value) + Number(inr_amount),
        })
        .eq('id', bccAsset.id);
    } else {
      await supabaseClient
        .from('assets')
        .insert({
          wallet_id: wallet.id,
          name: 'Blue Carbon Credits',
          symbol: 'BCC',
          balance: credits,
          inr_value: inr_amount,
          icon: '🌊',
        });
    }

    await supabaseClient
      .from('transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'buy',
        token: 'BCC',
        amount: credits,
        inr_value: inr_amount,
        status: 'completed',
      });

    return new Response(
      JSON.stringify({ success: true, purchase }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});